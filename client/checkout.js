export default function createCheckoutOpenFunction(stripeCheckoutOptions) {
	let resolveToken = null
	const handler = StripeCheckout.configure(Object.assign({
		token: token => resolveToken(token)
	}, stripeCheckoutOptions))

	return options => {
		const { amount, dollars, frequency, name, description } = options
		return new Promise((resolve, reject) => {
			resolveToken = result => resolve(Object.assign({ dollars, frequency }, result))
			handler.open({
				amount,
				name,
				description
			})
		})
	}
}
