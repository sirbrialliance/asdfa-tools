import Module from './modules/Module'
import {jsxText} from 'lib/jsx-runtime'
import * as util from './lib/util'
import contentList from './lib/contentList'

declare global {
	interface Window {
		requireList(filterFn?: (name: string) => boolean): string[]
		require(name: string): any
	}
}

let modulePaths = contentList.modules.map(x => "modules/" + x)
let modules: Module[] = []
let moduleIds: string[] = []

let main = <main/>
let titleHeader: HTMLElement = null
let header = <header>
	{/* will add an h1 with the title here in a moment */}
	<input type="text" id="searchBox" placeholder="Filter Modules"/>
</header>
let originalTitle = ""

let currentModule: Module = null
let currentModuleActive = false

//------------------------------------------------------------

initModules()
util.init()
initDOM()

//------------------------------------------------------------


function initModules() {
	//apply shim for loading paths
	(window as any).define("random-js", ["third/random-js.esm"], (mod: any) => mod)

	for (let modulePath of modulePaths) {
		let moduleClass = window.require(modulePath).default
		let module = new moduleClass() as Module
		let id = module.getId()
		if (id !== modulePath.replace(/^modules\//, "")) {
			console.error("Bad module name", id, modulePath)
		} else {
			modules.push(module)
		}
	}

	modules.sort((a, b) => {
		let sortDiff = a.sortOrder() - b.sortOrder()
		if (sortDiff !== 0) return sortDiff

		return a.getName().localeCompare(b.getName())
	})

	moduleIds = modules.map(x => x.getId())

	//console.log(modules, moduleIds)
}

function initDOM() {
	document.body.textContent = ''

	document.body.appendChild(header)
	document.body.appendChild(main)

	originalTitle = document.head.querySelector("title").textContent

	window.addEventListener("popstate", ev => {
		if (!askMayLeave()) {
			ev.preventDefault()
			return
		}

		updatePage()
	})

	document.addEventListener("click", ev => {
		if (ev.defaultPrevented) return

		let target = ev.target as HTMLElement
		while (target && target.tagName !== "A") target = target.parentElement
		if (!target) return

		let link = target as HTMLAnchorElement //tell the compiler something we know.

		if (link.href.startsWith(document.location.origin)) {
			//local link:
			ev.preventDefault() //don't use usual nav, we don't need to reload the page

			if (!askMayLeave()) return //maybe don't leave

			navTo(link.href.substring(document.location.origin.length + 1))
		} else {
			//external link, don't preventDefault.
		}
	}, true)

	updatePage()

	//pick a random BG image
	setTimeout(() => {
		//pick an image
		let recentBGs = (localStorage.getItem("main.recentBGs") || "").split(",")
		let candidates = contentList.bgImages.filter(x => recentBGs.indexOf(x) < 0)
		if (!candidates.length) {
			recentBGs = []
			candidates = contentList.bgImages
		}
		let bg = candidates[Math.floor(Math.random() * candidates.length)]
		recentBGs.push(bg)
		localStorage.setItem("main.recentBGs", recentBGs.join(','))

		//find html::before and add as background
		let mainSheet = document.querySelector("link[rel=stylesheet][href='main.css']") as HTMLLinkElement
		let sheet = mainSheet.sheet
		for (let i = 0; i < sheet.rules.length; i++) {
			const item = sheet.rules.item(i) as CSSStyleRule
			if (item.selectorText == "html::before") {
				item.style.backgroundImage = `url('/bg/${bg}.jpg')`
				return
			}
		}
	}, 1) //let other more important stuff run first
}


/**
 * If our current module wants us to confirm leaving, asks. Returns true if there's no such concern or
 * the user confirmed. False if we should not leave.
 */
function askMayLeave() {
	if (currentModule && currentModule.unloadConcern) {
		return confirm(currentModule.unloadConcern + "\nLeave anyway?")
	} else {
		return true
	}
}


/** Goes the to given URL (without a leading /) on our site as if (or because) the user clicked it. */
function navTo(url: string) {
	//console.log("Nav to", url)
	history.pushState(null, "", "/" + url)
	updatePage()
}

export function restartModule() {
	updatePage()
}

function updatePage() {
	main.textContent = ''
	main.className = ''

	if (currentModuleActive && currentModule) {
		currentModule.isOpen = false
		currentModule.closed()
	}
	currentModule = null; currentModuleActive = false

	let page = document.location.pathname.substr(1)

	if (!page) {
		renderIndex()
	} else {
		let idx = moduleIds.indexOf(page)
		if (idx < 0) {
			renderSearch(page)
		} else {
			currentModule = modules[idx]
			let supported = currentModule.isSupported()

			if (supported === true) {
				renderModule(currentModule)
				currentModule.isOpen = true
				currentModule.opened()
				currentModuleActive = true
			} else {
				renderUnsupported(supported)
			}
		}
	}

	titleHeader?.remove()
	titleHeader = <h1><a class="logo" href="/"><img src="/logo.png" alt="asdfa"/></a></h1>
	if (currentModule) {
		titleHeader.appendChild(<span class="subTitle">
			{"» "}
			<a href={"/" + currentModule.getId()}>{currentModule.getName()}</a>
		</span>)
	} else {
		titleHeader.appendChild(<span class="subTitle home">A Set of Decently Functional Assessments</span>)
	}
	header.prepend(titleHeader)
}

function renderIndex() {
	document.title = originalTitle

	main.className = "indexPage"

	function renderThumb(module: Module) {
		let id = module.getId()
		let supported = module.isSupported() === true
		return (
			<div
				class={"moduleTile m_" + id + (supported ? "" : " unsupported") + " " + module.classNames()}
				title={supported ? module.getName() : "Not supported on this device/browser"}
				onClick={ev => {
					if (ev.defaultPrevented) return
					ev.preventDefault()
					navTo(id)
				}}
			>
				<h2><a href={"/" + id}>{module.getName()}</a></h2>
				{module.renderThumb()}
			</div>
		)
	}

	for (let module of modules) {
		main.appendChild(renderThumb(module))
	}
}

function renderModule(module: Module) {
	document.title = module.getName()
	main.className = "modulePage m_" + module.getId() + " " + module.classNames()

	//export current module for easy debugging
	;(window as any).__currentModule = currentModule

	let el = module.render()
	if (Array.isArray(el)) {
		for (let e of el) main.appendChild(e)
	} else {
		main.appendChild(el)
	}
}

function renderUnsupported(supported: boolean | HTMLElement | string) {
	main.appendChild(<h2>Unsupported - {currentModule.getName()}</h2>)
	main.className = "unsupported"

	if (typeof supported === "boolean") {
		main.appendChild(<span>This is not supported in your browser.</span>)
	} else if (typeof supported === "string") {
		let parts = supported.split('=')
		main.appendChild(<span>
			Using this requires a browser with support for <a href={"https://caniuse.com/" + parts[1]}>{parts[0]}</a>.
		</span>)
	} else {
		main.appendChild(supported)
	}

}

function renderSearch(page: string) {
	//todo: search feature
	document.title = "Not Found"
	main.appendChild(<h2>Not found (todo: search)</h2>)
}

