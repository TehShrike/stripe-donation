export default function createAction(widget, callback, errorCallback, behaviorFunction) {
	return (...args) => {
		const behaviorResult = behaviorFunction(...args)

		behaviorResult.then(result => callback.call(widget, result))

		behaviorResult.catch(err => errorCallback.call(widget, err))
	}
}
