/**
 * Facilitates establishing a WebRTC connection between clients.
 */
import * as websocket from 'websocket'

import {log as reqLog} from './usageLogger'
import {client} from "websocket"

/** Map of active listeners, by id. */
var clientMap: Record<string, Client> = {}

interface Message {
	action: string
	reqId: number

	target?: string //some other client's id
	data?: string
}

class MessageError extends Error {
	userMessage: string
	public constructor(err: string) {
		super();
		this.userMessage = err
	}
}

function validId(id: string) {
	if (!id || typeof id !== "string") return false
	if (!id.match(/^[a-zA-Z0-9_ -]{8,50}$/)) return false
	return true
}

class Client {
	conn: websocket.connection
	id: string
	targets: string[] = []//ids we want to know about if they appear

	public constructor(conn: websocket.connection) {
		this.conn = conn

		conn.on('error', (err: any) => {
			if (this.id) delete clientMap[this.id]
			if (err.code === "ECONNRESET") return
			console.error("ws conn error:", err)
		})

		conn.on('close', (err: any) => {
			if (this.id) delete clientMap[this.id]
		})

		conn.on('message', (msg: websocket.Message) => {
			try {
				if (msg.type !== "utf8") {
					conn.drop(1003)
					reqLog("/RTCConnect", msg.binaryData.length)
					return
				}

				reqLog("/RTCConnect", msg.utf8Data.length)//not exact byte count, that's okay

				var data = JSON.parse(msg.utf8Data)

				if (typeof data !== "object" || !data) {
					conn.drop(1002)
					return
				}

				if (!data["action"] || typeof data["action"] !== "string") {
					conn.drop(1002)
					return
				}

				if (!data["reqId"] || typeof data["reqId"] !== "number") {
					conn.drop(1002)
					return
				}

				try {
					this.handleMessage(data as Message)
				} catch (ex) {
					this.conn.send(JSON.stringify({
						resId: data["reqId"],
						status: "error",
						message: ex.userMessage ?? "An error occurred",
					}))
					if (!ex.userMessage) {
						console.error(ex)
					}
				}

			} catch (ex) {
				console.error("WS message handling error:", ex)
				conn.drop(1011)
			}
		});
	}

	handleMessage(message: Message) {
		var sendResult = true
		switch (message.action) {
			case "setId": {//set the id we want to be referred to as
				let newId = message.data || ""
				if (!validId(newId)) throw new MessageError("Invalid id")
				if (clientMap[newId]) throw new MessageError("Id in use")
				this.setId(newId)
				break;
			}
			case "watchFor": {//subscribe to notifications if the target id appears
				let id = message.target
				if (!validId(id)) throw new MessageError("Invalid id")
				if (!this.targets.includes(id)) {
					this.targets.push(id)
					if (clientMap[id]) this.notifyTarget(id)
				}
				break;
			}
			case "proxy": {//send a message to the target
				let id = message.target
				if (!validId(id) || !validId(this.id)) throw new MessageError("Invalid id")
				if (!clientMap[id]) throw new MessageError("No connection with that id")
				let data = message.data + ""
				if (data.length > 1024) throw new MessageError("Message too large")

				clientMap[id].conn.send(JSON.stringify({
					action: "proxy",
					from: this.id,
					data: data
				}))

				break;
			}
			default:
				throw new MessageError("Unknown action")
		}

		if (sendResult) {
			this.conn.send(JSON.stringify({
				resId: message["reqId"],
				status: "success",
			}))
		}
	}

	setId(id: string) {
		if (this.id) delete clientMap[this.id]
		this.id = id
		clientMap[this.id] = this

		//Tell anyone that wants to know about us
		for (let key in clientMap) {
			if (key === this.id) continue
			let client = clientMap[key]
			if (client.targets.includes(this.id)) {
				client.notifyTarget(this.id)
			}
		}
	}

	private notifyTarget(id: string) {
		this.conn.send(JSON.stringify({
			action: "targetAppeared",
			data: id,
		}))
	}
}

export function onWSConnection(conn: websocket.connection) {
	new Client(conn)
}
