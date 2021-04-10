# ASDFA: A Set of Decently Functional Assessments

A set of browser-based and browser tests written for running on asdfa.net, such as browser information, camera/mic/speaker tests, MIDI input testing, and so on.

## Project Goals

Ever want see if your touchscreen is working right, if your camera/microphone work, or if your MIDI device is working right? All these tasks and more can be done from within a modern browser. asdfa-tools targets having a bunch of these such utilities that are quick and easy to use.

- All useful basic tests we can run from a web browser.
- No ads.
- Fast to load.
- No nonsense or privacy invasions.
- Cheap to host. Targeting under $1/month.

## Infrastructure

To keep costs down and speeds up here's how things are currently set up to work:

- Page
	- Most of the site is static HTML and JavaSciprt.
	- We use history.pushSate to make individual tests (modules) have their own URI.
	- Using the correct prefech headers, we have CloudFlare do HTTP/2 (or 3) server-push for core resources.
- Servers
	- Use free ClourFlare account for CDN.
	- Origin resources are served out of AWS Lambda+API Gateway.
		- All the resources/files are bundled with the function itself.
		- Much of the site could be served from an S3 bucket, but:
			- S3 websites don't support HTTPS, only HTTP. (Could proxy through CloudFront for SSL, but that's another cost.
			- Different modules have different URLs, it's nice not to have to make many copies of index.html in a bunch of folders.
		- CloudFlare workers were also considered, but it's plausibly likely we'd go over the free invocation limit. (Though they did later add transform rules.)

# Development/Build

## Setup

	npm install
	npm install -g grunt-cli typescript serverless

## Writing code:

	grunt watch
	# open http://localhost:3000/

Starts up tasks to redo certain build steps, watch for TypeScript changes, and starts a local server to serve content.

## Deploy

	grunt
	serverless deploy
	# test
	serverless deploy --stage prod

Quick update a function:

	serverless deploy function --function webResource

And maybe find out why it broke:

	serverless logs --function webResource # add -t for log tailing
