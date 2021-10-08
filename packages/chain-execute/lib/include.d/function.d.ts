//
type TNormalFunction = <T>(...args: unknown[]) => T;
type TCallbackFunction = (...args: unknown[]) => void; // 最后一个可能是 callback
type TAsyncFunction = <T>(...args: unknown[]) => Promise<T>; // todo: 支持 Promise.all

//
type TInterceptorFunction = <T>(
	previousResult: T,
	currentResult: T,
	currentIndex: number,
	resultArray: T[]
) => boolean;

//
type TErrorHandler = (error: Error) => TErrorResultObject;
type TSuccessHandler = <T>(data: T) => TSuccessResultObject<T>;
