/**
 * JSX-compatible DOM element creator, but returns regular DOM nodes.
 */

 import {NodeFactory} from "./jsx-types";


export function jsx(nodeType: string, props: NodeFactory): HTMLElement {
	return jsxs(nodeType, props);
}

export function jsxs(nodeType: string, props: NodeFactory): HTMLElement {
	console.log("jsxs: " , arguments);

	var el = document.createElement(nodeType);

	for (let k in props) {
		if (k === "children") {
			var items = [];
			if (props.children instanceof Array) {
				items = props.children;
			} else {
				items = [props.children];
			}
			for (let child of items) {
				if (child instanceof HTMLElement) {
					el.appendChild(child);
				} else {
					let textNode = document.createTextNode(child);
					el.appendChild(textNode);
				}
			}
		}
	}

	return el;
}

// export default function(html /*, ... */ ) {
	// var el = $($.parseHTML(html)[0]);
	// if (!el.length) throw new Error("Invalid markup " + html);

	// for (var i = 1; i < arguments.length; i++) {
	// 	var arg = arguments[i];
	// 	if (!arg) continue;

	// 	if (arg && arg.constructor == Array) {
	// 		for (let j of arg) el.append(j);
	// 	} else if (typeof arg === "string") {
	// 		el.append(document.createTextNode(arg));
	// 	} else if (arg.jquery) {
	// 		el.append(arg);
	// 	} else if (typeof arg === "object") {
	// 		for (let k in arg) {
	// 			var v = arg[k];
	// 			if (k.match(/^on/)) {
	// 				el.on(k.substr(2), v);
	// 			} else if (k === "css") {
	// 				el.css(v);
	// 			} else {
	// 				if (v) el.attr(k, v);
	// 			}
	// 		}
	// 	}

	// }

	// return el;
// }