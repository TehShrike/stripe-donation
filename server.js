require('./server/server-index')({
	stripeSecretKey: process.env.STRIPE_API_KEY,
	stripePlanId: process.env.STRIPE_PLAN_ID || 'test-generic-donation',
	subscriptionDescription: 'Biblical Blueprints donation',
	bodyStyle: `
		background-color: #faf7ee;
`
}).listen(process.env.PORT || 8888)
