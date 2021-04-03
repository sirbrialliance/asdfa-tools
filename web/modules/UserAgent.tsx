
import Module from './Module';

export default class UserAgent extends Module {
	getName(): string {
		return "User Agent";
	}

	renderThumb(): HTMLElement {
		return <span>{navigator.userAgent}</span>;
	}


}
