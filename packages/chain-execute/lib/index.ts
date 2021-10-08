// 返回结果
type TSuccessResultObject<T> = { success: true; data?: T };
type TErrorResultObject = { success: false; error: Error };
type IResultObject<T> = TSuccessResultObject<T> | TErrorResultObject;

// functions
type TNormalFunction = <T>(...args: unknown[]) => T;
type TCallbackFunction = (...args: unknown[]) => void; // 最后一个可能是 callback
type TAsyncFunction = <T>(...args: unknown[]) => Promise<T>;
type TErrorHandler = (error: Error) => TErrorResultObject;
type TSuccessHandler = <T>(data: unknown) => TSuccessResultObject<T>;

// 两个 interceptor 的区别，方法的会额外传入当前方法的结果
type TInterceptorGlobalFn = <T>(
	previousResult: T,
	currentIndex: number,
	resultArray: T[]
) => boolean;
type TInterceptorFn = <T>(
	previousResult: T,
	currentResult: T,
	currentIndex: number,
	resultArray: T[]
) => boolean;
type TInterceptorObject = {
	/**
	 * 只有当 fn 返回 true 的时候从才会被触发
	 * 设想的工作流，可以跳转到其他方法，对应 funcs[] 的下标
	 */
	goto?: number;
	/**
	 * 如果被拦截到，是否继续下面的方法
	 * 相当于跳过本次的错误退出，继续执行下一个方法，相当于 (goto = currentIndex + 1) + (fn = true)
	 * 注意这里并不会修改 fn 的返回值
	 */
	continue?: boolean;
	fn: TInterceptorFn;
};

//
enum EFnType {
	Normal, // 不是 promise 也不包含 callback
	Callback, // 不是 promise 包含 callback
	Async,
}

//
interface IOptions {
	/**
	 * 是否进行输出，输出 当前任务和运行结果
	 */
	console: boolean;
	/**
	 * 全局拦截器，如果声明该拦截器贼会在每个方法【之前】执行，如验证用户、权限等
	 * 所以 previousResult = resultArray[currentIndex - 1]
	 */
	interceptor: TInterceptorGlobalFn;
}
interface IFuncObject {
	fn: TNormalFunction | TCallbackFunction | TAsyncFunction;
	args?: unknown[];
	type: EFnType;
	handler?: {
		errorHandler: TErrorHandler;
		successHandler: TSuccessHandler;
	};
	/**
	 * 用于确定是否继续下一个步骤，和 errorHandler 的区别是更偏向于业务数据
	 * 这里是在每个方法【之后】执行，所以
	 * 1. previousResult = resultArray[currentIndex - 1]
	 * 2. currentResult = resultArray[currentIndex]
	 */
	interceptor?: TInterceptorFn | TInterceptorObject;
}

// assert
const isTInterceptorObject = (
	param: TInterceptorFn | TInterceptorObject
): param is TInterceptorFn => typeof param === 'function';

// 默认方法
const _errorHandler = (error: Error): TErrorResultObject => ({ success: false, error });
const _successHandler = <T>(data: T): TSuccessResultObject<T> => ({ success: true, data });

const unknownFnTypeError = new Error('unknown fn type');

//
export default class ChainWrapper<T = unknown> {
	private funcs: IFuncObject[];
	private funcResults: IResultObject<T>[];
	private options: Partial<IOptions>;

	constructor(options: Partial<IOptions>) {
		this.funcs = [];
		this.funcResults = [];
		this.options = options || {};
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

	async execute(): Promise<IResultObject<T>> {
		let index = 0;

		while (index < this.funcs.length) {
			const previousResult = this.funcResults[index - 1];
			const task = this.funcs[index];
			const { type, fn, args = [], handler, interceptor } = task;
			const { errorHandler = _errorHandler, successHandler = _successHandler } = handler || {};

			if (index && previousResult && !previousResult.success) {
				break;
			}

			// interceptor -- global
			if (
				index &&
				this.options.interceptor &&
				!this.options.interceptor(previousResult, index, this.funcResults)
			) {
				return {
					success: false,
					error: new Error(
						`Global interceptor catch, index: ${index}, previousResult: ${JSON.stringify(
							previousResult
						)}`
					),
				};
			}

			// execute fn
			let currentResult: IResultObject<T> = { success: false, error: unknownFnTypeError };
			try {
				switch (type) {
					case EFnType.Normal:
						currentResult = successHandler((fn as TNormalFunction)(...args));
						break;
					case EFnType.Callback:
						(fn as TCallbackFunction)(...args, (error: Error, data: T) => {
							if (error) {
								currentResult = errorHandler(error);
							} else {
								currentResult = successHandler(data);
							}
						});
						break;
					case EFnType.Async:
						currentResult = await (fn as TAsyncFunction)<T>(...args)
							.then(successHandler)
							.catch(errorHandler);
						break;
				}
			} catch (error) {
				currentResult = errorHandler(error as Error);
			}
			this.funcResults.push(currentResult);

			// console
			if (this.options.console) {
				console.log({ index, task, currentResult });
			}

			// interceptor -- functional
			if (interceptor) {
				const interceptorFn = isTInterceptorObject(interceptor) ? interceptor : interceptor.fn;
				if (!interceptorFn(previousResult, currentResult, index, this.funcResults)) {
					return {
						success: false,
						error: new Error(
							`Function interceptor catch, index: ${index}, result: ${JSON.stringify(
								previousResult
							)}`
						),
					};
				}
			}

			index++;
		}

		// return the last fn result
		const result = this.funcResults[this.funcResults.length - 1];
		if (!result) {
			// 如果 this.funcs.length === 0
			return { success: true, data: undefined };
		}
		return result;
	}
}
