import Module from './modules/Module';
import {jsx} from './lib/jsx-runtime';

var a6: number = 4;

var el = <div class="bob" onClick={ev => console.log("click")}>
	hi!
	<span>some stuff</span>
	more things
	<span>another span</span>
	<span></span>
	<span><b><i>foo</i></b></span>
</div>;


console.log("hello", el);
document.body.appendChild(el);

//ad