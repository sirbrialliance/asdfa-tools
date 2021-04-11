
export default abstract class Module {
	abstract getName(): string;
	abstract renderThumb(): HTMLElement;

	/**
	 * Called before doing the usual render/open of the module.
	 * If this returns true, the feature is supported and things work normally.
	 * If not we display an error based on your return value and don't run the module.
	 * 	 - HTMLElement: (preferably a <span>), that is displayed as the error.
	 *   - false: a generic error is displayed
	 *   - "name=id": The given English name and https://caniuse.com/{id} path is used to display an error.
	 */
	isSupported(): boolean | HTMLElement | string { return true;}

	/** The page for the module has been opened, called after render(). */
	opened(): void {}
	render(): HTMLElement | HTMLElement[] { return this.renderThumb(); }
	/**
	 * Called when we try to leave an opened module (by internal link or page unload).
	 * Return true if that's fine, a message for the user if they should conform leaving.
	 * Note that the message likely won't be seen by the user if it's not internal navigation.
	 */
	mayClose(): boolean | string { return true; }
	closed(): void {}

	getId(): string { return this.constructor.name; }
}

