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

const fnD = data => { console.log(data);};
```

### next

```JavaScript
// empty
new ChainWrapper().execute(); // { success: true, data: undefined }

new ChainWrapper().next({fn: fnA,args: [],}).execute(); // { success: true, data: '1normal' }

// void
new ChainWrapper().next({fn: fnD,args: [1],}).execute(); // { success: true, data: undefined }
```

### callbackNext

```JavaScript
new ChainWrapper().callbackNext({
  fn: fnB,
  args: [0],
  handler: { successHandler: data => ({ success: true, data, data1: data }), },
}).execute(); // { success: true, data: [0], data1: [0] }

new ChainWrapper().callbackNext({fn: fnB,args: [0, 2, 3],}).execute(); // { success: true, data: [0, 2, 3] }

// callback return error
new ChainWrapper().callbackNext({fn: fnB,args: [1],}).execute() // { success: false, error: new Error("fb1")}
```

### asyncNext

```JavaScript
new ChainWrapper().asyncNext({fn: fnC,args: [],}).execute(); // { success: true, data: 3 }
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
