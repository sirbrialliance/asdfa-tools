import Module from './Module'
import * as RJS from "random-js"
import TabSet from '../lib/TabSet'


const defaultList = [
	"Armadillo",
	"Bat",
	"Camel",
	"Dolphin",
	"Elephant",
	"Ferret",
	"Gecko",
	"Horse",
	"Iguana",
	"Jaguar",
	"Koala",
	"Lemur",
	"Manatee",
	"Narwhal",
	"Octopus",
	"Platypus",
	"Quokka",
	"Raccoon",
	"Snake",
	"Tiger",
	"Turtle",
	"Uakari",
	"Vulture",
	"Wolf",
	"Xerus",
	"Yak",
	"Zebra",
]

export default class Random extends Module {
	randomType: HTMLInputElement
	resultsEl: HTMLElement
	tabSet: TabSet
	inputs: Record<string, HTMLInputElement>

	constructor() {
		super()
		this.inputs = {}
	}

	getName() { return "Random" }

	renderThumb(): HTMLElement {
		return <span>Generate random numbers, shuffle or pick form a list.</span>
	}

	render() {
		let mkInput = (id: string, label: string, defaultVal: string | number, classes = "") => {
			let labelEl = <label for={id}>{label}: </label>
			let el = <input type="text" id={id} value={defaultVal.toString()} /> as HTMLInputElement
			this.inputs[id] = el
			return [labelEl, el]
		}

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
									Mersenne twister that generates the results data.
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
			</div>,
			<div class="buttonsArea">
				<p>
					<label for="randomType">Random source: </label>
					{this.randomType = <select id="randomType">
						<option value="math">Math.random()</option>
						<option value="secure" selected>Crypto.getRandomValues()</option>
						<option value="random.org-seed">random.org (seed + Mersenne)</option>
						<option value="random.org-raw">random.org (download all bytes)</option>
					</select> as HTMLInputElement}
				</p>

				{(this.tabSet = new TabSet(<tabset class="tabSet">
					<section data-label="Integers" data-tab="int">
						{mkInput("intMin", "Min", 1)}<br/>
						{mkInput("intMax", "Max", 100)} (inclusive)<br/>
					</section>

					<section data-label="Real Numbers" data-tab="real">
						{mkInput("realMin", "Min", 0)}<br/>
						{mkInput("realMax", "Max", 1)} (exclusive)<br/>
					</section>
					<section data-label="UUID" data-tab="uuid">
						(no options)
					</section>
					<section data-label="String" data-tab="string">
						{mkInput("stringChars", "Character Pool", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-")}<br/>
						{mkInput("stringLen", "String Length", 16)}<br/>
					</section>
					<section data-label="Pick from List" data-tab="listPick">
						List, one entry per line:<br/>
						{this.inputs["listPickItems"] = <textarea>{defaultList.join("\n")}</textarea> as HTMLInputElement}
						<label>
							Allow duplicates:
							{this.inputs["listPickDupes"] = <input type="checkbox" checked /> as HTMLInputElement}
						</label>
					</section>

					<section data-label="Shuffle List" data-tab="listShuffle">
						List, one entry per line:<br/>
						{this.inputs["listShuffleItems"] = <textarea>{defaultList.join("\n")}</textarea> as HTMLInputElement}
						<button class="bigButton" onClick={ev => this.doRandomGen()}>Shuffle</button>
					</section>

				</tabset>)).el}

				<p class="resultActionContainer">
					<label for="resultCount">
						Number to generate:{' '}
						{this.inputs["resultCount"] = <input type="text" value="10" /> as HTMLInputElement}
					</label>
					<button class="bigButton" onClick={ev => this.doRandomGen()}>Go</button>
				</p>
			</div>,
			this.resultsEl=<div class="results"></div>,
		]
	}

	opened() {
		if (typeof window.crypto === "undefined") {
			(this.randomType.querySelector("option[value='secure']") as HTMLInputElement).disabled = true
			if (this.randomType.value === "secure") this.randomType.value = "math"
		}

		this.doRandomGen()
	}

	_getInput(id: string): number {
		return +this.inputs[id].value
	}

	/** Takes the given random engine and generates results for the currently selected output. */
	genResults(engine: RJS.Engine, writeOutput = true): HTMLElement[] {
		this.resultsEl.textContent = "Generating..."
		let ret: HTMLElement[] = []
		let count = this._getInput("resultCount")

		let distribution: any //RJS.Distribution
		switch (this.tabSet.currentTab) {
			case "int":
				distribution = RJS.integer(this._getInput("intMin"), this._getInput("intMax"))
				break
			case "real":
				distribution = RJS.real(this._getInput("realMin"), this._getInput("realMax"))
				break
			case "uuid":
				distribution = RJS.uuid4
				break
			case "string":
				let d = RJS.string(this.inputs['stringChars'].value)
				let len = this._getInput("stringLen")
				distribution = (eng: RJS.Engine) => d(eng, len)
				break
			case "listPick":
				let dupesOkay = this.inputs["listPickDupes"].checked
				let list = this.inputs["listPickItems"].value.split("\n")
				if (dupesOkay) {
					distribution = (eng: RJS.Engine) => RJS.pick(eng, list)
				} else {
					if (count > list.length) count = list.length
					let items = RJS.sample(engine, list, count)
					ret = items.map(item => <span class="item">{item}</span>)
				}
				break
			case "listShuffle":
				let listTarget = this.inputs["listShuffleItems"].value.split("\n")
				RJS.shuffle(engine, listTarget)
				if (writeOutput) {
					this.inputs["listShuffleItems"].value = listTarget.join("\n")
				}
				break
		}

		if (writeOutput && distribution) {
			for (let i = 0; i < count; ++i) {
				ret.push(<span class="item">{distribution(engine).toString()}</span>)
			}
		}

		return ret
	}

	async doRandomGen() {
		this.resultsEl.textContent = "Generating..."

		try {
			let type = this.randomType.value
			let generator: RJS.Engine
			if (type === "random.org-seed") {
				this.resultsEl.textContent = "Fetching 4 random bytes..."

				let res = await fetch("https://www.random.org/cgi-bin/randbyte?nbytes=4&format=f")
				if (!res.ok) throw "Failed to fetch random data. " + res.statusText
				let bytes = await res.arrayBuffer()
				generator = RJS.MersenneTwister19937.seedWithArray(new Uint32Array(bytes))
			} else if (type === "random.org-raw") {
				//count number of needed bytes
				let count = 0
				let countGenerator = {next: () => count++}
				this.genResults(countGenerator, false)

				let numBytes = count * 4
				if (numBytes > 1000) throw "Need to download more than 1000 bytes data"

				//Fetch that many bytes
				this.resultsEl.textContent = `Fetching ${numBytes} random bytes...`

				let res = await fetch("https://www.random.org/cgi-bin/randbyte?nbytes=" + numBytes + "&format=f")
				if (!res.ok) throw "Failed to fetch random data. " + res.statusText

				//Make a generator from it
				let arrayView = new Uint32Array(await res.arrayBuffer())
				let arrayIdx = 0
				generator = {next: () => {
					if (arrayIdx >= arrayView.length) throw "Tried to use more entropy then prefetched (bug)"
					return arrayView[arrayIdx++]
				}}

			} else if (type === "secure") {
				generator = RJS.browserCrypto
			} else {
				generator = RJS.nativeMath
			}

			let els = this.genResults(generator)
			this.resultsEl.textContent = ""
			els.forEach(el => this.resultsEl.append(el, ' '))
		} catch (ex) {
			console.error(ex)
			this.resultsEl.textContent = "Error: " + (ex.message || ex)
		}
	}

}
