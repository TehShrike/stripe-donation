import DonationWidget from './DonationWidget.html'
import post from './post'
import createCheckoutOpenFunction from './checkout'
import createAction from './create-action'

const widget = new DonationWidget({
	target: document.getElementById('target')
})

const postDonation = donationDetails => post(`/submit-donation/${donationDetails.frequency}`, donationDetails)
const donationAction = createAction(widget, widget.handleDonationPostResponse, widget.handleError, postDonation)
widget.on('submitDonation', donationAction)

const openCheckout = createCheckoutOpenFunction()
const checkoutAction = createAction(widget, widget.handleToken, widget.handleError, openCheckout)
widget.on('openCheckout', checkoutAction)
