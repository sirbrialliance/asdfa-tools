import Module from './Module';
import * as util from '../lib/util';

export default class Midi extends Module {
	midi: WebMidi.MIDIAccess;
	terminal: HTMLElement;
	inputsEl: HTMLElement;
	outputsEl: HTMLElement;
	openPorts: WebMidi.MIDIPort[] = [];

	__onStateChange: (ev: Event) => void;

	renderThumb(): HTMLElement {
		return <span>See connected MIDI devices and view incoming MIDI events.</span>
	}

	getName(): string {
		return "MIDI";
	}

	isSupported() {
		return ('requestMIDIAccess' in navigator) || "MIDI API=midi";
	}

	render() {
		return [
			<div class="ioBox input">
				<h3>Inputs</h3>
				{this.inputsEl = <ul class="inputs"/>}
			</div>,
			<h3>Outputs</h3>,
			this.outputsEl = <ul class="outputs"/>,
			this.terminal = <terminal/>,
		];
	}

	opened() {
		this.__onStateChange = this.onStateChange.bind(this);

		navigator.requestMIDIAccess({sysex: false}).then(midi => {
			this.midi = midi;

			midi.addEventListener("statechange", this.__onStateChange);

			// console.log("MIDI", Array.from(midi.inputs.values()), Array.from(midi.outputs.values()));
			for (let port of Array.from(this.midi.inputs.values())) this.openPort(port);
			for (let port of Array.from(this.midi.outputs.values())) this.openPort(port);

			this.updateDeviceList();
		}, function(err) {
			console.error(err);
		});
	}

	closed() {
		if (this.midi) {
			this.midi.removeEventListener("statechange", this.__onStateChange);
			for (let port of this.openPorts) {
				port.close();//todo: wait for promise
			}
			this.openPorts = [];
			this.midi = null;
		}
	}

	updateDeviceList() {
		this.inputsEl.textContent = '';
		this.outputsEl.textContent = '';

		for (let port of Array.from(this.midi.inputs.values())) {
			this.inputsEl.appendChild(<li>{port.name + " (" + port.manufacturer + ")"}</li>);
		}
		for (let port of Array.from(this.midi.outputs.values())) {
			this.outputsEl.appendChild(<li>{port.name + " (" + port.manufacturer + ")"}</li>);
		}
	}

	onStateChange(ev: WebMidi.MIDIConnectionEvent) {

		// let port = ev.port;

		// if (port.state === "disconnected") {
		// 	if (port.type === "output") {
		// 		delete outPorts[port.id];
		// 	}
		// 	return;
		// }


	}

	async openPort(port: WebMidi.MIDIPort) {
		try {
			await port.open();
			console.log("Opened " + port.id + "-" + port.name + " " + port);
		} catch (ex) {
			console.error("Could not open " + port.id + "-" + port.name + " " +  ex + " " + port);
		}

		if (port.type === "input") {
			port.addEventListener("midimessage", _ev => {
				let ev = _ev as WebMidi.MIDIMessageEvent;
				var note = this.parseMIDIMessage(ev.data);

				if (note) {
					note.v = Math.round(note.v * 1000) / 1000;
					console.log(this.prettyBytes(ev.data) + " " + JSON.stringify(note));
				} else {
					console.log(this.prettyBytes(ev.data));
				}
			});
		}

		this.openPorts.push(port);
	}

	parseMIDIMessage(data: Uint8Array) {
		var type = data[0];
		var what: number, value: number, channel: number;

		if (data.length > 2) {
			what = data[1];
			value = data[2] / 127;
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

