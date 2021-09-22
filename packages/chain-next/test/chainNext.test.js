'use strict';
const ChainWrapper = require('../build/index').default;

const a = 1;
const fnA = () => {
	console.log(a);
	return a + 'normal';
};
const fnB = (data, callback) => {
	console.log(data);
	callback(data === 1 ? new Error('fb1') : null, data);
};
const fnC = () =>
	new Promise((resolve, reject) => {
		setTimeout(() => {
			console.log(3);
			resolve(3);
		}, 200);
	});

describe('chain-next', () => {
	it.skip('empty', () => {
		new ChainWrapper()
			.run()
			.then(result => console.log(result))
			.catch(error => console.log(error));
	});
	it('fnA', () => {
		new ChainWrapper()
			.next({
				fn: fnA,
				args: [],
			})
			.run()
			.then(result => console.log(result))
			.catch(error => console.log(error));
	});
	it.skip('fnB', () => {
		new ChainWrapper()
			.callbackNext({
				fn: fnB,
				args: [0],
			})
			.run()
			.then(result => console.log(result))
			.catch(error => console.log(error));

		new ChainWrapper()
			.callbackNext({
				fn: fnB,
				args: [1],
			})
			.run()
			.then(result => console.log(result))
			.catch(error => console.log(error));
	});
	it.skip('fnC', () => {
		new ChainWrapper()
			.asyncNext({
				fn: fnC,
				args: [],
			})
			.run()
			.then(result => console.log(result))
			.catch(error => console.log(error));
	});
	it.skip('All', () => {
		new ChainWrapper()
			.next({
				fn: fnA,
				args: [],
			})
			.asyncNext({
				fn: fnC,
			})
			.next({
				fn: fnB,
				args: [2],
			})
			.run()
			.then(result => console.log(result))
			.catch(error => console.log(error));
	});
});
