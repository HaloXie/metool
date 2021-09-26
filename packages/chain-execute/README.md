最终目标是链式的执行方法

## chain-next 模块

> 目前包含三个方法
>
> 1. next：一般的同步方法
> 2. callbackNext：callback 方法
> 3. asyncNext：异步方法

### demo

```JavaScript
'use strict';
const ChainWrapper = require('chain-execute').default;

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

		// console
		// { success: false }
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

      // console
      /*
        1
        3
        { success: false, error: Error: fb1 ..., data: 1 }
      */
	});
});
```
