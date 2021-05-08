
interface SectionInfo {
	title: HTMLElement
	body: HTMLElement
}

export default class TabSet {
	el: HTMLElement
	titleEl = <div class="tabTitles"></div>
	sections: Record<string, SectionInfo> = {}
	currentTab = ""

	constructor(tabDOM: HTMLElement) {
		this.el = tabDOM

		let firstTabId = ""

		this.el.querySelectorAll("section").forEach(_el => {
			let el = _el as HTMLElement
			if (el.parentElement !== this.el) return

			let tabId = el.getAttribute("data-tab")
			if (!firstTabId) firstTabId = tabId

			let sectionInfo = {
				body: el,
				title: <h2 onClick={ev => this.selectTab(tabId)}>{el.getAttribute("data-label")}</h2>
			}

			this.titleEl.appendChild(sectionInfo.title)

			this.sections[tabId] = sectionInfo
		})

		this.el.prepend(this.titleEl)

		this.selectTab(firstTabId)
	}

	selectTab(tabId: string): void {
		this.currentTab = tabId
		for (let k in this.sections) {
			let tab = this.sections[k]
			if (k === tabId) {
				tab.body.style.display = ""
				tab.title.classList.add("selected")
			} else {
				tab.body.style.display = "none"
				tab.title.classList.remove("selected")
			}

		}
	}
}