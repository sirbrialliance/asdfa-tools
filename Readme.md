# ASDFA: A Set of Decently Functional Assessments

A set of browser-based and browser tests, such as browser information, camera/microphone/speaker tests, MIDI input testing, and so on.

Written for running on [asdfa.net](https://asdfa.net/).

## Project Goals

> What can we find out, test, or verify, from an ordinary webpage?

Ever want see if your touchscreen is working right, if your camera/microphone work, or if your MIDI device is working right? All these tasks and more can be done from within a modern browser. [asdfa-tools](https://github.com/sirbrialliance/asdfa-tools/) targets having a bunch of these such utilities that are quick and easy to use.

It'd be best if we had:

- All useful basic tests we can run from a web browser.
- No ads.
- Fast to load.
- No nonsense or privacy invasions.
- Cheap to host. Targeting under $1/month. <small>(Then I'm not tempted to add ads, which incidentally aren't no-nonsense, don't respect privacy, and are the bane of web performance.)</small>

## Infrastructure

To keep costs down and speeds up here's how things are currently set up to work:

- Page
	- Most of the site is static HTML and JavaScript.
	- We use history.pushSate to make individual tests (modules) have their own URI.
	- Using the correct prefech headers, we have CloudFlare do HTTP/2 (or 3) server-push for core resources.
- Servers
	- Use free CloudFlare account for CDN.
	- Origin resources are served off a cheap ~$1/month VPS (currently using RackNerd from [this list](https://lowendbox.com/blog/1-vps-1-usd-vps-per-month/)).

# Development/Build

## Setup

	git clone https://github.com/sirbrialliance/asdfa-tools
	cd asdfa-tools
	npm install
	npm install -g grunt-cli typescript nodemon

## Writing code:

	grunt watch
	# open https://localhost:3000/

Starts up tasks to redo certain build steps, watch for TypeScript changes, and starts a local server to serve content.

## Deploy

	grunt clean default
	# the default grunt tasks minifies JS too, so double-check if anything broke in the build

### Development Server

Then copy the build folder to a server and rig things up to run `ASDFA_TOOLS_ENV="dev" node serverMain.js`. If you followed [`serverSetup.txt`](https://github.com/sirbrialliance/asdfa-tools/blob/master/server/serverSetup.txt) for your server you might do something like:

	rsync -ravz build/ webserver.example.com:/home/www-node/asdfa-tools-dev/ --exclude=tmp --exclude=node_modules --chown=:www-node
	ssh webserver.example.com -t "cd /home/www-node/asdfa-tools-dev/ && sudo -u www-node npm install"
	ssh webserver.example.com -t sudo supervisorctl restart asdfa-tools-dev

This should make the site available for testing on https://webserver.example.com:8443/

### Production

Save as dev, but `s/asdfa-tools-dev/asdfa-tools/` and `ASDFA_TOOLS_ENV="prod"` for https://webserver.example.com/

# Contact

To contact the site owner, reach out to [GitHub username for code repo, with exact misspelling]@gmail.com.
