import * as process from 'process'

interface Config {
	certFile: string
	keyFile: string
	port: number
	validHosts: string[]
}

var conf: Config

switch (process.env['ASDFA_TOOLS_ENV']) {
	case "prod":
		conf = {
			certFile: "/home/www-node/certs/cert.pem",
			keyFile: "/home/www-node/certs/cert.key",
			port: 443,
			validHosts: ["asdfa.net"],
		}
		break
	case "dev":
		conf = {
			certFile: "/home/www-node/certs/cert.pem",
			keyFile: "/home/www-node/certs/cert.key",
			port: 8443,
			validHosts: ["asdfa-tools-dev.asdfa.net:8443", "asdfa.net:8443"],
		}
		break
	default://local dev
		conf = {
			certFile: "../server/localhost-cert.pem",
			keyFile: "../server/localhost-privkey.pem",
			port: 443,
			validHosts: ["localhost", "192.168.1.10"],
		}
		break
}

export default conf


