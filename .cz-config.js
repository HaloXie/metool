const { types, scopes } = require('./.commitlintrc');

module.exports = {
	types,
	// allowCustomScopes: true,
	scopes,

	messages: {
		type: "Select the type of change that you're committing:",
		scope: "\n Select the scope of change that you're committing:",
		// used if allowCustomScopes is true
		customScope: 'Denote the custom scope:',
		subject: 'Write a SHORT, IMPERATIVE tense description of the change:\n',
		body: 'Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
		breaking: 'List any BREAKING CHANGES (optional):\n',
		footer: 'List any ISSUES CLOSED by this change (optional). E.g.: #31, #34:\n',
		confirmCommit: 'Are you sure you want to proceed with the commit above?',
	},
};
