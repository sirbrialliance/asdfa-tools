import {DeviceModule, DeviceInfo} from './Module'
import * as util from '../lib/util'


class MIDIDeviceInfo implements DeviceInfo {
	id: string
	el: HTMLElement
	device: WebMidi.MIDIPort
	selectEl: HTMLSelectElement
	outputTarget: string
}

export default class Midi extends DeviceModule<MIDIDeviceInfo> {
	getId() { return "Midi" }

	midi: WebMidi.MIDIAccess
	terminal: HTMLElement
	inputsEl: HTMLElement
	outputsEl: HTMLElement

	renderThumb(): HTMLElement {
		return <span>See connected MIDI devices and view events.</span>
	}

	getName(): string { return "MIDI" }

	isSupported() { return ('requestMIDIAccess' in navigator) || "MIDI API=midi" }

	async getDevices() {
		let ports = [
			...Array.from(this.midi.inputs.values()),
			...Array.from(this.midi.outputs.values())
		]
		return ports.map(port => {
			return {
				...new MIDIDeviceInfo,
				id: port.id,
				device: port,
			}
		})
	}

	async openDevice(deviceInfo: MIDIDeviceInfo) {
		let port = deviceInfo.device
		try {
			await port.open()
			console.log("Opened " + port.id + "-" + port.name, port)
		} catch (ex) {
			console.error("Could not open " + port.id + "-" + port.name + " " +  ex)
		}

		port.onstatechange = ev => {
			if (port.state === "disconnected") this.removeDevice(this.devices[port.id])
		}

		if (port.type === "input") {
			(port as WebMidi.MIDIInput).onmidimessage = _ev => {
				this.handleMessage(deviceInfo, _ev as WebMidi.MIDIMessageEvent)
			}
		}
	}

	async closeDevice(deviceInfo: MIDIDeviceInfo) {
		let port = deviceInfo.device
		if (port.type === "input") (port as WebMidi.MIDIInput).onmidimessage = null
		port.onstatechange = null
		await port.close()
		console.log("Closed " + port.id + "-" + port.name)
	}

	renderDevice(deviceInfo: MIDIDeviceInfo): HTMLElement {
		if (deviceInfo.el) return deviceInfo.el //don't re-render DOM

		let port = deviceInfo.device

		let content: HTMLElement[] = []
		if (port.type === "input") {
			content.push(<div class="event info">&lt;interact with the device to see events&gt;</div>)
		} else {
			deviceInfo.selectEl = <select
				onChange={ev => deviceInfo.outputTarget = (ev.target as HTMLSelectElement).value}>
			</select> as HTMLSelectElement

			deviceInfo.outputTarget = ''
			content.push(<div class="selectOutput">
				<label>
					Copy events from:
					{deviceInfo.selectEl}
				</label>
				<br/>
				<small>TODO: need to test that actually works</small>
			</div>)
			content.push(<div class="event info"/>)
		}

		return <terminal class="device">
			<h3>
				{`${port.type}: ${port.name}`} {" "}
				{(port.manufacturer && <small>{port.manufacturer}</small>)}
			</h3>
			{content}
		</terminal>
	}

	updateOutputSelect(deviceInfo: MIDIDeviceInfo) {
		if (deviceInfo.device.type !== "output") return

		let el = deviceInfo.selectEl
		el.textContent = ''

		;(['', ...Object.keys(this.devices)]).forEach(id => {
			let otherDevice = this.devices[id]
			if (id === '' || otherDevice.device.type === "input") {
				el.appendChild(<option
					value={id}
					selected={deviceInfo.outputTarget === id}
				>
					{otherDevice ? otherDevice.device.name : '-- None --'}
				</option>)
			}
		})
	}

	renderDevices() {
		super.renderDevices()
		for (let id in this.devices) {
			this.updateOutputSelect(this.devices[id])
		}
	}

	opened() {
		super.opened()

		navigator.requestMIDIAccess({sysex: true}).then(async midi => {
			this.midi = midi

			midi.onstatechange = ev => this.onStateChange(ev)

			await this.updateDevices()
		}, function(err) {
			console.error(err)
		})
	}

	closed() {
		super.closed()

		if (this.midi) {
			this.midi.onstatechange = null
			this.midi = null
		}
	}

	onStateChange(ev: WebMidi.MIDIConnectionEvent) {
		this.addDevice({...new MIDIDeviceInfo, id: ev.port.id, device: ev.port}) //todo: .catch
	}

	handleMessage(deviceInfo: MIDIDeviceInfo, ev: WebMidi.MIDIMessageEvent) {
		if (deviceInfo.device.type === "input") {
			for (let k in this.devices) {
				if (this.devices[k].outputTarget as string === deviceInfo.id) {
					//replicate to output
					this.handleMessage(this.devices[k], ev)
				}
			}
		} else if (deviceInfo.device.type === "output") {
			(deviceInfo.device as WebMidi.MIDIOutput).send(ev.data)
		}


		let note = this.parseMIDIMessage(ev.data)

		let message: HTMLElement

		const MAX_MESSAGES = 10

		let existingMessage = null

		if (note) {
			//delete any previous message with the same input id
			existingMessage = deviceInfo.el.querySelector(`[data-input="${note.id}"]`)

			message = <div class="event" data-input={note.id}>
				{note.t === "n" ? "Note: " : "CC:   "}
				{("#" + note.w).padStart(4, ' ')  + " "}
				<value>
					Value: {note.v.toString().padStart(3, ' ')}
					<bar style={{width: note.v / 127 * 100 + '%'}}/>
				</value>{" "}
				Channel: {(note.c + 1).toString().padStart(2, ' ') + " "}
				<span class="binary">{this.prettyBytes(ev.data)}</span>
			</div>
			this.prettyBytes(ev.data) + " " + JSON.stringify(note)
		} else {
			message = <div class="event unknown">
				<span class="binary">{this.prettyBytes(ev.data)}</span>
			</div>
		}

		if (existingMessage) existingMessage.parentElement.replaceChild(message, existingMessage)
		else {
			deviceInfo.el.querySelectorAll(".event.info").forEach(el => el.remove())
			let otherMessages = deviceInfo.el.querySelectorAll(".event")
			if (otherMessages.length >= MAX_MESSAGES) {
				otherMessages.item(0).remove()
			}
			deviceInfo.el.appendChild(message)
		}
	}


	parseMIDIMessage(data: Uint8Array) {
		let type = data[0]
		let what: number, value: number, channel: number

		if (data.length > 2) {
			what = data[1]
			value = data[2]
			channel = type & 0xF
		}

		//console.log("data", data)

		function breakUp() {
			switch (type & 0xF0) {
				case 0x80://note off
					return {
						id: null as string,
						c: channel,
						t: "n",
						w: what,
						v: 0,
					}
				case 0x90://note on
					return {
						c: channel,
						t: "n",
						w: what,
						v: value,
					}
				case 0xA0://note aftertouch
					return {
						c: channel,
						t: "n",
						w: what,
						v: value,
					}
				case 0xB0://control change
					return {
						c: channel,
						t: "cc",
						w: what,
						v: value,
					}
				default:
					//console.warn("Unrecognized MIDI data ", data)
					return null
			}
		}

		let ret = breakUp()
		if (!ret) return ret
		ret.id = "" + ret.c + ret.t + ret.w
		return ret
	}

	prettyBytes(aa: Uint8Array): string {
		let str = "["
		for (let i = 0; i < aa.length; i++) {
			if (i > 0) str += ", "
			str += ("0" + aa[i].toString(16)).slice(-2)
		}
		return str + "]"
	}

}

