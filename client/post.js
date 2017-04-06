export default function post(url, data) {
	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest()
		request.addEventListener('load', () => resolve(JSON.parse(request.responseText)))
		request.addEventListener('error', reject)
		request.addEventListener('abort', reject)
		request.open('POST', url)
		request.setRequestHeader('Content-Type', 'application/json')
		request.send(JSON.stringify(data))
	})
}
