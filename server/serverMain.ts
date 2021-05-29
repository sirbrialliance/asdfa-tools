import * as fs from 'fs'
import * as process from 'process'

import * as spdy from 'spdy'
import * as express from 'express'
import {server as WebSocketServer} from 'websocket'

import contentList from './contentList'
import config from './config'
import usageLogger from './usageLogger'
import * as time from './time'

var moduleList = contentList.modules
var moduleListLowercase = moduleList.map(x => x.toLowerCase())

const certFiles = {
	cert: fs.readFileSync(config.certFile),
	key: fs.readFileSync(config.keyFile),
}

function addPush(res: express.Response, url: string, type: string) {
	//http 2 or 3 server push resources (https://www.cloudflare.com/website-optimization/http2/serverpush/)
	res.append("Link", `<${url}>; rel=preload; as=${type}`)
}

function pushBaseResources(res: express.Response) {
	addPush(res, "/main.min.js", "script")
	addPush(res, "/main.css", "style")
	addPush(res, "/logo.png", "image")
}

let app = express()

app.use(usageLogger)

app.get("/", (req, res) => {
	pushBaseResources(res)
	res.status(200)
	res.sendFile("index.html", {root: "web"})
})

app.use(express.static('web', {
	setHeaders: (res, path, stat) => {
		if (path.indexOf(".") < 0) {
			//should be a page getting returned, add push
			pushBaseResources(res)
		}
	},
}))

app.get(/./, (req, res, next) => {
	var path = req.path.replace(/^\/+/g, "") //strip leading "/"
	var softerPath = path.replace(/\/+$/g, "") //strip trailing "/" too

	var idx
	if ((idx = moduleListLowercase.indexOf(softerPath.toLowerCase())) >= 0) {
		if (moduleList[idx] !== path) {
			//wRoNg cAps, or trailing "/"
			var newPath = "/" + moduleList[idx]

			res.status(301)
			res.header("Location", newPath)
			addPush(res, newPath, "document")
			pushBaseResources(res)

			res.send()
			return
		} else {
			//A specific module, send index.html
			pushBaseResources(res)
			res.status(200)
			res.sendFile("index.html", {root: "web"})
			return
		}
	}
	next()
})

let server = spdy.createServer({...certFiles,}, app)

server.listen(config.port)

let wsServer = new WebSocketServer({httpServer: server, disableNagleAlgorithm: true})

wsServer.on('request', req => {
	req.socket.on('error', (err: any) => {
		if (err.code === "ECONNRESET") return
		console.error("ws sock err", err)
	})

	if (!config.validHosts.includes(req.host)) {
		req.reject(403)
		return
	}

	if (req.resource === "/Time/api") {
		time.onTimeWSConnection(req.accept())
		return
	}

	req.reject(404)
})


