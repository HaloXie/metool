最终目标是链式的执行方法

## Usage

```JavaScript
'use strict';
const ChainWrapper = require('chain-execute').default;
```

## chain-next module

> 目前包含三个方法
>
> 1. next：一般的同步方法
> 2. callbackNext：callback 方法
> 3. asyncNext：异步方法

### common functions

```JavaScript
const a = 1;
const fnA = () => { console.log(a); return a + 'normal';};

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
		setTimeout(() => {console.log(3);resolve(3);}, 200);
	});

// void
const fnD = data => { console.log(data);};
const fnDCallback = (...data) => {
	if (data && data.length) {
		const callback = data[data.length - 1];
		if (typeof callback === 'function') {
			callback(null);
		}
	}
};
const fnDPromise = () =>
	new Promise((resolve, reject) => {
		setTimeout(() => {
			console.log(3);
			resolve();
		}, 200);
	});
```

### next

```JavaScript
// empty
// { success: true, data: undefined }
new ChainWrapper().execute();

// { success: true, data: '1normal' }
new ChainWrapper().next({fn: fnA,args: [],}).execute();

// void
// { success: true, data: undefined }
new ChainWrapper().next({fn: fnD,args: [1],}).execute();
```

### callbackNext

```JavaScript
// { success: true, data: [0], data1: [0] }
new ChainWrapper().callbackNext({
  fn: fnB,
  args: [0],
  handler: { successHandler: data => ({ success: true, data, data1: data }), },
}).execute();

// { success: true, data: [0, 2, 3] }
new ChainWrapper().callbackNext({fn: fnB,args: [0, 2, 3],}).execute();

// callback return error
// { success: false, error: new Error("fb1")}
new ChainWrapper().callbackNext({fn: fnB,args: [1],}).execute()

// void
// { success: true, data: undefined }
new ChainWrapper().callbackNext({fn: fnDCallback,args: [],}).execute();
```

### asyncNext

```JavaScript
// { success: true, data: 3 }
new ChainWrapper().asyncNext({fn: fnC,args: [],}).execute();

// void
// { success: true, data: undefined }
new ChainWrapper().asyncNext({fn: fnDPromise,args: [],}).execute();
```

## interceptor module

> 拦截器，分为全局拦截器和单个方法拦截器

### global interceptor

> 这个会在每个方法执行之前执行，如果是第一个方法则不会执行
> 该方法在程序验证 success 之后

```typescript
type TInterceptorGlobalFn = <T>(
	previousResult: T,
	currentIndex: number,
	resultArray: T[]
) => boolean;
const result = await new ChainWrapper({
	interceptor: (previousResult, currentIndex) =>
		previousResult.success && previousResult.data.status,
}).execute();
```

### functional interceptor

> 基于每个方法；在当前方法执行后立即执行，主要是用于验证当前结果的

```typescript
type TInterceptorFn = <T>(
	previousResult: T,
	currentResult: T,
	currentIndex: number,
	resultArray: T[]
) => boolean;
const result = await new ChainWrapper()
	.next({
		fn: fnA,
		args: [],
		interceptor: (previousResult, currentResult, currentIndex, resultArray) => {
			return currentResult.success && currentResult.data.status;
		},
	})
	.execute();
```

### ⚠️⚠️⚠️ 拦截器可以修改数据，谨慎使用

```typescript
const result = await new ChainWrapper()
	.next({
		fn: fnA,
		args: [],
		interceptor: (previousResult, currentResult, currentIndex, resultArray) => {
			currentResult.data.status = true;
			return currentResult.success && currentResult.data.status;
		},
	})
	.execute();
```
