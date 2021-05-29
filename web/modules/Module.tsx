import { restartModule } from '../main'

/* Module boilerplate:

import Module from './Module';

export default class FooBar extends Module {
		getId() { return "FooBar" }

    renderThumb(): HTMLElement {
        return <span>Lorem ipsum dolor sit amet...</span>
    }

    getName(): string { return "Foo Bar"; }

    render() {
        return [<span>hi</span>];
    }

    opened() {}

    closed() {}
}


 */

/** Basically a page. */
export default abstract class Module {
	abstract getName(): string
	abstract renderThumb(): HTMLElement

	__beforeUnload: (ev: Event) => void
	unloadConcern: string = null
	isOpen = false

	/**
	 * Called before doing the usual render/open of the module.
	 * If this returns true, the feature is supported and things work normally.
	 * If not we display an error based on your return value and don't run the module.
	 * 	 - HTMLElement: (preferably a <span>), that is displayed as the error.
	 *   - false: a generic error is displayed
	 *   - "name=id": The given English name and https://caniuse.com/{id} path is used to display an error.
	 */
	isSupported(): boolean | HTMLElement | string { return true }

	/** The page for the module has been opened. Called after render(). */
	opened(): void {}
	render(): HTMLElement | HTMLElement[] { return this.renderThumb() }
	/**
	 * Modules should call this when they start or stop a state that should prompt the user before leaving.
	 * Call with a string to set a reason why the user would want to confirm leaving, set to null/falsy
	 * if there's no longer a concern.
	 */
	setUnloadConcern(concern: string) {
		this.unloadConcern = concern
		if (concern) {
			this.__beforeUnload = this.__beforeUnload || (ev => {
				ev.preventDefault()
				;(ev.returnValue as any) = this.unloadConcern
			})
			window.addEventListener("beforeunload", this.__beforeUnload)
		} else {
			window.removeEventListener("beforeunload", this.__beforeUnload)
		}
	}

	closed(): void {}

	/** Call to act like we just unloaded and then loaded this module. */
	reload() {
		restartModule()
	}

	///Special sort order, lowest first, ties are alphabetized.
	sortOrder(): number { return 0 }
	///Space-separated CSS class names to apply to our containers.
	classNames(): string { return "" }

	abstract getId(): string
}

export abstract class MetaModule extends Module {
	sortOrder() { return 10 }
	classNames(): string { return "meta" }
}


export interface DeviceInfo {
	id: string
	el: HTMLElement
}

export abstract class DeviceModule<DI extends DeviceInfo> extends Module {
	devices: Record<string, DI> = {}
	gridEl: HTMLElement
	noDevicesEl = <span class="noDevices">No devices found.</span>
	_needsRender = true

	///Returns an array of devices available to the browser.
	abstract getDevices() : Promise<DI[]>
	/**
	 * Called when we see a new device.
	 */
	abstract openDevice(deviceInfo: DI): Promise<void>
	///Called when we see a device disappear.
	abstract closeDevice(deviceInfo: DI): Promise<void>
	///Renders/updates the device's representation. Returns an HTML element to represent the device, possibly returning the existing device.el.
	abstract renderDevice(deviceInfo: DI): HTMLElement

	render() {
		this._deferDeviceRender()
		return this.gridEl = <div class="deviceGrid"></div>
	}

	_deferDeviceRender() {
		this._needsRender = true
		setTimeout(() => {
			if (this._needsRender) this.renderDevices()
		}, 0)
	}

	renderDevices() {
		let num = 0
		for (let id in this.devices) {
			++num
			let deviceInfo = this.devices[id]
			let el = this.renderDevice(deviceInfo)
			if (deviceInfo.el && el !== deviceInfo.el) {
				deviceInfo.el.parentElement.replaceChild(el, deviceInfo.el)
			} else {
				this.gridEl.appendChild(el)
			}
			deviceInfo.el = el
		}

		if (num && this.noDevicesEl.parentElement) this.noDevicesEl.parentElement.removeChild(this.noDevicesEl)
		if (!num) this.gridEl.appendChild(this.noDevicesEl)

		this._needsRender = false
	}

	async updateDevices() {
		//get devices
		let devices = await this.getDevices()
		let changes: Promise<void>[] = []

		//check for added devices
		let existingIds: Record<string, true> = {}
		for (let device of devices) {
			let id = device.id
			existingIds[id] = true

			let deviceInfo = this.devices[id]
			if (!deviceInfo) {
				//new device
				changes.push(this.addDevice(device))
			} else {
				//existing device, no action
			}
		}

		//check for removed devices
		for (let id in this.devices) {
			if (existingIds[id]) continue
			changes.push(this.removeDevice(this.devices[id]))
		}

		await Promise.all(changes)
	}

	opened() {
		this.updateDevices()
	}

	closed() {
		let promises = []
		for (let id in this.devices) {
			promises.push(this.closeDevice(this.devices[id]))
		}
		this.devices = {}
		//await Promise.all(promises)...
	}

	async addDevice(device: DI): Promise<void> {
		if (this.devices[device.id]) return //already added
		this.devices[device.id] = device
		await this.openDevice(this.devices[device.id])

		this._deferDeviceRender()
	}

	async removeDevice(device: DI): Promise<void> {
		let id = device.id
		if (!this.devices[id]) return //already removed
		let deviceInfo = this.devices[id]
		await this.closeDevice(deviceInfo)
		if (deviceInfo.el) deviceInfo.el.remove()
		delete this.devices[id]

		this._deferDeviceRender()
	}

}

