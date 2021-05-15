'use strict';

module.exports.connect = async (event, context) => {
	console.log(event, context);
	try {
		return {statusCode: 200};
	} catch (ex) {
		console.error(ex, event);
		return {statusCode: 500};
	}
};

module.exports.message = async (event, context) => {
	console.log(event, context);
	try {
		return {statusCode: 200};
	} catch (ex) {
		console.error(ex, event);
		return {statusCode: 500};
	}
};


