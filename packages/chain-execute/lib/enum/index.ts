export enum EFnType {
	Normal, // 不是 promise 也不包含 callback
	Callback, // 不是 promise 包含 callback
	Async,
}
