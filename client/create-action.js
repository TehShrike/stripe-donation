export default function createAction(widget, callback, errorCallback, behaviorFunction) {
	return (...args) => behaviorFunction(...args)
		.catch(err => errorCallback.call(widget, err))
		.then(result => callback.call(widget, result))
}
