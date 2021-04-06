'use strict';

var fs = require('fs');
var myEvent = require('./event.js');


function getMime(ext) {
	switch (ext) {
		case "html":
			return "text/html";
		case "css":
			return "text/css";
		case "js":
			return "application/javascript";
		case "map":
			return "application/json";
		case "png":
			return "image/png";
		case "ico":
			return "image/x-icon";
		case "svg":
			return "image/svg+xml";
		default:
			return "application/otect-stream";
	}
}

function resourceResult(file) {
	try {
		var data = fs.readFileSync("build/" + file).toString();
	} catch (ex) {
		console.error(ex);
		return errorResult(500, "Server file error");
	}
	return {
		statusCode: 200,
		headers: {'Content-Type': getMime(file.split('.').pop())},
		body: data,
	};
}

function errorResult(code, msg) {
	return {
		statusCode: code,
		headers: {'Content-Type': "text/plain"},
		body: msg,
	};
}

module.exports.webResource = async (event) => {
	try {
		event = myEvent.fixupEvent(event);
		console.log(event);

		if (event.requestContext.http.method !== "GET") {
			console.log("Invalid method", event);
			return errorResult(400, "Invalid method");
		}

		var path = (event.rawPath + "").replace(/^\/+/g, "");//strip leading "/"
		// console.log("path " + event.path);
		switch (path) {
			case '':
				return resourceResult("index.html");
			case 'main.css':
			case 'main.css.map':
			case 'main.js':
			case 'main.js.map':
			case 'favicon.ico':
			case 'favicon.svg':
				return resourceResult(path);
			default:
				return errorResult(404, "Not found");
		}
	} catch (ex) {
		console.error(ex, event);
		return errorResult(500, "Server run error");
	}
};


