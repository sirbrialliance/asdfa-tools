import Module from './modules/Module';

declare global {
	interface Window {
		requireList(filterFn?: (name: string) => boolean): string[];
		require(name: string): any;
	}
}

var moduleNames = window.requireList(x => x.startsWith("modules/") && x !== 'modules/Module');
var modules: Module[] = [];

for (let moduleName of moduleNames) {
	let moduleClass = window.require(moduleName).default;
	let module = new moduleClass() as Module;
	modules.push(module);
}

console.log(modules);

var main = document.querySelector("main");

for (let module of modules) {
	main.appendChild(
		<div class={"moduleTile md" + module.constructor.name}>
			<h2>{module.getName()}</h2>
			{module.renderThumb()}
		</div>
	);
}

