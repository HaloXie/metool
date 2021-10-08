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
const fnD = data => {
	console.log(data);
};

describe('chain-next', () => {
	it('empty', async () => {
		const result = await new ChainWrapper().execute();

		// console.log(result);
		expect(result).toEqual({ success: true, data: undefined });
	});
	it('next', async () => {
		const result = await new ChainWrapper()
			.next({
				fn: fnA,
				args: [],
			})
			.execute();

		// console.log(result);
		expect(result).toEqual({ success: true, data: '1normal' });
	});
	it('next void-func', async () => {
		const result = await new ChainWrapper()
			.next({
				fn: fnD,
				args: [1],
			})
			.execute();

		// console.log(result);
		expect(result).toEqual({ success: true, data: undefined });
	});
	it('callbackNext normal single-param', async () => {
		const result = await new ChainWrapper()
			.callbackNext({
				fn: fnB,
				args: [0],
				handler: {
					successHandler: data => ({ success: true, data, data1: data }),
				},
			})
			.execute();

		// console.log(result);
		expect(result).toEqual({ success: true, data: [0], data1: [0] });
	});
	it('callbackNext normal multi-params ', async () => {
		const result = await new ChainWrapper()
			.callbackNext({
				fn: fnB,
				args: [0, 2, 3],
			})
			.execute();

		// console.log(result);
		expect(result).toEqual({ success: true, data: [0, 2, 3] });
	});
	it('callbackNext error', async () => {
		const result = await new ChainWrapper()
			.callbackNext({
				fn: fnB,
				args: [1],
			})
			.execute();

		// console.log(result);
		expect(result.success).toEqual(false);
		expect(!!result.error).toEqual(true);
		expect(result.error.message).toEqual('fb1');
	});
	it('asyncNext', async () => {
		const result = await new ChainWrapper()
			.asyncNext({
				fn: fnC,
				args: [],
			})
			.execute();

		// console.log(result);
		expect(result).toEqual({ success: true, data: 3 });
	});
	it('All', async () => {
		const result = await new ChainWrapper()
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
			.execute();

		// console.log(result);
		expect(result.success).toEqual(false);
		expect(!!result.error).toEqual(true);
		expect(result.error.message).toEqual('fb1');
	});
});
