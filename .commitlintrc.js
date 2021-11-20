const fs = require('fs');
const path = require('path');

const types = [
	{ value: 'feat', name: 'feat:     A new feature' },
	{ value: 'fix', name: 'fix:      A bug fix' },
	{
		value: 'perf',
		name: 'perf:     A code change that improves performance',
	},
	{
		value: 'refactor',
		name: 'refactor: A code change that neither fixes a bug nor adds a feature',
	},
	{
		value: 'style',
		name: 'style:    Changes that do not affect the meaning of the code\n            (white-space, formatting, missing semi-colons, etc)',
	},
	{ value: 'test', name: 'test:     Adding missing tests' },
	{ value: 'revert', name: 'revert:   Revert to a commit' },
	{
		value: 'chore',
		name: 'chore:    Changes to the build process or auxiliary tools\n            and libraries such as documentation generation',
	},
	{ value: 'docs', name: 'docs:     Documentation only changes' },
	{
		value: 'build',
		name: 'build:     主要目的是修改项目构建系统(例如 glup，webpack，rollup 的配置等)的提交',
	},
	{
		value: 'ci',
		name: 'ci:     主要目的是修改项目继续集成流程(例如 Travis，Jenkins，GitLab CI，Circle等)的提交',
	},
];
const scopes = [
	...fs.readdirSync(path.join(__dirname, './packages')).map(name => ({ name: `package-${name}` })),
	{ name: 'global' },
];

module.exports = {
	// const
	types,
	scopes,
	// rule
	extends: ['@commitlint/config-conventional'],

	// limit subject length
	subjectLimit: 100,
	/**
	 * <type>(<scope>): <subject>
	 * 数组中第一位为level，可选0,1,2，0为disable，1为warning，2为error
	 * 第二位为应用与否，可选always|never
	 * 第三位该rule的值
	 */
	rules: {
		'type-enum': [2, 'always', types.map(type => type.value)],
		'scope-enum': [2, 'always', scopes.map(type => type.name)],
		'type-case': [0],
		'type-empty': [0],
		'scope-empty': [0],
		'scope-case': [0],
		'subject-full-stop': [0, 'never'],
		'subject-case': [0, 'never'],
		'header-max-length': [0, 'always', 72],
	},
};
