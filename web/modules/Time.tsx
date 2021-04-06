import Module from './Module';

export default class Time extends Module {
	getName(): string {
		return "Time";
	}

	renderThumb(): HTMLElement {
		var el = <span></span>;

		var task = () => {
			var updated = new Date().toTimeString();
			if (el.textContent != updated) {
				el.textContent = updated;
				//console.log("Update time");
			}

			if (el.isConnected) requestAnimationFrame(task);
		};
		requestAnimationFrame(task);

		return el;
	}

}