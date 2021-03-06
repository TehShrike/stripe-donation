const createRouter = require('koa-bestest-router')
const Stripe = require('stripe')

const createEmailSender = require('./email-sender')

module.exports = function createServer({ stripeSecretKey, stripePlanId, subscriptionDescription, email }) {
	const sendEmails = createEmailSender(email)

	const stripe = Stripe(stripeSecretKey)

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

	return createRouter({
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
		}
	})
}

function promisify(object, methodName) {
	return options => new Promise((resolve, reject) => {
		object[methodName](options, (err, data) => {
			err ? reject(err) : resolve(data)
		})
	})
}
