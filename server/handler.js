'use strict';

var fs = require('fs');
var myEvent = require('./event.js');
var contentList = require('./contentList.js');
var moduleList = contentList.modules;
var moduleListLowercase = moduleList.map(x => x.toLowerCase());

var staticResources = contentList.webFiles;

var mimeTypes = {
	"html": "text/html",
	"css": "text/css",
	"js": "application/javascript",
	"map": "application/json",
	"png": "image/png",
	"ico": "image/x-icon",
	"svg": "image/svg+xml",
	"txt": "text/plain",
	"*": "application/otect-stream",
};

function getMime(ext) {
	return mimeTypes[ext] || mimeTypes['*'];
}

class Response {
	constructor() {
		this.clear();
	}

	clear() {
		this.statusCode = 500;
		this.headers = { 'x-foo-bar': 'baz' };
		this.body = null;
		// this.multiValueHeader = {};//doesn't work
		// this.multiValueHeaders = {};//doesn't work
		this.isBase64Encoded = false;
		return this;
	}

	resource(file) {
		try {
			this.body = fs.readFileSync("build/" + file).toString();
			this.statusCode = 200;
			this.headers['Content-Type'] = getMime(file.split('.').pop());
		} catch (ex) {
			console.error(ex);
			return this.error(500, "Server file error");
		}
		return this;
	}

	error(code, message) {
		this.clear();
		this.body = message;
		this.statusCode = code;
		this.headers['Content-Type'] = "text/plain";
		return this;
	}

	redirect(newURL, isPerm = true) {
		this.statusCode = isPerm ? 301 : 302;
		this.headers = {'Location': newURL};
		this.body = '';
		return this;
	}

	_addPush(url, as) {
		if (this.headers['Link']) this.headers['Link'] += ", ";
		else this.headers['Link'] = "";
		this.headers['Link'] += `<${url}>; rel=preload; as=${as}`;
	}

	//http 2 or 3 server push resources (https://www.cloudflare.com/website-optimization/http2/serverpush/)
	pushRes() {
		this._addPush("/main.js", "script");
		this._addPush("/main.css", "style");
		// this.multiValueHeader['Link'] = this.multiValueHeader['Link'] || [];
		// this.multiValueHeader['Link'].push(
		// 	"</main.js>; rel=preload;",
		// 	"</main.css>; rel=preload;",
		// );
		return this;
	}

	pushDocument(path) {
		this._addPush(path, "document");
		// this.multiValueHeader['Link'] = this.multiValueHeader['Link'] || [];
		// this.multiValueHeader['Link'].push("</>; rel=preload;");
		return this;
	}
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
		// console.log("path " + path, staticResources);

		// if (path.match(/css/)) await new Promise(r => setTimeout(r, 500));//debug test
		// if (path.match(/js/)) await new Promise(r => setTimeout(r, 500));//debug test

		if (path === "")  {
			return new Response().resource("index.html").pushRes();
		} else if (staticResources.indexOf(path) >= 0) {
			return new Response().resource(path);
		} else if ((idx = moduleListLowercase.indexOf(softerPath.toLowerCase())) >= 0) {
			if (moduleList[idx] !== path) {
				//wRoNg cAps, or trailing "/"
				var newPath = "/" + moduleList[idx];
				return new Response().redirect(newPath).pushDocument(newPath).pushRes();
			}

			//console.log("will send", new Response().resource("index.html").pushRes());

			return new Response().resource("index.html").pushRes();
		} else {
			return new Response().error(404, "Not found");
		}
	} catch (ex) {
		console.error(ex, event);
		return new Response().error(500, "Server run error");
	}
};


