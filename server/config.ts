import * as process from 'process'

interface Config {
	certFile: string
	keyFile: string
	port: number
}

var conf: Config

switch (process.env['ASDFA_TOOLS_ENV']) {
	case "prod":
		conf = {
			certFile: "/home/www-node/certs/cert.pem",
			keyFile: "/home/www-node/certs/cert.key",
			port: 8443,
		}
		break
	case "dev":
		conf = {
			certFile: "/home/www-node/certs/cert.pem",
			keyFile: "/home/www-node/certs/cert.key",
			port: 8443,
		}
		break
	default://local dev
		conf = {
			certFile: "../server/localhost-cert.pem",
			keyFile: "../server/localhost-privkey.pem",
			port: 443,
		}
		break
}

export default conf


