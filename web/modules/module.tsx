
export default abstract class Module {
	abstract getName(): string;
	abstract renderThumb(): HTMLElement;

	opened(): void {}
	render(): HTMLElement { return this.renderThumb(); }
	closed(): void {}

	getId(): string { return this.constructor.name; }
}

