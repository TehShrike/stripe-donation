const nodemailer = require('nodemailer')
const entries = require('ordered-entries')

module.exports = ({ nodemailerTransportOptions, receiptEmailOptions, logEmailOptions }) => {
	const transporter = nodemailer.createTransport(nodemailerTransportOptions)
	transporter.verify().catch(err => {
		console.error('Error verifying email transport')
		console.error(err.message || err)
		process.exit(1)
	})

	return async donationDetails => {
		const { email } = donationDetails

		const receiptEmailData = Object.assign({ to: email }, resolveFunctionProperties(receiptEmailOptions, donationDetails))

		const receiptPromise = transporter.sendMail(receiptEmailData)
		const logPromise = transporter.sendMail(resolveFunctionProperties(logEmailOptions, donationDetails))

		return Promise.all([
			receiptPromise,
			logPromise
		])
	}
}

function resolveFunctionProperties(object, argument) {
	return mapObject(object, value => {
		return typeof value === 'function' ? value(argument) : value
	})
}

function mapObject(o, fn) {
	return entries(o).reduce((map, [ key, value ]) => {
		map[key]  = fn(value)
		return map
	}, Object.create(null))
}
