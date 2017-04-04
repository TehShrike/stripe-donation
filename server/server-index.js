require('loud-rejection/register')

const Koa = require('koa')
const serve = require('koa-static')
const router = require('koa-router')()
const compress = require('koa-compress')
const conditionalGet = require('koa-conditional-get')

const app = new Koa()

router.post('/submit-donation', async (context, next) => {
	const { token } = context.params

	context.set('Content-Type', 'application/javascript')

	if (context.stale) {
		await next()
		context.body = `{ "yes": true }`
	}
})

app.use(conditionalGet())

app.use(compress())

app.use(router.routes())

app.use(serve('./public/'))

module.exports = app
