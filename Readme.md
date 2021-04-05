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
	# test
	serverless deploy --stage prod

Quick update a function:

	serverless deploy function --function webResource

And maybe find out why it broke:

	serverless logs --function webResource # add -t to tail
