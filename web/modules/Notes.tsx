import Module from './Module';

export default class Notes extends Module {
	getId() { return "Notes" }
	getName(): string {
		return "Notes";
	}

	renderThumb(): HTMLElement {
		var el = <textarea onInput={ev => localStorage.setItem("notes", (ev.target as HTMLInputElement).value)}>
			{localStorage.getItem("notes") || ""}
		</textarea>;

		return el;
	}

}