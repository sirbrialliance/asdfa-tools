import Module from './Module';

export default class Time extends Module {
	getId() { return "Time" }
	getName(): string { return "Time" }

	serverTime: HTMLElement

	renderThumb(): HTMLElement {
		return <span>Excuse me sir, have you got the time?</span>
	}
	// renderThumb(): HTMLElement {
	// 	let el = <span></span>

	// 	let task = () => {
	// 		let updated = new Date().toTimeString()
	// 		if (el.textContent != updated) {
	// 			el.textContent = updated
	// 			//console.log("Update time");
	// 		}

	// 		if (el.isConnected) requestAnimationFrame(task)
	// 	}
	// 	requestAnimationFrame(task)

	// 	return el
	// }

	render() {
		return [
			<div>Device time: {new Date().toTimeString()}</div>,
			<div>Server time: {this.serverTime = <span/>}</div>
		]
	}

	async opened() {
		let t0 = Date.now()
		let perf0 = performance.now()
		let res = await fetch("/api/baseHit")
		let perf1 = performance.now()


		let data = await res.json()
		let myCenter = (perf1 - perf0) / 2 + t0
		let serverCenter = (data.reqEpoch + data.svEpoch) / 2
		// requestStart - responseStart

		this.serverTime.textContent = `${new Date(serverCenter).toTimeString()}, diff of ${myCenter - serverCenter}`;

		console.log("Time", myCenter, serverCenter, myCenter - serverCenter, performance.getEntriesByName(res.url))
	}

}