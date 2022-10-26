module.exports = {
	env: {
		browser: true,
		node: true,
		es2021: true,
		jest: true,
		commonjs: true,
		'vue/setup-compiler-macros': true
	},
	extends: [
		'plugin:vue/recommended',
		'eslint:recommended',
		'plugin:prettier/recommended'
	],
	parser: 'vue-eslint-parser',
	parserOptions: {
		ecmaVersions: 'latest',
		sourceType: 'module',
		ecmaFeatures: {
			experimentalObjectRestSpread: true
		}
	},
	plugins: ['vue', 'prettier'],
	rules: {
		'prettier/prettier': 'error'
	}
}
