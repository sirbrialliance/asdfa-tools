import {DeviceModule, DeviceInfo} from './Module'
import * as util from '../lib/util'
import VUMeter from '../lib/VUMeter'

class UserMediaDeviceInfo implements DeviceInfo {
	id: string
	el: HTMLElement

	device: MediaDeviceInfo
	stream: MediaStream
	error: string

	videoEl: HTMLVideoElement
	vuMeter: VUMeter

	constructor(device: MediaDeviceInfo) {
		this.device = device
		this.id = device.deviceId
	}
}

export default class UserMedia extends DeviceModule<UserMediaDeviceInfo> {
	videoEl: HTMLVideoElement
	stream: MediaStream
	audio: AudioContext

	getId() { return "UserMedia" }

	renderThumb(): HTMLElement {
		return <span>Test your camera, microphone, and speakers.</span>
	}
	getName(): string { return "Camera/Mic/Speaker Test" }

	isSupported() {
		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			return true
		} else {
			return "User Media API=stream"
		}
	}

	async getDevices() {
		let devices = await navigator.mediaDevices.enumerateDevices()
		console.log("Media devices:", devices)
		return devices.map(v => new UserMediaDeviceInfo(v))
	}

	async openDevice(deviceInfo: UserMediaDeviceInfo) {
		try {
			switch (deviceInfo.device.kind) {
				case "audioinput":
					deviceInfo.stream = await navigator.mediaDevices.getUserMedia({
						audio: {deviceId: deviceInfo.device.deviceId},
					})
					deviceInfo.vuMeter = new VUMeter(this.audio, deviceInfo.stream)
					break
				case 'videoinput':
					deviceInfo.stream = await navigator.mediaDevices.getUserMedia({
						video: {deviceId: deviceInfo.device.deviceId},
					})
					let videoEl = <video></video> as HTMLVideoElement
					videoEl.playsInline = true
					videoEl.autoplay = true
					videoEl.controls = true
					videoEl.srcObject = deviceInfo.stream
					deviceInfo.videoEl = videoEl
					break
				case 'audiooutput':
					//todo
					break
			}
		} catch (ex) {
			console.error(ex)
			deviceInfo.error = ex.message || ex
		}
	}

	async closeDevice(deviceInfo: UserMediaDeviceInfo) {
		deviceInfo.stream?.getTracks().forEach(t => t.stop())
		deviceInfo.stream = null
		deviceInfo.vuMeter?.close()
	}

	renderDevice(deviceInfo: UserMediaDeviceInfo) {
		let videoEl: HTMLVideoElement

		return <div class="device">
			<h3>{deviceInfo.device.label}</h3>
			{deviceInfo.videoEl}
			{deviceInfo.vuMeter?.el}

		</div>

	}

	opened() {
		super.opened()
		this.audio = new AudioContext()
		// if (this.audio.state === 'suspended') {
		// 	//generally, no user gesture yet. Autostart when we can
		// 	this.audio.resume().then(() => console.log('resume'), ex => console.error("no resume", ex))
		// }
	}

	closed() {
		this.audio.close()
		super.closed()
	}

}

