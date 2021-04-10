import Module from './Module';

export default class SerialTerminal extends Module {
	getName(): string {
		return "Serial Terminal";
	}

	isSupported() {
		if ("serial" in navigator) return true;
		else return "WebSerial=mdn-api_serial";
	}

	renderThumb(): HTMLElement {
		return <div class="desc">
			Use WebSerial to connect to local serial devices and send/receive text or binary data.
		</div>;
	}

	render() {

		return [
			<terminal>
				<span>Not connected.</span>


			</terminal>,
			<div class="tray">
				{this.renderTray()}
			</div>
		];
	}

	renderTray(): HTMLElement[] {
		return [<button onClick={ev => this.connect()}>Connect</button>];
	}

	connect() {

	}

}