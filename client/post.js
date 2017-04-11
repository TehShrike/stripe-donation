export default function post(url, data) {
	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest()
		request.addEventListener('load', handleResult)
		request.addEventListener('error', reject)
		request.addEventListener('abort', reject)
		request.open('POST', url)
		request.setRequestHeader('Content-Type', 'application/json')
		request.send(JSON.stringify(data))

		function handleResult() {
			try {
				const response = JSON.parse(request.responseText)

				success(request) ? resolve(response) : reject(response)
			} catch (e) {
				reject('Invalid response: ' + request.responseText)
			}
		}
	})
}

const success = request => request.status >= 200 && request.status < 400
