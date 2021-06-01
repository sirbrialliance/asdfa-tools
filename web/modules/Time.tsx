import Terminal from '../lib/Terminal'
import Module from './Module'
import * as util from '../lib/util'

interface PingPacket {
	action: 'time'

	//these should match up with the timestamps explained in https://datatracker.ietf.org/doc/html/rfc958#section-5
	t1: number
	t2: number
	t3: number
	t4: number

	rtt: number
	offset: number
}

export default class Time extends Module {
	getId() { return "Time" }
	getName(): string { return "Time" }

	elMainClock: HTMLElement
	elMainClockNote: HTMLElement

	elDeviceTime: HTMLElement
	elServerTime: HTMLElement
	elOffset: HTMLElement

	log: Terminal
	elSyncButton: HTMLButtonElement

	timeWS: WebSocket
	tickRenderFn = this.tickRender.bind(this)
	offset: number = null
	pingCb: (data: string) => void
	status: 'notConnected' | 'syncing' | 'idle' = 'notConnected'

	renderThumb(): HTMLElement {
		return <span>View device time, NTP time, and how different they are.</span>
	}

	render() {
		requestAnimationFrame(this.tickRenderFn)

		return <>
			<h2>Right now it's:</h2>
			{this.elMainClock = <div class="mainClock"></div>}
			{this.elMainClockNote = <div class="mainClockNote"></div>}
			<div>Device time: {this.elDeviceTime = <span/>}</div>
			<div>Server time: {this.elServerTime = <span/>}</div>
			<div>Offset: {this.elOffset = <span>--not synced--</span>}</div>
			{(this.log = new Terminal()).el}
			{this.elSyncButton = <button onClick={ev => this.syncTime()}>Do Sync</button> as HTMLButtonElement}
			<p>This tool is provided in hopes that it might be useful, but don't trust or rely on it for anything important.</p>
		</>
	}

	formatDate(t: Date) {
		let hour = t.getHours()
		let h = (hour % 12 || 12).toString().padStart(2, " ")
		let m = t.getMinutes().toString().padStart(2, "0")
		let s = t.getSeconds().toString().padStart(2, "0")
		let ms = t.getMilliseconds().toString().padStart(3, "0")
		let am = hour <= 12
		return `${h}:${m}:${s}.${ms} ${am ? 'AM' : 'PM'}`
	}

	tickRender() {
		let deviceTime = new Date()
		let serverTime: Date = null

		if (this.offset !== null) {
			serverTime = new Date()
			serverTime.setTime(Date.now() + this.offset)
		}

		this.elMainClock.textContent = this.formatDate(serverTime || deviceTime)
		if (!serverTime) {
			this.elMainClockNote.textContent = "Based on your device's time"
		} else {
			this.elMainClockNote.textContent = "Based on The Internet"
		}

		this.elDeviceTime.textContent = this.formatDate(deviceTime)
		if (serverTime) {
			this.elServerTime.textContent = this.formatDate(serverTime)
		} else {
			this.elServerTime.textContent = "--not synced--"
		}

		if (this.isOpen && this.elMainClockNote.isConnected) requestAnimationFrame(this.tickRenderFn)
	}

	async opened() {
		let wsPath = (location.protocol === "http:" ? "ws://" : "wss://") + location.host + "/Time/api"

		this.timeWS = new WebSocket(wsPath)
		this.log.log("Connecting...", "outbound")

		this.timeWS.onopen = ev => {
			this.log.log("Connected.", "inbound")
			this.setStatus("idle")
			this.syncTime()
		}

		this.timeWS.onmessage = ev => {
			// console.log("msg: " + ev.data)
			if (this.pingCb) this.pingCb(ev.data)
		}

		this.timeWS.onerror = ev => {
			this.log.log("Disconnected (error)", "inbound error")
			console.error("WS error", ev)
			this.setStatus("notConnected")
		}
		this.timeWS.onclose = ev => {
			this.log.log("Disconnected", "inbound error")
			this.setStatus("notConnected")
		}
	}

	_pingServer() : Promise<PingPacket> {
		return new Promise((res, rej) => {
			let done = false
			//t1 = client sent, t2 = server got, t3 = sever sent, t4 = client got
			let t1 = Date.now()

			this.pingCb = _data => {
				let t4 = Date.now()
				try {
					let data = JSON.parse(_data) as PingPacket
					if (data.action !== "time") return

					if (data.t1 !== t1) {
						rej(new Error("Unexpected result"))
						return
					}

					data.t4 = t4

					// See https://datatracker.ietf.org/doc/html/rfc958#section-5
					data.rtt = (data.t4 - data.t1) - (data.t3 - data.t2)
					data.offset = (data.t2 - data.t1 + data.t3 - data.t4) / 2

					res(data)
					done = true
				} catch (ex) {
					rej(ex)
				}
			}

			this.timeWS.send(JSON.stringify({
				action: "time",
				t1: t1,
			}))

			setTimeout(() => {
				if (!done) rej(new Error("timed out"))
			}, 5000)
		})
	}

	setStatus(newStatus: "notConnected" | "syncing" | "idle") {
		this.status = newStatus
		this.elSyncButton.disabled = newStatus !== "idle"
	}

	prettyTime(time: number) {
		if (time < 800) return Math.round(time * 10) / 10 + "ms"
		else if (time < 3600) return Math.round(time / 100) / 10 + "s"
		else return Math.round(time / 100 / 60) / 10 + "min"
	}

	async syncTime() {
		if (this.status !== 'idle') return

		this.setStatus('syncing')
		try {
			const count = 5
			this.log.log("Sending " + count + " sync messages...", "outbound")
			let samples: PingPacket[] = []
			for (let i = 0; i < count; i++) {
				let res = await this._pingServer()
				samples.push(res)
				//NB: seems the minifier may break the code (loop only once) without the ${count} below, I don't feel like fighting it.
				this.log.log(`Got #${i + 1}/${count}, RTT: ${res.rtt}ms, Offset: ${res.offset}ms\n`, "inbound")
			}

			let rttStats = util.stats(samples.map(x => x.rtt))
			let offsetStats = util.stats(samples.map(x => x.offset))
			this.log.log(`RTT std. dev. ${Math.round(rttStats.stdDev)}ms, offset std. dev. ${Math.round(offsetStats.stdDev)}\n`, "inbound")

			//todo: this method doesn't work too well at picking the best samples
			let maxDeviationCount = 0
			do {
				maxDeviationCount += .5
				if (maxDeviationCount > 10) {
					this.log.log("Network is really bad, can't get a grip on time", "error")
					return
				}

				var goodSamples = samples.filter(packet => {
					//throw out things with too high a deviation
					if (Math.abs(packet.rtt - rttStats.mean) > rttStats.stdDev * maxDeviationCount) return false
					if (Math.abs(packet.offset - offsetStats.mean) > offsetStats.stdDev * maxDeviationCount) return false

					return true
				})

			} while (!goodSamples.length)


			this.log.log("Will use offset(s): " + goodSamples.map(x => x.offset).join(", ") + "\n", "inbound")
			let finalOffsetStats = util.stats(goodSamples.map(x => x.offset))
			this.offset = Math.round(finalOffsetStats.mean * 10) / 10

			this.log.log(`Update offset to ${this.prettyTime(this.offset)}\n`)
			this.elOffset.textContent = this.prettyTime(this.offset)
			if (this.offset > 0) this.elOffset.textContent += " (your clock is behind)"
			else if (this.offset < 0) this.elOffset.textContent += " (your clock is ahead)"
		} catch (ex) {
			console.error(ex)
		} finally {
			this.setStatus('idle')
		}
	}

	closed() {
		if (this.timeWS) this.timeWS.close()
		this.setStatus('notConnected')
	}

}