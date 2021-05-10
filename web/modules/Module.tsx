
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

	abstract getId(): string
}

export abstract class MetaModule extends Module {
	sortOrder() { return 10; }
	classNames(): string { return "meta"; }
}


export interface DeviceInfo<DT> {
	id: string;
	el: HTMLElement;
	device: DT;
}

export abstract class DeviceModule<DT> extends Module {
	devices: Record<string, DeviceInfo<DT>> = {};
	gridEl: HTMLElement;
	noDevicesEl = <span class="noDevices">No devices found.</span>;
	_needsRender = true;

	///Returns an array of devices available to the browser.
	abstract getDevices() : Promise<[string, DT][]>;
	/**
	 * Called when we see a new device.
	 */
	abstract openDevice(deviceInfo: DeviceInfo<DT>): Promise<void>;
	///Called when we see a device disappear.
	abstract closeDevice(deviceInfo: DeviceInfo<DT>): Promise<void>;
	///Renders/updates the device's representation. Returns an HTML element to represent the device, possibly returning the existing device.el.
	abstract renderDevice(deviceInfo: DeviceInfo<DT>): HTMLElement;

	render() {
		return this.gridEl = <div class="deviceGrid"></div>;
	}

	_deferDeviceRender() {
		this._needsRender = true;
		setTimeout(() => {
			if (this._needsRender) this.renderDevices();
		}, 0);
	}

	renderDevices() {
		var num = 0;
		for (let id in this.devices) {
			++num;
			let deviceInfo = this.devices[id];
			let el = this.renderDevice(deviceInfo);
			if (deviceInfo.el && el !== deviceInfo.el) {
				deviceInfo.el.parentElement.replaceChild(el, deviceInfo.el);
			} else {
				this.gridEl.appendChild(el);
			}
			deviceInfo.el = el;
		}

		this.noDevicesEl.remove();
		if (!num) this.gridEl.appendChild(this.noDevicesEl);

		this._needsRender = false;
	}

	async updateDevices() {
		//get devices
		var devices = await this.getDevices();
		var changes: Promise<void>[] = [];

		//check for added devices
		var existingIds: Record<string, true> = {};
		for (let [id, device] of devices) {
			existingIds[id] = true;

			let deviceInfo = this.devices[id];
			if (!deviceInfo) {
				//new device
				changes.push(this.addDevice(id, device));
			} else {
				//existing device, no action
			}
		}

		//check for removed devices
		for (let id in this.devices) {
			if (existingIds[id]) continue;
			changes.push(this.removeDevice(id));
		}

		await Promise.all(changes);
	}

	closed() {
		var promises = [];
		for (let id in this.devices) {
			promises.push(this.closeDevice(this.devices[id]));
		}
		this.devices = {};
		//await Promise.all(promises)...
	}

	async addDevice(id: string, device: DT): Promise<void> {
		if (this.devices[id]) return;//already added
		this.devices[id] = {
			device: device,
			el: null,
			id: id,
		};
		await this.openDevice(this.devices[id]);

		this._deferDeviceRender();
	}

	async removeDevice(id: string): Promise<void> {
		if (!this.devices[id]) return;//already removed
		let deviceInfo = this.devices[id];
		await this.closeDevice(deviceInfo);
		if (deviceInfo.el) deviceInfo.el.remove();
		delete this.devices[id];

		this._deferDeviceRender();
	}

}

