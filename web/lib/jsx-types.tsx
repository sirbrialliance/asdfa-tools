//do some annoying TypeScript compatibility dances

/*  A bunch of this is from @types/react which is:
MIT License

Copyright (c) Microsoft Corporation.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE
*/

export type EventHandler = (ev: Event) => void;

type AnyCSSStyleDeclaration = {
	[K in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[K];
}

export class NodeFactory {
	class?: string;

	children?: HTMLElement | string | Array<HTMLElement | string>;
	// style?: string | Map<string, string>;
	style?: string | AnyCSSStyleDeclaration;

	id?: string;
	title?: string;
	contenteditable?: string;

	href?: string;

	name?: string;
	type?: string;
	value?: string;
	placeholder?: string;

	//-------- events ---------

	// Clipboard Events
	onCopy?: EventHandler;
	onCopyCapture?: EventHandler;
	onCut?: EventHandler;
	onCutCapture?: EventHandler;
	onPaste?: EventHandler;
	onPasteCapture?: EventHandler;

	// Composition Events
	onCompositionEnd?: EventHandler;
	onCompositionEndCapture?: EventHandler;
	onCompositionStart?: EventHandler;
	onCompositionStartCapture?: EventHandler;
	onCompositionUpdate?: EventHandler;
	onCompositionUpdateCapture?: EventHandler;

	// Focus Events
	onFocus?: EventHandler;
	onFocusCapture?: EventHandler;
	onBlur?: EventHandler;
	onBlurCapture?: EventHandler;

	// Form Events
	onChange?: EventHandler;
	onChangeCapture?: EventHandler;
	onBeforeInput?: EventHandler;
	onBeforeInputCapture?: EventHandler;
	onInput?: EventHandler;
	onInputCapture?: EventHandler;
	onReset?: EventHandler;
	onResetCapture?: EventHandler;
	onSubmit?: EventHandler;
	onSubmitCapture?: EventHandler;
	onInvalid?: EventHandler;
	onInvalidCapture?: EventHandler;

	// Image Events
	onLoad?: EventHandler;
	onLoadCapture?: EventHandler;
	onError?: EventHandler;
	onErrorCapture?: EventHandler;

	// Keyboard Events
	onKeyDown?: EventHandler;
	onKeyDownCapture?: EventHandler;
	onKeyPress?: EventHandler;
	onKeyPressCapture?: EventHandler;
	onKeyUp?: EventHandler;
	onKeyUpCapture?: EventHandler;

	// Media Events
	onAbort?: EventHandler;
	onAbortCapture?: EventHandler;
	onCanPlay?: EventHandler;
	onCanPlayCapture?: EventHandler;
	onCanPlayThrough?: EventHandler;
	onCanPlayThroughCapture?: EventHandler;
	onDurationChange?: EventHandler;
	onDurationChangeCapture?: EventHandler;
	onEmptied?: EventHandler;
	onEmptiedCapture?: EventHandler;
	onEncrypted?: EventHandler;
	onEncryptedCapture?: EventHandler;
	onEnded?: EventHandler;
	onEndedCapture?: EventHandler;
	onLoadedData?: EventHandler;
	onLoadedDataCapture?: EventHandler;
	onLoadedMetadata?: EventHandler;
	onLoadedMetadataCapture?: EventHandler;
	onLoadStart?: EventHandler;
	onLoadStartCapture?: EventHandler;
	onPause?: EventHandler;
	onPauseCapture?: EventHandler;
	onPlay?: EventHandler;
	onPlayCapture?: EventHandler;
	onPlaying?: EventHandler;
	onPlayingCapture?: EventHandler;
	onProgress?: EventHandler;
	onProgressCapture?: EventHandler;
	onRateChange?: EventHandler;
	onRateChangeCapture?: EventHandler;
	onSeeked?: EventHandler;
	onSeekedCapture?: EventHandler;
	onSeeking?: EventHandler;
	onSeekingCapture?: EventHandler;
	onStalled?: EventHandler;
	onStalledCapture?: EventHandler;
	onSuspend?: EventHandler;
	onSuspendCapture?: EventHandler;
	onTimeUpdate?: EventHandler;
	onTimeUpdateCapture?: EventHandler;
	onVolumeChange?: EventHandler;
	onVolumeChangeCapture?: EventHandler;
	onWaiting?: EventHandler;
	onWaitingCapture?: EventHandler;

	// MouseEvents
	onAuxClick?: EventHandler;
	onAuxClickCapture?: EventHandler;
	onClick?: EventHandler;
	onClickCapture?: EventHandler;
	onContextMenu?: EventHandler;
	onContextMenuCapture?: EventHandler;
	onDoubleClick?: EventHandler;
	onDoubleClickCapture?: EventHandler;
	onDrag?: EventHandler;
	onDragCapture?: EventHandler;
	onDragEnd?: EventHandler;
	onDragEndCapture?: EventHandler;
	onDragEnter?: EventHandler;
	onDragEnterCapture?: EventHandler;
	onDragExit?: EventHandler;
	onDragExitCapture?: EventHandler;
	onDragLeave?: EventHandler;
	onDragLeaveCapture?: EventHandler;
	onDragOver?: EventHandler;
	onDragOverCapture?: EventHandler;
	onDragStart?: EventHandler;
	onDragStartCapture?: EventHandler;
	onDrop?: EventHandler;
	onDropCapture?: EventHandler;
	onMouseDown?: EventHandler;
	onMouseDownCapture?: EventHandler;
	onMouseEnter?: EventHandler;
	onMouseLeave?: EventHandler;
	onMouseMove?: EventHandler;
	onMouseMoveCapture?: EventHandler;
	onMouseOut?: EventHandler;
	onMouseOutCapture?: EventHandler;
	onMouseOver?: EventHandler;
	onMouseOverCapture?: EventHandler;
	onMouseUp?: EventHandler;
	onMouseUpCapture?: EventHandler;

	// Selection Events
	onSelect?: EventHandler;
	onSelectCapture?: EventHandler;

	// Touch Events
	onTouchCancel?: EventHandler;
	onTouchCancelCapture?: EventHandler;
	onTouchEnd?: EventHandler;
	onTouchEndCapture?: EventHandler;
	onTouchMove?: EventHandler;
	onTouchMoveCapture?: EventHandler;
	onTouchStart?: EventHandler;
	onTouchStartCapture?: EventHandler;

	// Pointer Events
	onPointerDown?: EventHandler;
	onPointerDownCapture?: EventHandler;
	onPointerMove?: EventHandler;
	onPointerMoveCapture?: EventHandler;
	onPointerUp?: EventHandler;
	onPointerUpCapture?: EventHandler;
	onPointerCancel?: EventHandler;
	onPointerCancelCapture?: EventHandler;
	onPointerEnter?: EventHandler;
	onPointerEnterCapture?: EventHandler;
	onPointerLeave?: EventHandler;
	onPointerLeaveCapture?: EventHandler;
	onPointerOver?: EventHandler;
	onPointerOverCapture?: EventHandler;
	onPointerOut?: EventHandler;
	onPointerOutCapture?: EventHandler;
	onGotPointerCapture?: EventHandler;
	onGotPointerCaptureCapture?: EventHandler;
	onLostPointerCapture?: EventHandler;
	onLostPointerCaptureCapture?: EventHandler;

	// UI Events
	onScroll?: EventHandler;
	onScrollCapture?: EventHandler;

	// Wheel Events
	onWheel?: EventHandler;
	onWheelCapture?: EventHandler;

	// Animation Events
	onAnimationStart?: EventHandler;
	onAnimationStartCapture?: EventHandler;
	onAnimationEnd?: EventHandler;
	onAnimationEndCapture?: EventHandler;
	onAnimationIteration?: EventHandler;
	onAnimationIterationCapture?: EventHandler;

	// Transition Events
	onTransitionEnd?: EventHandler;
	onTransitionEndCapture?: EventHandler;
}

declare global { namespace JSX {
	// function createElement(tag: string, props: any, children: Array<HTMLElement>): HTMLElement;

	type Element = HTMLElement;

  interface IntrinsicElements {
		terminal: NodeFactory;

		a: NodeFactory;
		abbr: NodeFactory;
		address: NodeFactory;
		area: NodeFactory;
		article: NodeFactory;
		aside: NodeFactory;
		audio: NodeFactory;
		b: NodeFactory;
		base: NodeFactory;
		bdi: NodeFactory;
		bdo: NodeFactory;
		big: NodeFactory;
		blockquote: NodeFactory;
		body: NodeFactory;
		br: NodeFactory;
		button: NodeFactory;
		canvas: NodeFactory;
		caption: NodeFactory;
		cite: NodeFactory;
		code: NodeFactory;
		col: NodeFactory;
		colgroup: NodeFactory;
		data: NodeFactory;
		datalist: NodeFactory;
		dd: NodeFactory;
		del: NodeFactory;
		details: NodeFactory;
		dfn: NodeFactory;
		dialog: NodeFactory;
		div: NodeFactory;
		dl: NodeFactory;
		dt: NodeFactory;
		em: NodeFactory;
		embed: NodeFactory;
		fieldset: NodeFactory;
		figcaption: NodeFactory;
		figure: NodeFactory;
		footer: NodeFactory;
		form: NodeFactory;
		h1: NodeFactory;
		h2: NodeFactory;
		h3: NodeFactory;
		h4: NodeFactory;
		h5: NodeFactory;
		h6: NodeFactory;
		head: NodeFactory;
		header: NodeFactory;
		hgroup: NodeFactory;
		hr: NodeFactory;
		html: NodeFactory;
		i: NodeFactory;
		iframe: NodeFactory;
		img: NodeFactory;
		input: NodeFactory;
		ins: NodeFactory;
		kbd: NodeFactory;
		keygen: NodeFactory;
		label: NodeFactory;
		legend: NodeFactory;
		li: NodeFactory;
		link: NodeFactory;
		main: NodeFactory;
		map: NodeFactory;
		mark: NodeFactory;
		menu: NodeFactory;
		menuitem: NodeFactory;
		meta: NodeFactory;
		meter: NodeFactory;
		nav: NodeFactory;
		noscript: NodeFactory;
		object: NodeFactory;
		ol: NodeFactory;
		optgroup: NodeFactory;
		option: NodeFactory;
		output: NodeFactory;
		p: NodeFactory;
		param: NodeFactory;
		picture: NodeFactory;
		pre: NodeFactory;
		progress: NodeFactory;
		q: NodeFactory;
		rp: NodeFactory;
		rt: NodeFactory;
		ruby: NodeFactory;
		s: NodeFactory;
		samp: NodeFactory;
		slot: NodeFactory;
		script: NodeFactory;
		section: NodeFactory;
		select: NodeFactory;
		small: NodeFactory;
		source: NodeFactory;
		span: NodeFactory;
		strong: NodeFactory;
		style: NodeFactory;
		sub: NodeFactory;
		summary: NodeFactory;
		sup: NodeFactory;
		table: NodeFactory;
		template: NodeFactory;
		tbody: NodeFactory;
		td: NodeFactory;
		textarea: NodeFactory;
		tfoot: NodeFactory;
		th: NodeFactory;
		thead: NodeFactory;
		time: NodeFactory;
		title: NodeFactory;
		tr: NodeFactory;
		track: NodeFactory;
		u: NodeFactory;
		ul: NodeFactory;
		var: NodeFactory;
		video: NodeFactory;
		wbr: NodeFactory;
		webview: NodeFactory;
  }
}}

export default null;
