

module.exports.baseHit = async (event) => {
	return {
		statusCode: 200,
		headers: {
			'Content-Type': "application/json",
			'Cache-Control': "no-store",
		},
		body: JSON.stringify({
			you: event.headers['x-forwarded-for'] || event.requestContext.http.sourceIp,
			reqEpoch: event.requestContext.timeEpoch,
			svEpoch: Date.now(),
		}),
	}
};