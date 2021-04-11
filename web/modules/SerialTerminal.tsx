import Module from './Module';
import * as util from '../lib/util';

const commonRates = [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 74880, 115200];

export default class SerialTerminal extends Module {
	port: SerialPort;
	ports: SerialPort[] = [];
	trayEl: HTMLElement;
	terminalEl: HTMLElement;
	connected = false;
	_reader: ReadableStreamDefaultReader;
	_writer: WritableStreamDefaultWriter;
	_readerTask: Promise<void>;


	getName(): string {
		return "Serial Terminal";
	}

	isSupported() {
		if ("serial" in navigator) return true;
		else return "WebSerial=mdn-api_serial";
	}

	renderThumb(): HTMLElement {
		return <div class="desc">
			Use WebSerial to connect to local serial devices and send/receive text.
		</div>;
	}

	opened() {
		navigator.serial.getPorts().then(ports => {
			console.log("existing ports:", ports)
			this.ports = ports;
			this.renderTray();
		}, err => console.error(err));
		navigator.serial.addEventListener("connect", ev => {
			console.log("connect ev", ev);
		});
		navigator.serial.addEventListener("disconnect", ev => {
			console.log("disconnect ev", ev);
		});
	}

	mayClose() {
		if (this.connected) return "Are you sure? We're connected to a serial port.";
		else return true;
	}

	closed() {
		this.disconnect();
	}

	render() {
		this.trayEl = <div class="tray"></div>;
		this.terminalEl = <terminal></terminal>;
		this.renderTray();
		this.log("[Not Connected]");

		return [
			this.terminalEl,
			this.trayEl,
		];
	}

	getPortName(port: SerialPort) {
		let info = port.getInfo();
		return `${info.usbVendorId ? util.toXHex4(info.usbVendorId) : "??"}`+
			` ${info.usbProductId ? util.toXHex4(info.usbProductId) : "??"}`;
	}

	renderTray() {
		var items: HTMLElement[] = [];
		this.trayEl.textContent = '';

		let pushSection = () => {
			if (items.length) this.trayEl.appendChild(<section>{items}</section>);
			items = [];
		};

		if (!this.connected) {
			//pick port:---------

			items.push(<h3>Choose port</h3>)
			if (this.ports.length) {
				let list = <ul class='portList'/>;
				for (let port of this.ports) {
					list.appendChild(<li>
						<button onClick={ev => this.selectPort(port)}>{this.getPortName(port)}</button>
					</li>);
				}
				items.push(list);
			}

			items.push(<button onClick={ev => this.askForNewDevice()}>Select New Device...</button>);

			pushSection();

			//port info/actions:---------
			if (this.port) {
				items.push(<h3>Selected port</h3>)

				let info = this.port.getInfo();
				items.push(<ul>
					<li>{`Product: ${info.product || "??"} (${info.productId || "??"})`}</li>
					<li>{
						`USB VID/PID: ${info.usbVendorId ? util.toXHex4(info.usbVendorId) : "??"}`+
						` ${info.usbProductId ? util.toXHex4(info.usbProductId) : "??"}`
					}</li>
					<li>{`Manufacturer: ${info.manufacturer || "??"}`}</li>
					<li>{`Vendor: ${info.vendor || "??"} (${info.vendorId || "??"})`}</li>
					<li>{`Serial: ${info.serialNumber || "??"}`}</li>
					<li>{`Location: ${info.locationId || "??"}`}</li>
				</ul>);
			}
			pushSection();

			if (this.port && !this.connected) {
				items.push(<h3>Connect</h3>);

				let optionsText = <textarea onChange={ev => {
					localStorage.setItem("SerialTerminal.options", (ev.target as HTMLInputElement).value);
				}} /> as HTMLInputElement;
				let pref = localStorage.getItem("SerialTerminal.options");
				if (!pref) pref = JSON.stringify({
					baudRate: 115200,
					dataBits: 8,
					stopBits: 1,
					parity: "none",
					flowControl: "none",
				}, null, '  ');
				optionsText.textContent = pref;
				items.push(optionsText);

				// let opt = <select name='baud'></select>;
				// for (let rate of commonRates) opt.appendChild(<option value={rate+""}>{rate}</option>);
				// items.push(<input type="text" value="115200"/>);
				items.push(<button onClick={ev => {
					this.errorCatch(() => this.connect(JSON.parse(optionsText.value)));
				}}>Connect</button>);
			}
			pushSection();
		} else {
			//connected
		}

	}

	async askForNewDevice() {
		let newPort = await navigator.serial.requestPort();
		if (this.ports.indexOf(newPort) < 0) this.ports.push(newPort);
		this.selectPort(newPort);
	}

	selectPort(port: SerialPort) {
		this.disconnect();
		this.port = port;
		this.renderTray();
	}

	async connect(options: any) {
		await this.disconnect();

		// this.clearLog();
		this.log("Connecting to " + this.getPortName(this.port));

		await this.port.open(options);

		this.log("Port opened.");

		this._reader = this.port.readable.getReader();
		this._writer = this.port.writable.getWriter();
		let readerTask = async () => {
			let forcedTextChars = ["\n", "\t"];

			while (true) {
				let {value, done} = await this._reader.read();
				if (done) break;

				//convert binary to text, but only printable ASCII characters.
				let outBuf = "";
				let textMode = true;
				let flush = () => {
					this.log(outBuf, textMode ? "inbound" : "inboundBinary");
					outBuf = "";
				};

				for (let c of value) {
					let isText = (c >= 32 && c <= 126) || forcedTextChars.indexOf(c) >= 0;

					if (isText != textMode && outBuf) {
						//flush buffer
						flush();
						textMode = isText;
					}

					if (isText) outBuf += String.fromCharCode(c);
					else {
						if (outBuf) outBuf += " ";
						outBuf += util.toHex2(c);
					}
				}

				flush();
			}

			this._reader.releaseLock();
			this.log("Close reader.");
		};
		this._readerTask = readerTask();
		this.connected = true;

		await this._writer.write(new TextEncoder().encode("Foo bar baz"));
	}

	/**
	 * Disconnect the serial port, if it's open.
	 */
	async disconnect() {
		if (!this.connected) return;

		this.log("Disconnecting from " + this.getPortName(this.port) + "...");

		this._writer.releaseLock();
		this._reader.cancel();
		await this._readerTask;

		await (this.port as any).close();
		this.log("Disconnected.");

		this.connected = false;
	}

	clearLog() { this.terminalEl.textContent = ''; }

	log(msg: string, className: string = "system") {
		this.terminalEl.appendChild(<span class={className}>{msg}</span>);
	}

	errorCatch(action: () => Promise<any>) {
		try {
			action().catch(err => {
				this.log(err, "error");
				console.error(err);
			})
		} catch (ex) {
			this.log(ex, "error");
			console.error(ex);
		}
	}

}