import Module from './Module';
import Terminal from '../lib/Terminal';
import * as Util from '../lib/util';

const serverPool = [
	"stun:stun.l.google.com:19302",
	"stun:stun1.l.google.com:19302",
	"stun:stun2.l.google.com:19302",
	"stun:stun3.l.google.com:19302",
	"stun:stun4.l.google.com:19302",
	"stun:stun.stunprotocol.org:3478",
];

export default class STUN extends Module {
	terminal: Terminal
	conn: RTCPeerConnection
	userMediaButton: HTMLElement

	getId() { return "STUN" }
	renderThumb(): HTMLElement {
		return <span>
			Display your public and private IP addresses.
		</span>;
	}

	getName(): string { return "Public/Private IPs (STUN)" }

	render() {
		this.terminal = new Terminal
		this.userMediaButton = <button onClick={ev => this.requestUserMedia()}>Request camera/microphone access</button>
		return [
			<div class="explain">
				<p>
					We're asking your browser for WebRTC ICE candidates. The first one or few are likely
					local candidates that your computer intrinsically knows about. Your browser should also contact to a
					couple STUN servers (listed below) which should respond with information about your public IP address(es).
				</p>
				<p>
					Your local and remote IP addresses should appear below.
				</p>
				<p>
					Different browsers might show a mDNS address instead of the actual LAN IP address.
				</p>
				<p>
					Having camera/microphone permission may make a difference in what data is available.<br />
					{this.userMediaButton}
				</p>
				<p>
					Some address entries may be duplicated (for different possible protocols).
				</p>
			</div>,
			this.terminal.el,
		];
	}

	async opened() {
		let searchMessage = this.terminal.pin(<div class="loading">Searching...</div>)

		// //quick check to see if we have permission, disable button if we do
		// navigator.mediaDevices.enumerateDevices().then(devices => {
		// 	if (devices.length && devices.some(x => x.deviceId.length)) {
		// 		(this.userMediaButton as HTMLInputElement).disabled = true
		// 	}
		// })

		var config: RTCConfiguration = {}

		if (true) {
			config.iceServers = [];
			for (let server of Util.randomItems(serverPool, 2)) {
				this.terminal.log("Will use " + server, "outbound");
				config.iceServers.push({
					urls: server,
				});
			}
		}


		this.conn = new RTCPeerConnection(config)

		this.terminal.log("--Start search--")

		this.conn.onicecandidate = ev => {
			console.log("icecandidate", ev)
			if (!ev.candidate || !ev.candidate.candidate) return

			try {
				// https://datatracker.ietf.org/doc/html/rfc5245#section-15.1
				let parts = ev.candidate.candidate.split(" ")
				let detailEls = []
				for (let i = 6; i < parts.length; i += 2) {
					detailEls.push(<li>{parts[i]}: {parts[i + 1]}</li>)
				}

				this.terminal.log(<span class="inbound addressNote" title={ev.candidate.candidate}>
					<h3>{parts[4]}</h3>
					<ul>
						<li>Proto: {parts[2]}</li>
						<li>Port: {parts[5]}</li>
						{detailEls}
					</ul>
				</span>)
			} catch (ex) {
				this.terminal.log(<span class="inbound addressNote" title={ev.candidate.candidate}>
					&lt;address parse error&gt;<br/>
					{ev.candidate.candidate}
				</span>)
				console.error(ex)
			}

		}

		this.conn.oniceconnectionstatechange = ev => console.log("iceconnectionstatechange", ev)
		this.conn.onicegatheringstatechange = ev => {
			console.log("icegatheringstatechange", ev)
			if (this.conn.iceGatheringState === "complete") {
				this.terminal.log("--That's it--")
				this.terminal.unpin(searchMessage)
			}
		}


		this.conn.createDataChannel("dataChannel");//need at least one channel to trigger ICE search

		var offer = await this.conn.createOffer()

		await this.conn.setLocalDescription(offer)
	}

	closed() {
		this.conn.close()
	}

	async requestUserMedia() {
		try {
			await navigator.mediaDevices.getUserMedia({audio: true, video: true})
		} catch (ex) {
			console.error(ex)
		}
		this.reload()
	}
}