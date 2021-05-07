module.exports = {
	"env": {
		"browser": true,
		"es2021": true
	},
	"extends": [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended"
	],
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"ecmaVersion": 12,
		"sourceType": "module"
	},
	"plugins": [
		"@typescript-eslint"
	],
	"rules": {
		"no-var": "off",
		"no-unused-vars": ["warn", "all"],
		"@typescript-eslint/explicit-module-boundary-types": "off",//we're okay with using t he implied type of the parent class
		"indent": [
			"error",
			"tab"
		],
		"semi": [
			"error",
			"never"
		]
	}
}
