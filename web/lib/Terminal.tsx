
export default class Terminal {
	el: HTMLElement
	pinnedElements: HTMLElement[]

	constructor() {
		this.el = <terminal/>
		this.pinnedElements = []
	}

	/** Pins the given element to the bottom of the <terminal> */
	pin(pinned: HTMLElement) {
		this.el.appendChild(pinned)
		this.pinnedElements.push(pinned)
		return pinned
	}

	unpin(pinned: HTMLElement) {
		pinned.remove()
		this.pinnedElements.splice(this.pinnedElements.indexOf(pinned), 1)
		return pinned
	}

	clearPinned() {
		for (let pinned of this.pinnedElements) {
			pinned.remove()
		}

		this.pinnedElements = []
	}


	log(msg: string | HTMLElement, className: string = "system") {
		if (typeof msg === "string") {
			var msgEl = <span class={className}>{msg}</span>
		} else {
			msgEl = msg
		}

		if (this.pinnedElements.length) this.el.insertBefore(msgEl, this.pinnedElements[this.pinnedElements.length - 1])
		else this.el.appendChild(msgEl)

		//todo: don't scroll unless already at the bottom
		this.el.scrollTo(0, this.el.scrollHeight)

		return msgEl
	}
}