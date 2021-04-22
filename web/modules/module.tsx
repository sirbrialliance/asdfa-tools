
export default abstract class Module {
	abstract getName(): string;
	abstract renderThumb(): HTMLElement;

	__beforeUnload: (ev: Event) => void;
	unloadConcern: string = null;

	/**
	 * Called before doing the usual render/open of the module.
	 * If this returns true, the feature is supported and things work normally.
	 * If not we display an error based on your return value and don't run the module.
	 * 	 - HTMLElement: (preferably a <span>), that is displayed as the error.
	 *   - false: a generic error is displayed
	 *   - "name=id": The given English name and https://caniuse.com/{id} path is used to display an error.
	 */
	isSupported(): boolean | HTMLElement | string { return true; }

	/** The page for the module has been opened. Called after render(). */
	opened(): void {}
	render(): HTMLElement | HTMLElement[] { return this.renderThumb(); }
	/**
	 * Modules should call this when they start or stop a state that should prompt the user before leaving.
	 * Call with a string to set a reason why the user would want to confirm leaving, set to null/falsy
	 * if there's no longer a concern.
	 */
	setUnloadConcern(concern: string) {
		this.unloadConcern = concern;
		if (concern) {
			this.__beforeUnload = this.__beforeUnload || (ev => {
				ev.preventDefault();
				(ev.returnValue as any) = this.unloadConcern;
			});
			window.addEventListener("beforeunload", this.__beforeUnload);
		} else {
			window.removeEventListener("beforeunload", this.__beforeUnload);
		}
	}

	closed(): void {}

	///Special sort order, lowest first, ties are alphabetized.
	sortOrder(): number { return 0; }
	///Space-separated CSS class names to apply to our containers.
	classNames(): string { return ""; }

	getId(): string { return this.constructor.name; }
}

export abstract class MetaModule extends Module {
	sortOrder() { return 10; }
	classNames(): string { return "meta"; }
}

