import Module from './Module';
import * as RJS from "random-js"
import Terminal from "../lib/Terminal"
import ClientConnection from "../lib/ClientConnection"
import * as ClientData from "../lib/RTCClientData"
import RTCClientData, {RTCClientInfo} from "../lib/RTCClientData"

interface Message {
	action: string
	reqId: number

	target?: string //some other client's id
	data?: string
}

interface MessageResponse {
	resId: number
	status: string
	message?: string
}

function validId(id: string) {
	if (!id || typeof id !== "string") return false
	if (!id.match(/^[a-zA-Z0-9_ -]{8,50}$/)) return false
	return true
}

class ClientUI {
	public clientId: string
	public el: HTMLElement
	private statusEl: HTMLElement
	private connectButton: HTMLElement
	public conn: ClientConnection
	private transferModule: Transfer

	constructor(clientId: string, transferModule: Transfer) {
		this.clientId = clientId
		this.transferModule = transferModule

		this.el = <div class="searchTarget" data-targetId={clientId}>
			Client {clientId}: Status: {this.statusEl = <span class="targetStatus"></span>}
			{this.connectButton = <button onClick={ev => this.transferModule.startConnect(clientId)}>Connect</button>}
			<button onClick={ev => this.conn.transferChannel.send("test data message")}>msg test</button>
		</div>

		this.updateStatus("offline")
	}

	updateStatus(status: string) {
		this.statusEl.textContent = status

		this.connectButton.style.display = status == "online" ? "" : "none"
	}

}

export default class Transfer extends Module {
	getId() { return "Transfer" }
	isSupported() {
		if (!('RTCPeerConnection' in window)) return "WebRTC=rtcpeerconnection"
		if (!('crypto' in window) || !('subtle' in window.crypto)) return "Web Cryptography=cryptography"
		if (!('indexedDB' in window)) return "Indexed DB=indexeddb"
		return true
	}
	getName() { return "Transfer" }
	renderThumb(): HTMLElement {
		return <span>Send messages, data, or files to another computer via direct WebRTC connection.</span>
	}

	ws: WebSocket
	nextMsgId = 1
	clientInfo: ClientData.RTCClientInfo
	searchTargets: ClientData.RTCClientInfo[] = []//clients we are interested in
	searchTargetUIs: Record<string, ClientUI> = {}
	log: Terminal

	clientsEl: HTMLElement
	addTargetIdEl: HTMLInputElement

	public constructor() {
		super()
		this.log = new Terminal()

	}

	opened() {
		RTCClientData.log = this.log
		this.setupWS()

		this.setupInfo().catch(ex => {
			console.error(ex)
			this.log.log(ex.message, "inbound error")
		})

		//
		// try {
		// 	let rawTargets = localStorage.getItem("rtc.searchTargets")
		// 	if (rawTargets) this.searchTargets = JSON.parse(rawTargets)
		// } catch (ex) {
		// 	this.searchTargets = []
		// }
	}


	closed() {
		this.ws.close()

		for (let k in this.searchTargetUIs) {
			this.searchTargetUIs[k].conn?.close()
		}

		RTCClientData.log = null
	}

	private async setupInfo() {
		this.clientInfo = await ClientData.data.getMyData()

		wait for WS connect
		//tell server our id
		//update visuals

		//get other client infos
			//subscrbe to them
			//render them

	}



	render() {
		let connectRow = <div class="connect">
			Connect with: {this.addTargetIdEl=<input type="text" /> as HTMLInputElement}
			<button onClick={this.addTargetPressed.bind(this)}>Add</button>
		</div>

		let ret = [
			<h2>My id</h2>,
			<div id="myId">
				{/*<input type="text" value={this.clientId} />*/}
				<button>Update</button>
			</div>,
			<h2>Other Clients</h2>,
			this.clientsEl=<div id="clients">
				{connectRow}
			</div>,
			this.log.el,
		]

		// for (let target of this.searchTargets) {
		// 	this.buildTargetBox(target)
		// }

		return ret
	}

	private setupWS() {
		let wsPath = (location.protocol === "http:" ? "ws://" : "wss://") + location.host + "/RTCConnect"

		this.ws = new WebSocket(wsPath)
		this.log.log("Connecting...", "outbound")

		this.ws.onopen = ev => {
			this.log.log("Connected.", "inbound")
			// this.setStatus("idle")

			// this.wsSend({
			// 	action: "setId",
			// 	data: this.clientId,
			// 	reqId: this.nextMsgId++
			// })

			// for (let id of this.searchTargets) {
			// 	this.wsSend({
			// 		action: "watchFor",
			// 		target: id,
			// 		reqId: this.nextMsgId++
			// 	})
			// }
		}

		this.ws.onmessage = ev => {
			this.log.log(ev.data, "inbound")
			this.handleMessage(JSON.parse(ev.data))
		}

		this.ws.onerror = ev => {
			this.log.log("Disconnected (error)", "inbound error")
			console.error("WS error", ev)
			// this.setStatus("notConnected")
		}
		this.ws.onclose = ev => {
			this.log.log("Disconnected", "inbound error")
			// this.setStatus("notConnected")
		}
	}

	async wsSend(data: Message) {
		var json = JSON.stringify(data)
		this.log.log(json, "outbound")
		this.ws.send(json)
	}

	addTargetPressed() {
		// var newId = this.addTargetIdEl.value
		// this.addTargetIdEl.value = ""
		// if (!validId(newId) || this.searchTargets.includes(newId)) return
		//
		// this.searchTargets.push(newId)
		// localStorage.setItem("rtc.searchTargets", JSON.stringify(this.searchTargets))
		//
		// this.buildTargetBox(newId)
		//
		// this.wsSend({
		// 	action: "watchFor",
		// 	target: newId,
		// 	reqId: this.nextMsgId++
		// })
	}

	private buildTargetBox(targetId: string) {
		let ui = new ClientUI(targetId, this)
		this.searchTargetUIs[targetId] = ui

		this.clientsEl.prepend(ui.el)
	}

	private handleMessage(message: any) {
		if (message.resId) return//todo

		switch (message.action) {
			case "targetAppeared": {
				let targetUI = this.searchTargetUIs[message.data]
				targetUI?.updateStatus("online")
				break
			}
			case "proxy":
				this.handleProxyMessage(message.from + "", message.data + "")
				break
			default:
				this.log.log(`Unknown action: ${message.action}`, "inbound error")
				break
		}

	}

	private handleProxyMessage(remoteClientId: string, data: string) {
		let targetUI = this.searchTargetUIs[remoteClientId]
		if (!targetUI) {
			this.log.log(`Unexpected message from ${remoteClientId}`)
			return
		}

		if (!targetUI.conn) {
			//todo: don't just accept without permission
			targetUI.conn = new ClientConnection(msg => {
				this.ws.send(JSON.stringify({
					action: "proxy",
					target: remoteClientId,
					data: msg,
					reqId: this.nextMsgId++
				}))
			})
		}

		targetUI.conn.gotProxyMessage(data)
	}

	private createConnection(targetUI: ClientUI) {
		targetUI.conn?.close()
		targetUI.conn = new ClientConnection(msg => {
			this.ws.send(JSON.stringify({
				action: "proxy",
				target: targetUI.clientId,
				data: msg,
				reqId: this.nextMsgId++
			}))
		})
	}

	startConnect(clientId: string) {
		let targetUI = this.searchTargetUIs[clientId]
		if (!targetUI) return

		this.createConnection(targetUI)
		targetUI.conn.initiateConnect()
	}
}












