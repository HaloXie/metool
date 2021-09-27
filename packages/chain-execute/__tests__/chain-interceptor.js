'use strict';
const ChainWrapper = require('../dist/index').default;

const fnA = () => {
	try {
		const a = {};
		return { status: true, data: a.b.data };
	} catch (error) {
		return { status: false, error };
	}
};
const fnB = (...data) => {
	if (data && data.length) {
		const callback = data[data.length - 1];
		if (typeof callback === 'function') {
			callback(null, data[0] === 1 ? { status: true, data: 1 } : { status: false, data: 2 });
		}
	}
};
const fnC = data =>
	new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(data === 1 ? { status: true, data: 1 } : { status: false, data: 2 });
		}, 200);
	});

describe('chain-interceptor', () => {
	it('global-interceptor', async () => {
		const result = await new ChainWrapper({
			interceptor: (previousResult, currentIndex) => {
				if (currentIndex > 0) {
					return previousResult.success && previousResult.data.status;
				}
				return true;
			},
		})
			.next({
				fn: fnA,
				args: [],
			})
			.callbackNext({
				fn: fnB,
				args: [1],
			})
			.execute();
		expect(result.success).toBe(false);
		expect(!!result.error).toBe(true);
	});
	it('functional-interceptor', async () => {
		const result = await new ChainWrapper()
			.next({
				fn: fnA,
				args: [],
				interceptor: (previousResult, currentResult, currentIndex, resultArray) => {
					return currentResult.success && currentResult.data.status;
				},
			})
			.callbackNext({
				fn: fnB,
				args: [1],
			})
			.execute();
		expect(result.success).toBe(false);
		expect(!!result.error).toBe(true);
	});
	it('functional-interceptor-changeResult', async () => {
		const result = await new ChainWrapper({
			interceptor: (previousResult, currentIndex) => {
				if (currentIndex > 0) {
					console.log(previousResult);
					return previousResult.success && previousResult.data.status;
				}
				return true;
			},
		})
			.next({
				fn: fnA,
				args: [],
				interceptor: (previousResult, currentResult, currentIndex, resultArray) => {
					currentResult.data.status = true;
					return true;
				},
			})
			.callbackNext({
				fn: fnB,
				args: [1],
			})
			.execute();
		console.log(result);
		expect(result.success).toBe(true);
		expect(result.data.data).toBe(1);
	});
});
