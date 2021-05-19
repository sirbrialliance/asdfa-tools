
var env = require('process').env;

const ntpServers = [
	"time.google.com",
	"time1.google.com",
	"time2.google.com",
	"time3.google.com",
	"time4.google.com",
	"time.cloudflare.com",
	"pool.ntp.org",
	"0.pool.ntp.org",
	"1.pool.ntp.org",
	"2.pool.ntp.org",
	"3.pool.ntp.org",
];

if (env['IS_OFFLINE'] === "true") {
	module.exports = {
		ntpServers: ["192.168.1.2"],

	};
} else {
	module.exports = {
		ntpServers: ntpServers,
	};
}

