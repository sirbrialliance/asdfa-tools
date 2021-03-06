import * as express from 'express'
import * as sqlite3 from 'sqlite3'
import * as sqlite from 'sqlite'

var db: sqlite.Database

(async () => {
	db = await sqlite.open({
		filename: "logs.sqlite",
		driver: sqlite3.Database,
	})
	await db.run("CREATE TABLE IF NOT EXISTS usage (day DATE, url TEXT, requests INTEGER, totalBytes DOUBLE, PRIMARY KEY(day, url))")

	console.log("DB ready")
})()

export async function log(url: string, bytes: number) {
	try {
		let day = new Date().toISOString().substr(0, 10)
		await db.run(`INSERT OR IGNORE INTO usage (day, url, requests, totalBytes) VALUES (?, ?, 0, 0)`, day, url)
		await db.run(`UPDATE usage SET requests = requests + 1, totalBytes = totalBytes + ? WHERE day = ? AND url = ?`, bytes, day, url)
	} catch (ex) {
		console.error("Error recording hit:", ex.stack, new Error('here'))
	}
}

export default function(req: express.Request, res: express.Response, next: express.NextFunction) {
	res.on('close', async () => {
		log(req.path, +res.getHeader("content-length") || 0)
	})
	next()
}

