import Module from './modules/Module';

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

//console.log(modules);

var currentModule: Module = null;
var main = document.querySelector("main");
var originalTitle = document.head.querySelector("title").textContent;
window.addEventListener("popstate", ev => {
	updatePage();
});
updatePage();

document.addEventListener("click", ev => {
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





/** Goes the to given URL (without a leading /) on our site as if (or because) the user clicked it. */
function navTo(url: string) {
	console.log("Nav to", url);
	history.pushState(null, "", "/" + url);
	updatePage();
}

function updatePage() {
	main.textContent = '';
	currentModule?.closed();
	currentModule = null;
	var page = document.location.pathname.substr(1);

	if (!page) {
		renderIndex();
		return;
	}

	var idx = moduleIds.indexOf(page);
	if (idx < 0) {
		renderSearch(page);
	} else {
		currentModule = modules[idx];
		renderModule(currentModule);
		currentModule.opened();
	}
}

function renderIndex() {
	document.title = originalTitle;

	function renderThumb(module: Module) {
		var id = module.getId();
		return (
			<div
				class={"moduleTile md" + id}
				onClick={ev => navTo(id)}
			>
				<h2>{module.getName()}</h2>
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
	main.appendChild(<div class={"modulePage md" + module.getId()}>
		<h2>{module.getName()}</h2>
		{module.render()}
	</div>);
}

function renderSearch(page: string) {
	document.title = "Not Found";
	main.appendChild(<h2>Not found (todo: search)</h2>);
}

