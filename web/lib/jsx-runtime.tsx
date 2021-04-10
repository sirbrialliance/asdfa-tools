/**
 * JSX-compatible DOM element creator, but returns regular DOM nodes.
 */

import {NodeFactory, EventHandler} from "./jsx-types";

export function jsxText(text: string) {
	return document.createTextNode(text);
}

export function jsx(nodeType: string, props: NodeFactory): HTMLElement {
	return jsxs(nodeType, props);
}

export function jsxs(nodeType: string, props: NodeFactory): HTMLElement {
	// console.log("jsxs: " , arguments);

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
		} else if (k === "class") {
			el.className = props[k];
		} else if (k === "style") {
			let style = props[k];//compiler isn't smart enough for typeof props[k] === "string"
			if (typeof style === "string") {
				el.style.cssText = style;
			} else {
				for (let k in style) {
					el.style[k] = style[k];
				}
			}
		} else if (k.startsWith("on")) {
			el.addEventListener(k.toLowerCase().substring(2), (props as any)[k] as EventHandler);
		} else {//anything with a "-" in it
			el.setAttribute(k, (props as any)[k].toString());
		}
	}

	return el;
}
