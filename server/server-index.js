require('loud-rejection/register')

const Koa = require('koa')
const serve = require('koa-static')
const router = require('koa-router')()
const compress = require('koa-compress')
const conditionalGet = require('koa-conditional-get')
const bodyParser = require('koa-bodyparser')


const app = new Koa()

const stripeKey = process.env.STRIPE_API_KEY
const donationPlanId = process.env.STRIPE_PLAN_ID || 'test-generic-donation'

console.log('Starting Stripe with key', stripeKey)

const stripe = require('stripe')(stripeKey)

const createSubscription = promisify(stripe.subscriptions, 'create')
const createCustomer = promisify(stripe.customers, 'create')
const createCharge = promisify(stripe.charges, 'create')

function promisify(object, methodName) {
	return options => new Promise((resolve, reject) => {
		object[methodName](options, (err, data) => {
			err ? reject(err) : resolve(data)
		})
	})
}

const paymentFrequencies = {
	monthly: async ({ email, token, dollars }) => {
		console.log('Creating a monthly subscription for', email, 'with token', token, 'and quantity', dollars)
		const customer = await createCustomer({
			email,
			source: token
		})
		await createSubscription({
			customer: customer.id,
			plan: donationPlanId,
			quantity: dollars
		})

		return {
			message: `Successfully created a subscription for ${email}!`
		}
	},
	once: async ({ email, token, dollars }) => {
		console.log('Creating a single donation for', email, 'with token', token, 'for', dollars, 'dollars')
		await createCharge({
			amount: dollars * 100,
			currency: 'usd',
			description: 'Biblical Blueprints donation',
			source: token
		})
		return {
			message: `Successfully created a single donation for ${email}!`
		}
	}
}

router.post('/submit-donation/:frequency(monthly|once)', async (context, next) => {
	const { email, token, dollars } = context.request.body
	const { frequency } = context.params

	context.set('Content-Type', 'application/json')

	console.log('Creating customer for', email, 'with source', token)

	const createPayment = paymentFrequencies[frequency]

	try {
		context.body = await createPayment({ email, token, dollars })
	} catch (e) {
		context.status = 500
		console.log('error:', e.message, e)
		context.body = e.message
	}

	console.log('responding with', context.body)
})


app.use(conditionalGet())

app.use(bodyParser())

app.use(compress())

app.use(router.routes())

app.use(serve('./public/'))

module.exports = app
