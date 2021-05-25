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
		"prefer-const": "off",
		"no-var": "off",
		// "no-unused-vars": ["warn", "all"],
		"no-unused-vars": "off",
		"@typescript-eslint/no-unused-vars": "off",
		"no-case-declarations": "off",
		"@typescript-eslint/explicit-module-boundary-types": "off",//we're okay with using t he implied type of the parent class
		"@typescript-eslint/no-explicit-any": "off",
		"indent": [
			"warn",
			"tab",
			{"SwitchCase": 1}
		],
		"semi": [
			"error",
			"never"
		],
		"@typescript-eslint/no-empty-function": "off",
	}
}
