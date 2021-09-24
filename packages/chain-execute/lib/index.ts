//
type TNormalFunction = (...args: any[]) => void;
type TCallbackFunction = (...args: any[]) => unknown; // 最后一个可能是 callback
type TAsyncFunction = (...args: any[]) => Promise<IResultObject>;
type TErrorHandler = (error: Error) => IResultObject;
type TSuccessHandler = (data: unknown) => IResultObject;

//
enum EFnType {
	Normal, // 不是 promise 也不包含 callback
	Callback, // 不是 promise 包含 callback
	Async,
}

//
interface IResultObject {
	success: boolean;
	error?: Error;
	data?: unknown;
}
interface IFuncObject {
	fn: TNormalFunction | TCallbackFunction | TAsyncFunction;
	args: unknown[];
	type: EFnType;
	handler: {
		errorHandler: TErrorHandler;
		successHandler: TSuccessHandler;
	};
}

//
const isAsyncFunction = (
	fn: TNormalFunction | TCallbackFunction | TAsyncFunction,
	type: EFnType
): fn is TAsyncFunction => type === EFnType.Async;

//
const _errorHandler = (error: Error): Omit<IResultObject, 'data'> => ({ success: false, error });
const _successHandler = (data: unknown): Omit<IResultObject, 'error'> => ({ success: true, data });

//
export default class ChainWrapper {
	private funcs: IFuncObject[];

	constructor() {
		this.funcs = [];
	}

	next(param: Omit<IFuncObject, 'type'>): this {
		this.funcs.push({ ...param, type: EFnType.Normal });
		return this;
	}
	callbackNext(param: Omit<IFuncObject, 'type'>): this {
		this.funcs.push({ ...param, type: EFnType.Callback });
		return this;
	}
	asyncNext(param: Omit<IFuncObject, 'async'>): this {
		this.funcs.push({ ...param, type: EFnType.Async });
		return this;
	}

	async execute(): Promise<IResultObject> {
		let index = 0,
			prevResult: IResultObject = { success: false };

		while (index < this.funcs.length) {
			if (index && !prevResult.success) {
				break;
			}

			const task = this.funcs[index];
			console.log(index, task, prevResult);

			const { type, fn, args = [], handler } = task;
			const { errorHandler = _errorHandler, successHandler = _successHandler } = handler || {};
			switch (type) {
				case EFnType.Normal:
					try {
						prevResult = successHandler(fn(...args));
					} catch (error) {
						prevResult = errorHandler(error as Error);
					}
					break;
				case EFnType.Callback:
					fn(...args, (error: Error, data: unknown) => {
						if (error) {
							prevResult = errorHandler(error);
						} else {
							prevResult = successHandler(data);
						}
					});
					break;
				case EFnType.Async:
					prevResult = await (fn as TAsyncFunction)(...args)
						.then(successHandler)
						.catch(errorHandler);
					break;
			}

			index++;
		}
		return prevResult;
	}
}
