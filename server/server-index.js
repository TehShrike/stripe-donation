require('loud-rejection/register')

const Koa = require('koa')
const serve = require('koa-static')
const compress = require('koa-compress')
const conditionalGet = require('koa-conditional-get')
const bodyParser = require('koa-bodyparser')
const createRouter = require('koa-bestest-router')

const createEmailSender = require('./email-sender')

const Stripe = require('stripe')

const indexHtmlTemplate = require('fs').readFileSync(__dirname + '/index.html', { encoding: 'utf8' })

module.exports = function createServer({ stripeSecretKey, stripePlanId, subscriptionDescription, bodyStyle, email }) {
	const sendEmails = createEmailSender(email)

	console.log('Starting Stripe with key', stripeSecretKey)
	const stripe = Stripe(stripeSecretKey)

	const indexHtml = indexHtmlTemplate.replace('<!-- style -->', () => `
		<style>
			body {
				${bodyStyle}
			}
		</style>
`)

	const app = new Koa()

	const createSubscription = promisify(stripe.subscriptions, 'create')
	const createCustomer = promisify(stripe.customers, 'create')
	const createCharge = promisify(stripe.charges, 'create')

	const paymentFrequencies = {
		monthly: async ({ email, token, dollars }) => {
			console.log('Creating a monthly donation for', email, 'with token', token, 'and quantity', dollars)
			const customer = await createCustomer({
				email,
				source: token
			})
			await createSubscription({
				customer: customer.id,
				plan: stripePlanId,
				quantity: dollars
			})

			return {
				message: `Successfully created a monthly donation for ${email}!`
			}
		},
		once: async ({ email, token, dollars }) => {
			console.log('Creating a single donation for', email, 'with token', token, 'for', dollars, 'dollars')
			await createCharge({
				amount: dollars * 100,
				currency: 'usd',
				description: subscriptionDescription,
				source: token
			})
			return {
				message: `Successfully processed a donation for ${email}!`
			}
		}
	}

	const routerMiddleware = createRouter({
		POST: {
			'/submit-donation/:frequency(monthly|once)': async (context, next) => {
				const { email, token, dollars } = context.request.body
				const { frequency } = context.params

				context.set('Content-Type', 'application/json')

				console.log('Creating customer for', email, 'with source', token)

				const createPayment = paymentFrequencies[frequency]

				try {
					context.body = await createPayment({ email, token, dollars })

					process.nextTick(() => {
						sendEmails({ email, frequency, dollars }).catch(err => {
							console.error('Error sending emails about the', dollars, 'donation by ', email, '(', frequency, ')')
							console.error(err.message && err)
						})
					})
				} catch (e) {
					context.status = 500
					console.log('payment processing error:', e.message, e)
					context.body = {
						error: true,
						message: e.message
					}
				}
			}
		},
		GET: {
			'/': async context => {
				context.body = indexHtml
			}
		}
	})

	app.use(conditionalGet())

	app.use(bodyParser())

	app.use(compress())

	app.use(routerMiddleware)

	app.use(serve('./public/'))

	return app
}

function promisify(object, methodName) {
	return options => new Promise((resolve, reject) => {
		object[methodName](options, (err, data) => {
			err ? reject(err) : resolve(data)
		})
	})
}
