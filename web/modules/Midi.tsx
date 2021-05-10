import {DeviceModule, DeviceInfo} from './Module';
import * as util from '../lib/util';

export default class Midi extends DeviceModule<WebMidi.MIDIPort> {
	getId() { return "Midi" }

	midi: WebMidi.MIDIAccess;
	terminal: HTMLElement;
	inputsEl: HTMLElement;
	outputsEl: HTMLElement;

	renderThumb(): HTMLElement {
		return <span>See connected MIDI devices and view events.</span>
	}

	getName(): string {
		return "MIDI";
	}

	isSupported() {
		return ('requestMIDIAccess' in navigator) || "MIDI API=midi";
	}


	async getDevices() {
		var ports: WebMidi.MIDIPort[] = [
			...Array.from(this.midi.inputs.values()),
			...Array.from(this.midi.outputs.values())
		];
		return ports.map(port => [port.id, port]) as [string, WebMidi.MIDIPort][];
	}

	async openDevice(deviceInfo: DeviceInfo<WebMidi.MIDIPort>) {
		var port = deviceInfo.device;
		try {
			await port.open();
			console.log("Opened " + port.id + "-" + port.name, port);
		} catch (ex) {
			console.error("Could not open " + port.id + "-" + port.name + " " +  ex);
		}

		port.onstatechange = ev => {
			if (port.state === "disconnected") this.removeDevice(port.id);
		};

		if (port.type === "input") {
			(port as WebMidi.MIDIInput).onmidimessage = _ev => {
				this.handleMessage(deviceInfo, _ev as WebMidi.MIDIMessageEvent);
			};
		}
	}

	async closeDevice(deviceInfo: DeviceInfo<WebMidi.MIDIPort>) {
		let port = deviceInfo.device;
		if (port.type === "input") (port as WebMidi.MIDIInput).onmidimessage = null;
		port.onstatechange = null;
		await port.close();
		console.log("Closed " + port.id + "-" + port.name);
	}

	renderDevice(deviceInfo: DeviceInfo<WebMidi.MIDIPort>): HTMLElement {
		if (deviceInfo.el) return deviceInfo.el;//don't re-render DOM

		let port = deviceInfo.device;
		return <terminal class="device">
			<h3>
				{`${port.type}: ${port.name}`} {" "}
				{(port.manufacturer && <small>{port.manufacturer}</small>)}
			</h3>
			{port.type === "input" && <div class="event info">&lt;interact with the device to see events&gt;</div> || ""}
		</terminal>;
	}

	opened() {
		super.opened();

		navigator.requestMIDIAccess({sysex: true}).then(async midi => {
			this.midi = midi;

			midi.onstatechange = ev => this.onStateChange(ev);

			await this.updateDevices();
		}, function(err) {
			console.error(err);
		});
	}

	closed() {
		super.closed();

		if (this.midi) {
			this.midi.onstatechange = null;
			this.midi = null;
		}
	}

	onStateChange(ev: WebMidi.MIDIConnectionEvent) {
		this.addDevice(ev.port.id, ev.port);//todo: .catch
	}

	handleMessage(deviceInfo: DeviceInfo<WebMidi.MIDIPort>, ev: WebMidi.MIDIMessageEvent) {
		var note = this.parseMIDIMessage(ev.data);

		var message: HTMLElement;

		const MAX_MESSAGES = 10;

		var existingMessage = null;

		if (note) {
			//delete any previous message with the same input id
			existingMessage = deviceInfo.el.querySelector(`[data-input="${note.id}"]`);

			message = <div class="event" data-input={note.id}>
				{note.t === "n" ? "Note: " : "CC:   "}
				{("#" + note.w).padStart(4, ' ')  + " "}
				<value>
					Value: {note.v.toString().padStart(3, ' ')}
					<bar style={{width: note.v / 127 * 100 + '%'}}/>
				</value>{" "}
				Channel: {(note.c + 1).toString().padStart(2, ' ') + " "}
				<span class="binary">{this.prettyBytes(ev.data)}</span>
			</div>;
			this.prettyBytes(ev.data) + " " + JSON.stringify(note);
		} else {
			message = <div class="event unknown">
				<span class="binary">{this.prettyBytes(ev.data)}</span>
			</div>;
		}

		if (existingMessage) existingMessage.parentElement.replaceChild(message, existingMessage);
		else {
			deviceInfo.el.querySelectorAll(".event.info").forEach(el => el.remove());
			var otherMessages = deviceInfo.el.querySelectorAll(".event");
			if (otherMessages.length >= MAX_MESSAGES) {
				otherMessages.item(0).remove();
			}
			deviceInfo.el.appendChild(message);
		}
	}


	parseMIDIMessage(data: Uint8Array) {
		var type = data[0];
		var what: number, value: number, channel: number;

		if (data.length > 2) {
			what = data[1];
			value = data[2];
			channel = type & 0xF;
		}

		//console.log("data", data);

		function breakUp() {
			switch (type & 0xF0) {
				case 0x80://note off
					return {
						id: null as string,
						c: channel,
						t: "n",
						w: what,
						v: 0,
					};
				case 0x90://note on
					return {
						c: channel,
						t: "n",
						w: what,
						v: value,
					};
				case 0xA0://note aftertouch
					return {
						c: channel,
						t: "n",
						w: what,
						v: value,
					};
				case 0xB0://control change
					return {
						c: channel,
						t: "cc",
						w: what,
						v: value,
					};
				default:
					//console.warn("Unrecognized MIDI data ", data);
					return null;
			}
		}

		var ret = breakUp();
		if (!ret) return ret;
		ret.id = "" + ret.c + ret.t + ret.w;
		return ret;
	}

	prettyBytes(aa: Uint8Array): string {
		var str = "[";
		for (var i = 0; i < aa.length; i++) {
			if (i > 0) str += ", ";
			str += ("0" + aa[i].toString(16)).slice(-2);
		}
		return str + "]";
	}

}

