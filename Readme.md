# ASDFA: A Set of Decently Functional Assessments

A set of browser-based and browser tests written for running on asdfa.net, such as browser information, camera/mic/speaker tests, MIDI input testing, and so on.

## Project Goals

Ever want see if your touchscreen is working right, if your camera/microphone work, or if your MIDI device is working right? All these tasks and more can be done from within a modern browser. asdfa-tools targets having a bunch of these such utilities that are quick and easy to use.

- No ads.
- Fast to load.
- No nonsense or privacy invasions.
- Cheap to host. Targeting under $1/month using serverless, free CDNs, etc.


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
