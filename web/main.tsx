import Module from './modules/Module';
import {jsxText} from 'lib/jsx-runtime';

declare global {
	interface Window {
		requireList(filterFn?: (name: string) => boolean): string[];
		require(name: string): any;
	}
}

var modulePaths = window.requireList(x => x.startsWith("modules/") && x !== 'modules/Module');
var modules: Module[] = [];
var moduleIds: string[] = [];

for (let modulePath of modulePaths) {
	let moduleClass = window.require(modulePath).default;
	let module = new moduleClass() as Module;
	let id = module.getId();
	if (id !== modulePath.replace(/^modules\//, "")) {
		console.error("Bad module name", id, modulePath);
	} else {
		modules.push(module);
		moduleIds.push(id);
	}
}

// console.log(modules);

document.body.textContent = '';

var main = <main/>;
var titleHeader: HTMLElement = null;
var header = <header>
	{/* will add an h1 with the tile here in a moment */}
	<input type="text" id="searchBox" placeholder="Filter Modules"/>
</header>;
document.body.appendChild(main);
document.body.appendChild(header);

var originalTitle = document.head.querySelector("title").textContent;

window.addEventListener("popstate", ev => {
	updatePage();
});

var currentModule: Module = null;
var currentModuleActive = false;
document.addEventListener("click", ev => {
	if (ev.defaultPrevented) return;

	var target = ev.target as HTMLElement;
	while (target && target.tagName !== "A") target = target.parentElement;
	if (!target) return;

	var link = target as HTMLAnchorElement;//tell the compiler something we know.

	if (link.href.startsWith(document.location.origin)) {
		//local link:
		ev.preventDefault();
		navTo(link.href.substring(document.location.origin.length + 1));
	} else {
		//external link, don't preventDefault.
	}
}, true);

updatePage();


/** Goes the to given URL (without a leading /) on our site as if (or because) the user clicked it. */
function navTo(url: string) {
	console.log("Nav to", url);
	history.pushState(null, "", "/" + url);
	updatePage();
}

function updatePage() {
	main.textContent = '';
	main.className = '';

	if (currentModuleActive) currentModule?.closed();
	currentModule = null; currentModuleActive = false;

	var page = document.location.pathname.substr(1);

	if (!page) {
		renderIndex();
	} else {
		var idx = moduleIds.indexOf(page);
		if (idx < 0) {
			renderSearch(page);
		} else {
			currentModule = modules[idx];
			var supported = currentModule.isSupported();

			if (supported === true) {
				renderModule(currentModule);
				currentModule.opened();
				currentModuleActive = true;
			} else {
				renderUnsupported(supported);
			}
		}
	}

	titleHeader?.remove();
	titleHeader = <h1><a href="/">asdfa.net</a></h1>;
	if (currentModule) {
		titleHeader.appendChild(jsxText(" » "));
		titleHeader.appendChild(<a href={"/" + currentModule.getId()}>{currentModule.getName()}</a>);
	}
	header.prepend(titleHeader);
}

function renderIndex() {
	document.title = originalTitle;

	main.className = "indexPage";

	function renderThumb(module: Module) {
		var id = module.getId();
		var supported = module.isSupported() === true;
		return (
			<div
				class={"moduleTile m_" + id + (supported ? "" : " unsupported")}
				title={supported ? module.getName() : "Not supported on this device+browser"}
				onClick={ev => {
					if (ev.defaultPrevented) return;
					ev.preventDefault();
					navTo(id);
				}}
				>
				<h2><a href={"/" + id}>{module.getName()}</a></h2>
				{module.renderThumb()}
			</div>
		);
	}

	for (let module of modules) {
		main.appendChild(renderThumb(module));
	}
}

function renderModule(module: Module) {
	document.title = module.getName();
	main.className = "modulePage m_" + module.getId();

	var el = module.render();
	if (Array.isArray(el)) {
		for (let e of el) main.appendChild(e);
	} else {
		main.appendChild(el);
	}
}

function renderUnsupported(supported: boolean | HTMLElement | string) {
	main.appendChild(<h2>Unsupported - {currentModule.getName()}</h2>);
	main.className = "unsupported";

	if (typeof supported === "boolean") {
		main.appendChild(<span>This is not supported in your browser.</span>)
	} else if (typeof supported === "string") {
		var parts = supported.split('=');
		main.appendChild(<span>
			Using this requires a browser with support for <a href={"https://caniuse.com/" + parts[1]}>{parts[0]}</a>.
		</span>);
	} else {
		main.appendChild(supported);
	}

}

function renderSearch(page: string) {
	//todo: search feature
	document.title = "Not Found";
	main.appendChild(<h2>Not found (todo: search)</h2>);
}

