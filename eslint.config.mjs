import ljharbConfig from '@ljharb/eslint-config/flat';

export default [
	...ljharbConfig,
	{
		rules: {
			complexity: ['warn', 10],
			eqeqeq: ['error', 'allow-null'],
			'func-names': 'off',
			'id-length': ['error', { max: 23, min: 1 }],
			'max-depth': ['error', 5],
			'max-len': 'off',
			'max-lines-per-function': ['error', { max: 300 }],
			'max-params': 'off',
			'max-statements': ['warn', 10],
			'max-statements-per-line': ['error', { max: 2 }],
			'new-cap': ['error', { capIsNewExceptions: ['BigInt'] }],
			'no-extra-parens': ['warn'],
			'no-implicit-coercion': [
				'error', {
					boolean: false,
					number: false,
					string: true,
				},
			],
			'no-restricted-syntax': [
				'error', 'BreakStatement', 'ContinueStatement', 'DebuggerStatement', 'LabeledStatement', 'WithStatement',
			],
		},
	},
	{
		files: ['test/**'],
		rules: {
			'func-name-matching': 'off',
			'no-throw-literal': 'off',
			'prefer-regex-literals': 'off',
		},
	},
];
