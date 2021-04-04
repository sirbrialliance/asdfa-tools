# ASDFA: A Set of Decently Functional Assessments

A set of browser-based and browser tests written for running on asdfa.net, such as browser information, camera/mic/speaker tests, MIDI input testing, and so on.


# Development/Build

## Setup

	npm install
	npm install -g grunt-cli typescript serverless

## Writing code:

	grunt watch & tsc -w & serverless offline

## Deploy

	grunt build
	serverless deploy



