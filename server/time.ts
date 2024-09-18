import * as websocket from 'websocket'

import {log as reqLog} from './usageLogger'


export function onTimeWSConnection(conn: websocket.connection) {
	conn.on('error', (err: any) => {
		if (err.code === "ECONNRESET") return
		console.error("ws conn error:", err)
	})

	//todo: collect and send NTP stats here

	conn.on('message', (msg: websocket.Message) => {
		let t2 = Date.now()
		try {
			if (msg.type !== "utf8") {
				conn.drop(1003)
				reqLog("/Time/api", msg.binaryData.length)
				return
			}

			reqLog("/Time/api", msg.utf8Data.length)//not exact byte count, that's okay

			var data = JSON.parse(msg.utf8Data)

			if (data["action"] !== "time") {
				conn.drop(1002)
				return
			}

			conn.send(JSON.stringify({
				action: "time",
				t1: data['t1'],
				t2: t2,
				t3: Date.now(),
			}))

		} catch (ex) {
			console.error("WS message handling error:", ex)
			conn.drop(1011)
		}
	})
}


// export function startTimeListener() {
// 	...websockets...console.
// }
