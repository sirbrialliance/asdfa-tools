
export function toXHex4(val: number) {
	if (val > 0xFFFF) return "0x" + val.toString(16);
	return "0x" + ('000' + val.toString(16)).substr(-4).toUpperCase();
}

export function toHex2(val: number) {
	if (val > 0xFF) return val.toString(16);
	return ('0' + val.toString(16)).substr(-2).toUpperCase();
}

export function randomItems<T>(list: Array<T>, count = 1) : Array<T> {
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

export function stats(data: number[]) {
	let sum = 0
	data.forEach(x => sum += x)
	let mean = sum / data.length
	let sorted = data.slice()
	sorted.sort()

	let median = NaN
	if (data.length) median = data[Math.floor(data.length / 2)]

	let sigSum = 0
	data.forEach(x => {
		let err = x - mean
		sigSum += err*err
	})
	let stdDev = Math.sqrt(sigSum / data.length)

	return {
		sum: sum,
		mean: mean,
		median: median,
		stdDev: stdDev,
	}
}
