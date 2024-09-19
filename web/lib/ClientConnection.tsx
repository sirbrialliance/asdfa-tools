import * as Util from './util';
import * as stun from '../modules/STUN'


/** A WebRTC peer-to-peer connection. */
export default class ClientConnection {
	conn: RTCPeerConnection

	/** Function we can call to send a message to the other side for initial setup. */
	proxySend: (msg: string) => void
	public transferChannel: RTCDataChannel

	constructor(proxySender: (msg: string) => void) {
		let config: RTCConfiguration = {}

		// let iceList = Util.randomItems(stun.serverPool, 3).map(server => {
		// 	return {urls: server}
		// })
		// config.iceServers = iceList

		this.conn = new RTCPeerConnection(config)
		this.conn.addEventListener("icecandidate", ev => this.onICECandidate(ev))
		this.conn.addEventListener("connectionstatechange", ev => console.log("connectionstatechange", this.conn.connectionState))
		this.conn.addEventListener("datachannel", ev => {
			if (ev.channel.label === "Transfer") this.setTransferChannel(ev.channel)
		})

		this.proxySend = proxySender
	}

	async initiateConnect() {
		this.setTransferChannel(this.conn.createDataChannel("Transfer"))

		let offer = await this.conn.createOffer()
		await this.conn.setLocalDescription(offer)

		this.proxySend(JSON.stringify({
			action: "offer",
			data: offer
		}))
	}

	private setTransferChannel(channel: RTCDataChannel) {
		console.log("Setting transfer channel to", channel)
		this.transferChannel = channel

		this.transferChannel.addEventListener("message", ev => console.log("transferChannel", ev.data))
		this.transferChannel.addEventListener("open", ev => {
			console.log("transferChannel open!")
			this.transferChannel.send("test message yay")
		})

	}

	gotProxyMessage(msg: string) {
		try {
			var message = JSON.parse(msg)
		} catch (ex) {
			console.error(ex)
			return
		}

		switch (message.action) {
			case "offer":
				this.handleOffer(message.data)
				break
			case "answer":
				this.handleAnswer(message.data)
				break
			case "iceCandidate":
				this.conn.addIceCandidate(message.data)
				break
			default:
				console.error("Unknown message", msg)
				break
		}
	}

	private onICECandidate(ev: RTCPeerConnectionIceEvent) {
		if (!ev.candidate) return
		this.proxySend(JSON.stringify({
			action: "iceCandidate",
			data: ev.candidate.toJSON()
		}))
	}

	private async handleOffer(data: RTCSessionDescriptionInit) {
		await this.conn.setRemoteDescription(data)
		let myDesc = await this.conn.createAnswer()
		await this.conn.setLocalDescription(myDesc)
		this.proxySend(JSON.stringify({
			action: "answer",
			data: myDesc
		}))
	}

	private async handleAnswer(data: RTCSessionDescriptionInit) {
		await this.conn.setRemoteDescription(data)
	}

	public close() {
		this.conn.close()
	}
}

