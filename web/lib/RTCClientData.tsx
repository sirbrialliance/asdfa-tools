import Terminal from "./Terminal"
import * as RJS from "random-js"


export interface RTCClientInfo {
	id: string
	name: string
	publicKey?: CryptoKey
	privateKey?: CryptoKey
	myId?: string
}

function dbTask(task: IDBRequest) {
	return new Promise((res, rej) => {
		task.onerror = ev => {
			console.error(ev)
			rej(new Error("DB op failed"))
		}
		task.onsuccess = ev => {
			res(task.result)
		}
	})
}


/**
 * Handles things like clients we may want to connect to and keys for
 * us and clients.
 */
class RTCClientData {
	private openTask: Promise<void>
	private db: IDBDatabase

	/** Active logging terminal if any. Set and clear as appropriate. */
	public log: Terminal

	/** Sets things up if we haven't already. */
	public open() : Promise<void> {
		if (!this.openTask) this.openTask = this._open()
		return this.openTask
	}

	private _open() {
		return new Promise<void>((resolve, reject) => {
			var openRequest = indexedDB.open("RTCClientData", 1)

			openRequest.onerror = ev => reject(ev)

			openRequest.onupgradeneeded = ev => {
				let db = openRequest.result
				db.createObjectStore('clients', {keyPath: "id"})
			}

			openRequest.onsuccess = ev => {
				this.db = openRequest.result
				resolve()
			}
		})
	}

	public async getMyData() {
		await this.open()

		var clientTable = this.db.transaction("clients", "readonly").objectStore("clients")

		var data = await dbTask(clientTable.get("_"))

		// console.log("current my data:", data)
		if (!data) data = await this.generateMyData()

		return data as RTCClientInfo
	}

	private async generateMyData() : Promise<RTCClientInfo> {
		var clientId = RJS.string()(RJS.browserCrypto, 8)

		var keys = await window.crypto.subtle.generateKey(
			{
				name: "RSA-OAEP",
				modulusLength: 2048,
				publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
				hash: "SHA-512",
			},
			false,
			["encrypt", "decrypt"]
		) as CryptoKeyPair


		var myData: RTCClientInfo = {
			id: "_",
			name: "This Browser",
			myId: clientId,
			publicKey: keys.publicKey,
			privateKey: keys.privateKey,
		}

		console.log("Generated new client data", myData)

		var clientTable = this.db.transaction("clients", "readwrite").objectStore("clients")
		await dbTask(clientTable.add(myData))

		return myData
	}
}


export var data = new RTCClientData()
export default data
