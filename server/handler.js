'use strict';

var fs = require('fs');
var myEvent = require('./event.js');
var moduleList = require('./moduleList.js');
var moduleListLowercase = moduleList.map(x => x.toLowerCase());

var staticResources = [
	'main.css',
	'main.css.map',
	'main.js',
	'main.js.map',
	'favicon.ico',
	'favicon.svg',
];

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

function redirectResult(newURL, isPerm = true) {
	return {
		statusCode: isPerm ? 301 : 302,
		headers: {'Location': newURL},
		body: '',
	};
}

module.exports.webResource = async (event) => {
	//console.log(event);
	try {
		event = myEvent.fixupEvent(event);

		if (event.requestContext.http.method !== "GET") {
			console.log("Invalid method", event);
			return errorResult(400, "Invalid method");
		}


		var path = (event.rawPath + "").replace(/^\/+/g, "");//strip leading "/"
		var softerPath = (path + "").replace(/\/+$/g, "");//strip trailing "/" too
		var idx;
		// console.log("path " + path);

		// if (path.match(/css/)) await new Promise(r => setTimeout(r, 500));//debug test
		// if (path.match(/js/)) await new Promise(r => setTimeout(r, 500));//debug test

		if (path === "")  {
			return resourceResult("index.html");
		} else if (staticResources.indexOf(path) >= 0) {
			return resourceResult(path);
		} else if ((idx = moduleListLowercase.indexOf(softerPath.toLowerCase())) >= 0) {
			if (moduleList[idx] !== path) {
				//wRoNg cAps, or trailing "/"
				return redirectResult("/" + moduleList[idx]);
			}

			return resourceResult("index.html");
		} else {
			return errorResult(404, "Not found");
		}
	} catch (ex) {
		console.error(ex, event);
		return errorResult(500, "Server run error");
	}
};


