var process = require("process");
var config = require('./config');

var timeOffset = null;
var lastTimeSync = null;

function randomItems(list, count = 1) {
	if (count >= list.length) return [...list];
	var ret = [];
	var usedIndexes = {};
	while (ret.length < count) {
		var idx = Math.floor(Math.random() * list.length);
		if (usedIndexes[idx]) continue;
		usedIndexes[idx] = true;
		ret.push(list[idx]);
	}

	return ret;
}

function sendReply(event, message) {
	return new Promise((resolve, reject) => {
		var endpoint;
		if (event.requestContext.domainName === "localhost") {
			endpoint = "http://localhost:3001";
		} else {
			throw new Error("not implemented")
			endpoint = `https://${event.requestContext.domainName}/${event.requestContext.stage}`;
		}

		var gateway = new AWS.ApiGatewayManagementApi({
			apiVersion: '2018-11-29',
			endpoint: endpoint,
		});

		gateway.postToConnection({
			ConnectionId: event.requestContext.connectionId,
			Data: JSON.stringify(message),
		}, (err, data) => {
			if (err) reject(err);
			else resolve(data);
		});
	});
}


module.exports.time = async (event) => {
	try {
		// console.log("time event", event, process.env);
		// await sendReply(event, {
		// 	action: "time",
		// 	reqEpoch: event.requestContext.timeEpoch,
		// 	svEpoch: Date.now(),
		// });

		return {
			statusCode: 200,
			body: JSON.stringify({
				reqEpoch: event.requestContext.timeEpoch,
				svEpoch: Date.now(),
			}),
		};

	} catch (ex) {
		console.error(ex);
		return {statusCode: 500};
	}
};