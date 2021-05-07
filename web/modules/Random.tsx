import Module from './Module';
import * as RJS from "random-js";

export default class Random extends Module {
	randomType: HTMLInputElement
	numCount: HTMLInputElement
	numMin: HTMLInputElement
	numMax: HTMLInputElement
	numResults: HTMLElement

	getName() { return "Random"; }

	renderThumb(): HTMLElement {
		return <span>Generate random numbers, shuffle or pick form a list.</span>
	}

	render() {
		return [
			<div class="sourceSelect">
				<h2>Source</h2>
				<p>
					How do you want to generate random numbers?
					<ul>
						<li>
							Math.random(), generated on your device, is the "normal"
							JavaScript pseudorandom number generator, but results could, in theory, be predicted by someone
							that knows a lot about your computer when you generated the numbers.
						</li>
						<li>
							Crypto.getRandomValues(), generated on your device, is also pseudorandom, but should be done in such a way that predicting
							results is vanishingly implausible. Not available in older browsers.
						</li>
						<li>
							<a href="https://random.org">random.org</a> is a third party web service that, effectively, listens
							to radio noise to give truly random data.<br/>
							<ul>
								<li>
									The seed + Mersenne option downloads just a little bit of random data and uses that to seed a
									Mersenne twister that generates the actual random data.
								</li>
								<li>
									The download all bytes option uses random.org to fetch all the random data we need for generating
									your result.
								</li>
							</ul>
							Note there's a <a href="https://www.random.org/quota/">daily quota</a> per IP address.
							{' '}<small><a href="https://www.random.org/Terms">terms</a></small>
						</li>
					</ul>
					Regardless of source, we use <a href="https://github.com/ckknight/random-js">Random.js</a> to convert the
					random data to the chosen result type.
				</p>
				<label for="randomType">Random source: </label>
				{this.randomType = <select id="randomType">
					<option value="math">Math.random()</option>
					<option value="secure" selected>Crypto.getRandomValues()</option>
					<option value="random.org-seed">random.org (seed + Mersenne)</option>
					<option value="random.org-raw">random.org (download all bytes)</option>
				</select> as HTMLInputElement}
			</div>,
			<div class="numberGen">
				<h2>Generate Numbers</h2>
				Generate {this.numCount=<input type="text" class="inline" value="10"/> as HTMLInputElement} random
				number(s) between {this.numMin=<input type="text" class="inline" value="1"/> as HTMLInputElement} and
				{' '}{this.numMax=<input type="text" class="inline" value="100" /> as HTMLInputElement} (inclusive).<br/>
				<button class="bigButton" onClick={ev => this.doRandomNumbers()}>Go</button>
				{this.numResults=<div class="results"></div>}
			</div>,
			<div>
				<h2>Generate String/Identifier</h2>
			</div>,
			<div>
				<h2>Shuffle or Pick Items from List</h2>
			</div>,


		];
	}

	opened() {
		if (typeof window.crypto === "undefined") {
			(this.randomType.querySelector("option[value='secure']") as HTMLInputElement).disabled = true
			if (this.randomType.value === "secure") this.randomType.value = "math"
		}

		this.doRandomNumbers()
	}


	closed() {}

	async doRandomNumbers() {
		this.numResults.textContent = "Generating...";

		var isLoading = true;
		var addResult = (num: number) => {
			if (isLoading) {
				this.numResults.textContent = "";
				isLoading = false;
			}

			this.numResults.appendChild(<span class="item">{num}</span>)
		};

		try {
			var min = +this.numMin.value | 0;
			var max = +this.numMax.value | 0;
			var count = +this.numCount.value | 0;
			if (min >= max) throw "min must be < max"
			if (count < 0) throw "count must be >= 1"
			if (count > 1000) throw "count must not be > 1000"

			var type = this.randomType.value
			var dist = RJS.integer(min, max)
			var generator: RJS.Engine
			if (type === "random.org-seed") {
				this.numResults.textContent = "Fetching...";

				let res = await fetch("https://www.random.org/cgi-bin/randbyte?nbytes=4&format=f")
				if (!res.ok) throw "Failed to fetch random data. " + res.statusText
				var bytes = await res.arrayBuffer()
				generator = RJS.MersenneTwister19937.seedWithArray(new Uint32Array(bytes))
			} else if (type === "random.org-raw") {
				throw "todo"
			} else if (type === "secure") {
				generator = RJS.browserCrypto
			} else {
				generator = RJS.nativeMath
			}

			for (let i = 0; i < count; i++) {
				addResult(dist(generator))
			}
		} catch (ex) {
			console.error(ex)
			this.numResults.textContent = "Error: " + (ex.message || ex)
		}
	}

	genNumbers() {

	}
}
