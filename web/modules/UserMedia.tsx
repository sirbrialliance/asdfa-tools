import Module from './Module';
import * as util from '../lib/util';

export default class UserMedia extends Module {
	getId() { return "UserMedia" }
	videoEl: HTMLVideoElement;
	stream: MediaStream;

	renderThumb(): HTMLElement {
		return <span>Test your camera, microphone, and speakers.</span>
	}

	isSupported() {
		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			return true;
		} else {
			return "User Media API=stream";
		}
	}

	getName(): string {
		return "User Media";
	}

	render() {
		return [
			<div>
				{this.videoEl = <video/> as HTMLVideoElement}
			</div>
		];
	}

	opened() {
		navigator.mediaDevices.enumerateDevices().then(async devices => {
			let video: MediaDeviceInfo = null;
			let audio: MediaDeviceInfo = null;

			for (let device of devices) {
				if (!audio && device.kind == "audioinput") audio = device;
				if (!video && device.kind == "videoinput") video = device;
			}

			this.stream = await navigator.mediaDevices.getUserMedia({
				audio: audio ? {deviceId: audio.deviceId} : undefined,
				video: video ? {deviceId: video.deviceId} : undefined,
			});

			this.videoEl.playsInline = true;
			this.videoEl.autoplay = true;
			this.videoEl.controls = true;
			this.videoEl.srcObject = this.stream;

			devices = await navigator.mediaDevices.enumerateDevices();

			console.log("devices", devices);
		}, function(err) {
			console.error(err);
		});
	}

	closed() {
		if (this.stream) {
			this.stream.getTracks().forEach(t => t.stop());
			this.stream = null;
		}
	}
}

