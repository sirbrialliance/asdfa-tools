
export function toXHex4(val: number) {
	if (val > 0xFFFF) return "0x" + val.toString(16);
	return "0x" + ('000' + val.toString(16)).substr(-4).toUpperCase();
}

export function toHex2(val: number) {
	if (val > 0xFF) return val.toString(16);
	return ('0' + val.toString(16)).substr(-2).toUpperCase();
}

export function randomItems<T>(list: Array<T>, count: Number = 1) : Array<T> {
	if (count >= list.length) return [...list];
	var ret: Array<T> = [];
	var usedIndexes: Set<number> = new Set();
	while (ret.length < count) {
		var idx = Math.floor(Math.random() * list.length);
		if (usedIndexes.has(idx)) continue;
		usedIndexes.add(idx);
		ret.push(list[idx]);
	}

	return ret;
}

// export var shiftKeyDown = false;

export function init() {
	// document.addEventListener("keydown", ev => {
	// 	// console.log(ev);
	// 	if (ev.key === "Shift") shiftKeyDown = true;
	// });
	// document.addEventListener("keyup", ev => {
	// 	if (ev.key === "Shift") shiftKeyDown = false;
	// });
}
