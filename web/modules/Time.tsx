import Module from './Module';

export default class Time extends Module {
	getName(): string {
		return "Time";
	}

	renderThumb(): HTMLElement {
		var el = <span></span>;

		var task = () => {
			el.textContent = new Date().toTimeString();
			if (el.isConnected) requestAnimationFrame(task);
		};
		requestAnimationFrame(task);

		return el;
	}

}