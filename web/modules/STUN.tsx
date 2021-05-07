import Module from './Module';

export default class STUN extends Module {
	renderThumb(): HTMLElement {
		return <span>
			Contact a STUN server to get you public IP address and learn about how easy it is to
			connect establish a connection through your firewall.
		</span>;
	}

	getName(): string { return "Public IP/NAT (STUN)"; }

	render() {
		return [<span>hi</span>];
	}

	opened() {}

	closed() {}
}