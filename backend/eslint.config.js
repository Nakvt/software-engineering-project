const nodeGlobals = Object.fromEntries(
	[
		'Buffer',
		'__dirname',
		'__filename',
		'clearImmediate',
		'clearInterval',
		'clearTimeout',
		'console',
		'exports',
		'fetch',
		'global',
		'module',
		'process',
		'require',
		'setImmediate',
		'setInterval',
		'setTimeout',
	].map((name) => [name, 'readonly']),
);

module.exports = [
	{
		ignores: ['node_modules/**', 'coverage/**', 'dist/**'],
	},
	{
		files: ['**/*.js'],
		languageOptions: {
			ecmaVersion: 'latest',
			globals: nodeGlobals,
			sourceType: 'commonjs',
		},
		rules: {
			'no-constant-condition': 'error',
			'no-dupe-keys': 'error',
			'no-undef': 'error',
			'no-unreachable': 'error',
			'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
		},
	},
];