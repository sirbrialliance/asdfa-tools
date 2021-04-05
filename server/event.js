'use strict';

var process = require('process');

/*

Cloud/local events are way different.

docs https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html
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
		'x-forwarded-for': '69.167.51.162',
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

serverless-offline object: {
  body: null,
  headers: {
    Host: 'localhost:3000',
    Connection: 'keep-alive',
    Pragma: 'no-cache',
    'Cache-Control': 'no-cache',
    DNT: '1',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
    Accept: '...',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-User': '?1',
    'Sec-Fetch-Dest': 'document',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9'
  },
  httpMethod: 'GET',
  isBase64Encoded: false,
  multiValueHeaders: {
    Host: [ 'localhost:3000' ],
    Connection: [ 'keep-alive' ],
    Pragma: [ 'no-cache' ],
    'Cache-Control': [ 'no-cache' ],
    DNT: [ '1' ],
    'Upgrade-Insecure-Requests': [ '1' ],
    'User-Agent': [
      'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
    ],
    Accept: [
      '...'
    ],
    'Sec-Fetch-Site': [ 'none' ],
    'Sec-Fetch-Mode': [ 'navigate' ],
    'Sec-Fetch-User': [ '?1' ],
    'Sec-Fetch-Dest': [ 'document' ],
    'Accept-Encoding': [ 'gzip, deflate, br' ],
    'Accept-Language': [ 'en-US,en;q=0.9' ]
  },
  multiValueQueryStringParameters: { bin: [ 'bo' ], ja: [ 'ha@aa' ] },
  path: '/foo/baz',
  pathParameters: { any1: 'foo', any2: 'baz' },
  queryStringParameters: { bin: 'bo', ja: 'ha@aa' },
  requestContext: {
    accountId: 'offlineContext_accountId',
    apiId: 'offlineContext_apiId',
    authorizer: {
      claims: undefined,
      scopes: undefined,
      principalId: 'offlineContext_authorizer_principalId'
    },
    domainName: 'offlineContext_domainName',
    domainPrefix: 'offlineContext_domainPrefix',
    extendedRequestId: 'ckn4uy858003fwodi8mi301ry',
    httpMethod: 'GET',
    identity: {
      accessKey: null,
      accountId: 'offlineContext_accountId',
      apiKey: 'offlineContext_apiKey',
      apiKeyId: 'offlineContext_apiKeyId',
      caller: 'offlineContext_caller',
      cognitoAuthenticationProvider: 'offlineContext_cognitoAuthenticationProvider',
      cognitoAuthenticationType: 'offlineContext_cognitoAuthenticationType',
      cognitoIdentityId: 'offlineContext_cognitoIdentityId',
      cognitoIdentityPoolId: 'offlineContext_cognitoIdentityPoolId',
      principalOrgId: null,
      sourceIp: '127.0.0.1',
      user: 'offlineContext_user',
      userAgent: 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
      userArn: 'offlineContext_userArn'
    },
    path: '/foo/baz',
    protocol: 'HTTP/1.1',
    requestId: 'ckn4uy858003gwodi08df87ne',
    requestTime: '05/Apr/2021:11:18:45 -0600',
    requestTimeEpoch: 1617643125690,
    resourceId: 'offlineContext_resourceId',
    resourcePath: '/{any1}/{any2}',
    stage: 'dev'
  },
  resource: '/{any1}/{any2}',
  stageVariables: undefined
}

// */

function fixupEvent(ev) {
	if (!process.env.IS_OFFLINE) return ev;

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
}

module.exports = {
	fixupEvent: fixupEvent,
};