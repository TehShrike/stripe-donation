const pathMatch = require('path-match')
const parseUrl = require('url').parse

const createRouteMatcher = pathMatch()

module.exports = function createRouter(methodsToRouteMaps, { set404 = false } = {}) {
	validateInputMap(methodsToRouteMaps)
	const methodsToRouteArrays = mapObject(methodsToRouteMaps, routeMapToArray)

	return async function middleware(context, next) {
		const { method, url } = context
		const routes = methodsToRouteArrays[method]
		if (routes) {
			const path = parseUrl(url).pathname

			const matched = returnFirst(routes, ({ matcher, handler }) => {
				const params = matcher(path)

				return params && {
					params,
					handler
				}
			})

			if (matched) {
				const { params, handler } = matched
				context.params = params

				await handler(context, next)
			} else {

				if (set404) {
					context.status = 404
				}

				await next()
			}
		}
	}
}

function entries(o) {
	return Object.keys(o).map(key => {
		return [ key, o[key] ]
	})
}

function mapObject(o, fn) {
	return entries(o).reduce((map, [ key, value ]) => {
		map[key]  = fn(value)
		return map
	}, Object.create(null))
}

// [routeString]: handler
function routeMapToArray(methodHandlers) {
	return entries(methodHandlers).map(([ routeString, handler ]) => {
		const matcher = createRouteMatcher(routeString)
		return { matcher, handler }
	})
}

function returnFirst(ary, fn) {
	return ary.reduce((result, input) => {
		if (result) return result

		return fn(input)
	}, null)
}

function validateInputMap(methodsToRouteMaps) {
	const methods = Object.keys(methodsToRouteMaps)
	methods.forEach(method => {
		if (method.toUpperCase() !== method) {
			throw new Error(`Bad method - you probably want to uppercase '${method}'`)
		}
	})
}
