export default function createCheckoutOpenFunction() {
	let resolveToken = null
	const handler = StripeCheckout.configure({
		key: 'pk_test_aK1m1Va97O5mDHkJzxU83okp',
		image: './bb.png',
		locale: 'auto',
		token: token => resolveToken(token)
	})

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
