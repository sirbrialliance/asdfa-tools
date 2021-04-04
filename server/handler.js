'use strict';

//Result object definition:
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/8ca303207015f9cbdbc0e548ad480a2258c9962d/types/aws-lambda/trigger/api-gateway-proxy.d.ts#L108
var fs = require('fs');

function getMime(ext) {
	switch (ext) {
		case "html":
			return "text/html";
		case "css":
			return "text/css";
		case "js":
			return "application/javascript";
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
	// console.log(event);
	try {
		var path = (event.path + "").replace(/^\/+/g, "");//strip leading "/"
		// console.log("path " + event.path);
		switch (path) {
			case '':
				return resourceResult("index.html");
			case 'main.css':
			case 'main.js':
				return resourceResult(path);
			default:
				return errorResult(404, "Not found");
		}
	} catch (ex) {
		console.error(ex, event);
		return errorResult(500, "Server run error");
	}
};
