
/**
 * Technically a spectrum graph, not a VU meter.
 */
export default class VUMeter {
	el: HTMLElement
	canvas: HTMLCanvasElement
	input: MediaStreamAudioSourceNode
	running = true
	ana: AnalyserNode
	drawContext: CanvasRenderingContext2D
	vuBuf: Float32Array

	constructor(public audio: AudioContext, public srcStream: MediaStream) {
		this.el = <div class="vuMeter">
			{this.canvas = <canvas></canvas> as HTMLCanvasElement}
		</div>

		this.drawContext = this.canvas.getContext("2d")

		this.input = this.audio.createMediaStreamSource(srcStream)

		this.ana = this.audio.createAnalyser()
		this.ana.fftSize = 128
		this.ana.smoothingTimeConstant = .5

		this.input.connect(this.ana)

		this.vuBuf = new Float32Array(this.ana.frequencyBinCount)

		this.render()
	}

	render() {
		const ctx = this.drawContext

		if (this.canvas.width != this.el.offsetWidth || this.canvas.height != this.el.offsetHeight) {
			this.canvas.width = this.el.offsetWidth
			this.canvas.height = this.el.offsetHeight
		}

		const w = this.canvas.width
		const h = this.canvas.height
		ctx.clearRect(0, 0, w, h)
		//--------------------------------------

		let g = ctx.createLinearGradient(0, h, 0, 0)
		g.addColorStop(0, "#000000FF")
		g.addColorStop(1, "#FFFFFF00")
		ctx.fillStyle = g

		ctx.fillRect(0, 0, w, h)


		ctx.lineWidth = 0

		g = ctx.createLinearGradient(0, h, 0, 0)
		g.addColorStop(0, "#070")
		g.addColorStop(.5, "#CC0")
		g.addColorStop(1, "#F00")
		ctx.fillStyle = g
		// ctx.lineWidth = 5
		// ctx.strokeStyle = "#700"

		this.ana.getFloatFrequencyData(this.vuBuf)
		const numItems = this.vuBuf.length
		for (let i = 0; i < numItems; i++) {
			//map dB to [0,1]ish
			let f = (this.vuBuf[i] + 120) / 70
			if (f < 0) f = 0
			// const f = i / numItems

			ctx.fillRect(i / numItems * w, h, w / numItems, -(f * h + 1))
		}



		if (this.running) requestAnimationFrame(() => this.render())
	}




	close() {
		this.running = false
		this.input.disconnect()
	}
}