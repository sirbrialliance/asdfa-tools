import Module from './Module';

export default class WebRTC extends Module {
	ws: WebSocket;


	renderThumb(): HTMLElement {
		return <span>Make a WebRTC connection...</span>
	}

	getName(): string {
		return "WebRTC";
	}

	render() {
		return [<span>hi</span>];
	}

	opened() {
		// let ws = this.ws = new WebSocket("ws://127.0.0.1:3001/");
		let ws = this.ws = new WebSocket(" wss://h6m1dmlgc6.execute-api.us-west-2.amazonaws.com/dev");
		ws.onopen = ev => {
			console.log("open", ev);
			this.ws.close();
		};
		ws.onerror = ev => {console.log("error", ev);};

	}

	closed() {
		this.ws.close();
	}

}

