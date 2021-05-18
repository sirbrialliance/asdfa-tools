import Module from './Module';

export default class Notes extends Module {
	getId() { return "Notes" }
	getName() { return "Notes" }
	renderThumb() { return <span>Just jot something down for later, data is saved in your browser locally.</span> }


	render() {
		let el = <textarea onInput={ev => localStorage.setItem("notes", (ev.target as HTMLInputElement).value)}>
			{localStorage.getItem("notes") || ""}
		</textarea>

		return [
			<p>
				Write down whatever you'd like, data is stored locally via your browser's localStorage.
				It should remain if you reload the page or restart the browser. Data isn't sent to the server.
			</p>,
			el
		]
	}

}