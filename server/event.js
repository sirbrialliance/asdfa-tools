'use strict';

var process = require('process');

/*

Cloud/local events are maybe different.

docs https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html

-------------------------------------------------------------------------
HTTP
-------------------------------------------------------------------------

Actual/cloud request object (+mixin from docs): {
	version: '2.0',
	routeKey: '$default',
	rawPath: '/foo/bar/baz',
	rawQueryString: 'bin=bo&ja=ha@aa',
	queryStringParameters: { bin: 'bo', ja: 'ha@aa' },
	"cookies": [//may not be set
		"cookie1",
		"cookie2"
	],
	headers: {
		accept: '...',
		'accept-encoding': 'gzip, deflate, br',
		'accept-language': 'en-US,en;q=0.5',
		'content-length': '0',
		dnt: '1',
		host: 'l0i5box7k6.execute-api.us-west-2.amazonaws.com',
		'upgrade-insecure-requests': '1',
		'user-agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0',
		'x-amzn-trace-id': 'Root=1-606b4257-163b306224cf430920a2e8f9',
		'x-forwarded-for': '203.0.113.12',
		'x-forwarded-port': '443',
		'x-forwarded-proto': 'https'
	},
	requestContext: {
		http: {
			method: 'GET',
			path: '/foo/bar/baz',
			protocol: 'HTTP/1.1',
			sourceIp: '...',
			userAgent: 'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0'
		},
		accountId: '478335881052',
		apiId: 'l0i5box7k6',
		"authentication": ...,
		"authorizer": ...,
		domainName: 'l0i5box7k6.execute-api.us-west-2.amazonaws.com',
		domainPrefix: 'l0i5box7k6',
		requestId: 'dUdNnhbhvHcEJbQ=',
		routeKey: '$default',
		stage: '$default',
		time: '05/Apr/2021:17:01:11 +0000',
		timeEpoch: 1617642071039
	},
	"body": "Hello from Lambda",//may not be set
	"pathParameters": {//may not be set
		"parameter1": "value1"
	},
	"stageVariables": {//may not be set
		"stageVariable1": "value1",
		"stageVariable2": "value2"
	}
	isBase64Encoded: false
}

serverless-offline object:
	version: '2.0',
	routeKey: 'GET /{any}',
	rawPath: '/favicon.ico',
	rawQueryString: '',
	cookies: [],
	headers: {
		Host: 'localhost:3000',
		Connection: 'keep-alive',
		Pragma: 'no-cache',
		'Cache-Control': 'no-cache',
		'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
		DNT: '1',
		Accept: '...',
		'Sec-Fetch-Site': 'same-origin',
		'Sec-Fetch-Mode': 'no-cors',
		'Sec-Fetch-Dest': 'image',
		Referer: 'http://localhost:3000/',
		'Accept-Encoding': 'gzip, deflate, br',
		'Accept-Language': 'en-US,en;q=0.9'
	},
	queryStringParameters: null,
	requestContext: {
		accountId: 'offlineContext_accountId',
		apiId: 'offlineContext_apiId',
		authorizer: { jwt: [Object] },
		domainName: 'offlineContext_domainName',
		domainPrefix: 'offlineContext_domainPrefix',
		http: {
			method: 'GET',
			path: '/favicon.ico',
			protocol: 'HTTP/1.1',
			sourceIp: '127.0.0.1',
			userAgent: 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
		},
		requestId: 'offlineContext_resourceId',
		routeKey: 'GET /{any}',
		stage: '$default',
		time: '07/May/2021:14:22:09 -0600',
		timeEpoch: 1620418929197
	},
	body: null,
	pathParameters: { any: 'favicon.ico' },
	isBase64Encoded: false,
	stageVariables: undefined
}


-------------------------------------------------------------------------
WebSocket
-------------------------------------------------------------------------

Actual/cloud request object:
2021-05-06T02:21:30.147Z	e209beb4-fb2c-4b79-966e-04b060764b23	INFO	{
  headers: {
    Accept: '...',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.5',
    'Cache-Control': 'no-cache',
    DNT: '1',
    Host: 'h6m1dmlgc6.execute-api.us-west-2.amazonaws.com',
    Origin: 'https://asdfa-tools-dev.asdfa.net',
    Pragma: 'no-cache',
    'Sec-WebSocket-Extensions': 'permessage-deflate',
    'Sec-WebSocket-Key': 'ZLUka4f7sXdRr1j+KrUR6g==',
    'Sec-WebSocket-Version': '13',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'X-Amzn-Trace-Id': 'Root=1-609352a9-7057102821558ace1a39d054',
    'X-Forwarded-For': '203.0.113.12',
    'X-Forwarded-Port': '443',
    'X-Forwarded-Proto': 'https'
  },
  multiValueHeaders: {
    Accept: [ '...' ],
    'Accept-Encoding': [ 'gzip, deflate, br' ],
    'Accept-Language': [ 'en-US,en;q=0.5' ],
    'Cache-Control': [ 'no-cache' ],
    DNT: [ '1' ],
    Host: [ 'h6m1dmlgc6.execute-api.us-west-2.amazonaws.com' ],
    Origin: [ 'https://asdfa-tools-dev.asdfa.net' ],
    Pragma: [ 'no-cache' ],
    'Sec-WebSocket-Extensions': [ 'permessage-deflate' ],
    'Sec-WebSocket-Key': [ 'ZLUka4f7sXdRr1j+KrUR6g==' ],
    'Sec-WebSocket-Version': [ '13' ],
    'User-Agent': [
      'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
    ],
    'X-Amzn-Trace-Id': [ 'Root=1-609352a9-7057102821558ace1a39d054' ],
    'X-Forwarded-For': [ '203.0.113.12' ],
    'X-Forwarded-Port': [ '443' ],
    'X-Forwarded-Proto': [ 'https' ]
  },
  requestContext: {
    routeKey: '$connect',
    eventType: 'CONNECT',
    extendedRequestId: 'e4naiF6DvHcFUhA=',
    requestTime: '06/May/2021:02:21:29 +0000',
    messageDirection: 'IN',
    stage: 'dev',
    connectedAt: 1620267689781,
    requestTimeEpoch: 1620267689781,
    identity: {
      userAgent: 'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      sourceIp: '203.0.113.12'
    },
    requestId: 'e4naiF6DvHcFUhA=',
    domainName: 'h6m1dmlgc6.execute-api.us-west-2.amazonaws.com',
    connectionId: 'e4naievbPHcCE_Q=',
    apiId: 'h6m1dmlgc6'
  },
  isBase64Encoded: false
} {
  callbackWaitsForEmptyEventLoop: [Getter/Setter],
  succeed: [Function],
  fail: [Function],
  done: [Function],
  functionVersion: '$LATEST',
  functionName: 'asdfa-tools-dev-wsConnect',
  memoryLimitInMB: '128',
  logGroupName: '/aws/lambda/asdfa-tools-dev-wsConnect',
  logStreamName: '2021/05/06/[$LATEST]1bd406ee33fc406c8554618e5949a26d',
  clientContext: undefined,
  identity: undefined,
  invokedFunctionArn: 'arn:aws:lambda:us-west-2:478335881052:function:asdfa-tools-dev-wsConnect',
  awsRequestId: 'e209beb4-fb2c-4b79-966e-04b060764b23',
  getRemainingTimeInMillis: [Function: getRemainingTimeInMillis]
}

serverless-offline object:
connect:
    {
      headers: {
        Host: '127.0.0.1:3001',
        Connection: 'Upgrade',
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
        Upgrade: 'websocket',
        Origin: 'http://localhost:3000',
        'Sec-WebSocket-Version': '13',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-WebSocket-Key': 'B1pmTXq7FIAtlsdMD/f8aw==',
        'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits'
      },
      isBase64Encoded: false,
      multiValueHeaders: {
        Host: [ '127.0.0.1:3001' ],
        Connection: [ 'Upgrade' ],
        Pragma: [ 'no-cache' ],
        'Cache-Control': [ 'no-cache' ],
        'User-Agent': [
          'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
        ],
        Upgrade: [ 'websocket' ],
        Origin: [ 'http://localhost:3000' ],
        'Sec-WebSocket-Version': [ '13' ],
        'Accept-Encoding': [ 'gzip, deflate, br' ],
        'Accept-Language': [ 'en-US,en;q=0.9' ],
        'Sec-WebSocket-Key': [ 'B1pmTXq7FIAtlsdMD/f8aw==' ],
        'Sec-WebSocket-Extensions': [ 'permessage-deflate; client_max_window_bits' ]
      },
      requestContext: {
        apiId: 'private',
        connectedAt: 1620267407064,
        connectionId: 'ckoc9dom0003fssdi3lb92ubg',
        domainName: 'localhost',
        eventType: 'CONNECT',
        extendedRequestId: 'ckoc9dom0003gssdi87ygcwsn',
        identity: {
          accessKey: null,
          accountId: null,
          caller: null,
          cognitoAuthenticationProvider: null,
          cognitoAuthenticationType: null,
          cognitoIdentityId: null,
          cognitoIdentityPoolId: null,
          principalOrgId: null,
          sourceIp: '127.0.0.1',
          user: null,
          userAgent: null,
          userArn: null
        },
        messageDirection: 'IN',
        messageId: 'ckoc9dom0003hssdi2l4d2nr9',
        requestId: 'ckoc9dom0003issdi4xwj6647',
        requestTime: '05/May/2021:20:16:47 -0600',
        requestTimeEpoch: 1620267407064,
        routeKey: '$connect',
        stage: 'local'
      }
    } {
      awsRequestId: 'ckoc9dom0003jssdibl569d7j',
      callbackWaitsForEmptyEventLoop: true,
      clientContext: null,
      functionName: 'asdfa-tools-dev-wsConnect',
      functionVersion: '$LATEST',
      identity: undefined,
      invokedFunctionArn: 'offline_invokedFunctionArn_for_asdfa-tools-dev-wsConnect',
      logGroupName: 'offline_logGroupName_for_asdfa-tools-dev-wsConnect',
      logStreamName: 'offline_logStreamName_for_asdfa-tools-dev-wsConnect',
      memoryLimitInMB: '128',
      getRemainingTimeInMillis: [Function: getRemainingTimeInMillis],
      done: [Function: done],
      fail: [Function: fail],
      succeed: [Function: succeed]
    }
    offline: (?: wsConnect) RequestId: ckoc9dom0003jssdibl569d7j  Duration: 2.71 ms  Billed Duration: 3 ms

And disconnect:
    offline: (?: webResource) RequestId: ckoc9dom4003mssdi0let0e1j  Duration: 11.46 ms  Billed Duration: 12 ms
    {
      headers: { Host: 'localhost', 'x-api-key': '', 'x-restapi': '' },
      isBase64Encoded: false,
      multiValueHeaders: { Host: [ 'localhost' ], 'x-api-key': [ '' ], 'x-restapi': [ '' ] },
      requestContext: {
        apiId: 'private',
        connectedAt: 1620267407064,
        connectionId: 'ckoc9dom0003fssdi3lb92ubg',
        domainName: 'localhost',
        eventType: 'DISCONNECT',
        extendedRequestId: 'ckoc9domh003nssdiatrpbod3',
        identity: {
          accessKey: null,
          accountId: null,
          caller: null,
          cognitoAuthenticationProvider: null,
          cognitoAuthenticationType: null,
          cognitoIdentityId: null,
          cognitoIdentityPoolId: null,
          principalOrgId: null,
          sourceIp: '127.0.0.1',
          user: null,
          userAgent: null,
          userArn: null
        },
        messageDirection: 'IN',
        messageId: 'ckoc9domh003ossdi41xoahn4',
        requestId: 'ckoc9domi003pssdi6ixb07xy',
        requestTime: '05/May/2021:20:16:47 -0600',
        requestTimeEpoch: 1620267407081,
        routeKey: '$disconnect',
        stage: 'local'
      }
    } {
      awsRequestId: 'ckoc9domi003qssdi8qk84s9c',
      callbackWaitsForEmptyEventLoop: true,
      clientContext: null,
      functionName: 'asdfa-tools-dev-wsMessage',
      functionVersion: '$LATEST',
      identity: undefined,
      invokedFunctionArn: 'offline_invokedFunctionArn_for_asdfa-tools-dev-wsMessage',
      logGroupName: 'offline_logGroupName_for_asdfa-tools-dev-wsMessage',
      logStreamName: 'offline_logStreamName_for_asdfa-tools-dev-wsMessage',
      memoryLimitInMB: '128',
      getRemainingTimeInMillis: [Function: getRemainingTimeInMillis],
      done: [Function: done],
      fail: [Function: fail],
      succeed: [Function: succeed]
    }

// */

function fixupEvent(ev) {
	// serverless-offline 7.0.0 doesn't seem to have the issue
	return ev;

/*
	if (!process.env.IS_OFFLINE) return ev;

	console.log("ev is ", ev)

	var ret = {
		version: '2.0',
		routeKey: "NOTIMPLEMENTED",
		rawPath: ev.path,
		rawQueryString: "NOTIMPLEMENTED",
		queryStringParameters: ev.queryStringParameters,
		cookies: ["NOTIMPLEMENTED"],
		headers: ev.headers,
		requestContext: {
			http: {
				method: ev.httpMethod,
				path: ev.requestContext.path,
				protocol: ev.requestContext.protocol,
				sourceIp: ev.requestContext.identity.sourceIp,
				userAgent: ev.requestContext.identity.userAgent,
			},
			accountId: ev.requestContext.accountId,
			apiId: ev.requestContext.apiId,
			"authentication": "NOTIMPLEMENTED",
			"authorizer": "NOTIMPLEMENTED",
			domainName: ev.requestContext.domainName,
			domainPrefix: ev.requestContext.domainPrefix,
			requestId: ev.requestContext.requestId,
			routeKey: "NOTIMPLEMENTED",
			stage: ev.requestContext.stage,
			time: ev.requestContext.requestTime,
			timeEpoch: ev.requestContext.requestTimeEpoch,
		},
		"body": ev.body,
		"pathParameters": ev.pathParameters,
		"stageVariables": ev.stageVariables,
		isBase64Encoded: false
	};

	return ret;
*/
}

module.exports = {
	fixupEvent: fixupEvent,
};