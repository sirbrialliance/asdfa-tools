
import Module from './Module';

export default class BrowserInfo extends Module {
	render(): HTMLElement {
		return <span>{navigator.userAgent}</span>;
	}

	getName(): string {
		return "Browser Info";
	}

	renderThumb(): HTMLElement {
		return <span>{navigator.userAgent}</span>;
	}


}
