import DonationWidget from './DonationWidget.html'

const widget = new DonationWidget({
	target: document.getElementById('target')
})

const handler = StripeCheckout.configure({
	key: 'pk_test_aK1m1Va97O5mDHkJzxU83okp',
	// image: 'http://localhost.com:8888/bb.png',
	locale: 'auto',
	token: token => {
		widget.set({ token })
		console.log('wat?', token)
		// this.set({
		// 	token
		// })
		// You can access the token ID with `token.id`.
		// Get the token ID to your server-side code for use.
	}
})

widget.set({ handler })
