Work in progress.  A donation site meant to be embedded as a widget (via iframe probably) on non-profit web sites.

Use like this

```js
const nodemailerTransportOptions = {
	service: 'Outlook365',
	auth: {
		user: 'noreply@coolnonprofitco.org',
		pass: 'supersecr3t'
	}
}

const receiptEmailOptions = {
	from: 'noreply@coolnonprofitco.org',
	subject: 'Thank you for your donation to Cool NonProfitCo!',
	text: ({ frequency, dollars }) => `
Thank you for ${frequency === 'once' ? `your` : `setting up a monthly`} donation of ${dollars} dollars!

${frequency === 'once' ? '' : `If you have any questions or would like to cancel your donation, send an email to donations@coolnonprofitco.org.`}

If you haven't already, consider signing up for email updates to hear about what we accomplish: http://eepurl.com/bqCwej
`,
	html: ({ frequency, dollars }) => `
<h2>Thank you!</h2>

<p>Thank you for ${frequency === 'once' ? `your` : `setting up a monthly`} donation of ${dollars} dollars!</p>

${frequency === 'once' ? '' : `<p>If you have any questions or would like to cancel your donation, send an email to donations@coolnonprofitco.org.</p>`}

<p>If you haven't already, consider <a href="http://eepurl.com/bqCwej">signing up for email updates</a> to hear about what we accomplish.</p>
`
}

const donationDetailsTemplate = ({ frequency, dollars, email }) => `New ${frequency === 'once' ? 'one-time donation' : 'monthly subscription'} for ${dollars}$ from ${email}`
const logEmailOptions = {
	from: 'noreply@coolnonprofitco.org',
	to: 'me@JoshDuff.com',
	subject: donationDetailsTemplate,
	text: donationDetailsTemplate,
	html: input => `<p>${donationDetailsTemplate(input)}</p>`,
}

require('stripe-donation')({
	email: {
		nodemailerTransportOptions,
		receiptEmailOptions,
		logEmailOptions,
	},
	stripeSecretKey: process.env.STRIPE_API_KEY,
	stripePlanId: process.env.STRIPE_PLAN_ID || 'test-generic-donation',
	subscriptionDescription: 'Cool NonProfitCo donation',
	bodyStyle: `
		background-color: #faf7ee;
`
}).listen(process.env.PORT || 8000)

```
