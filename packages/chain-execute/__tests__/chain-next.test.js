'use strict';
const ChainWrapper = require('../dist/index').default;

const a = 1;
const fnA = () => {
	console.log(a);
	return a + 'normal';
};
const fnB = (...data) => {
	if (data && data.length) {
		const callback = data[data.length - 1];
		if (typeof callback === 'function') {
			callback(data[0] === 1 ? new Error('fb1') : null, data.slice(0, data.length - 1));
		}
	}
};
const fnC = () =>
	new Promise((resolve, reject) => {
		setTimeout(() => {
			console.log(3);
			resolve(3);
		}, 200);
	});

describe('chain-next', () => {
	it('empty', () => {
		new ChainWrapper()
			.execute()
			.then(result => console.log(result))
			.catch(error => console.log(error));
	});
	it('fnA', () => {
		new ChainWrapper()
			.next({
				fn: fnA,
				args: [],
			})
			.execute()
			.then(result => console.log(result))
			.catch(error => console.log(error));
	});
	it('fnB 1', () => {
		new ChainWrapper()
			.callbackNext({
				fn: fnB,
				args: [0],
				handler: {
					successHandler: data => ({ success: true, data, data1: data }),
				},
			})
			.execute()
			.then(result => console.log(result))
			.catch(error => console.log(error));
	});
	it('fnB 2', () => {
		new ChainWrapper()
			.callbackNext({
				fn: fnB,
				args: [1],
			})
			.execute()
			.then(result => console.log(result))
			.catch(error => console.log(error));
	});
	it('fnC', async () => {
		await new ChainWrapper()
			.asyncNext({
				fn: fnC,
				args: [],
			})
			.execute()
			.then(result => console.log(result))
			.catch(error => console.log(error));
	});
	it('All', async () => {
		await new ChainWrapper()
			.next({
				fn: fnA,
				args: [],
			})
			.asyncNext({
				fn: fnC,
				args: [],
			})
			.callbackNext({
				fn: fnB,
				args: [10],
				handler: {
					successHandler: data => ({ success: true, data, data1: data }),
				},
			})
			.callbackNext({
				fn: fnB,
				args: [1],
				handler: {
					errorHandler: error => ({ success: false, error, data: 1 }),
				},
			})
			.callbackNext({
				fn: fnB,
				args: [2],
				handler: {
					successHandler: data => ({ success: true, data, data1: data }),
				},
			})
			.execute()
			.then(result => console.log(result))
			.catch(error => console.log(error));
	});
});
