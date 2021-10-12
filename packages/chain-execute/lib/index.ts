import { EFnType } from './enum';
import {
	IInterceptorObject,
	IFuncObjectNormal,
	IFuncObjectCallback,
	IFuncObjectAsync,
	IOptions,
} from './interface';

// const
const _errorHandler: TErrorHandler = error => ({ success: false, error });
const _successHandler: TSuccessHandler = data => ({ success: true, data });

// assert
const isIInterceptorObject = (
	param: TInterceptorFunction | IInterceptorObject
): param is TInterceptorFunction => typeof param === 'function';

//
export default class ChainWrapper<T = unknown> {
	private funcs: Array<IFuncObjectNormal | IFuncObjectCallback | IFuncObjectAsync>;
	private funcResults: IResultObject<T>[];
	private options: Partial<IOptions>;

	constructor(options: Partial<IOptions>) {
		this.funcs = [];
		this.funcResults = [];
		this.options = options || {};
	}

	// todo: 考虑一下如果传入的时候 fn & fn, 或者是 fn | fn 的时候，如何处理
	next(param: PartialBy<IFuncObjectNormal, 'type'>): this;
	next(param: IFuncObjectNormal): this;
	next(param: IFuncObjectCallback): this;
	next(param: IFuncObjectAsync): this;
	next(
		param:
			| PartialBy<IFuncObjectNormal, 'type'>
			| IFuncObjectNormal
			| IFuncObjectCallback
			| IFuncObjectAsync
	): this {
		if (!param.type) {
			this.funcs.push({ ...param, type: EFnType.Normal });
		} else {
			this.funcs.push(param);
		}
		return this;
	}
	callbackNext(param: Omit<IFuncObjectCallback, 'type'>): this {
		this.funcs.push({ ...param, type: EFnType.Callback });
		return this;
	}
	asyncNext(param: Omit<IFuncObjectAsync, 'type'>): this {
		this.funcs.push({ ...param, type: EFnType.Async });
		return this;
	}

	async execute(): Promise<IResultObject<T>> {
		let index = 0;

		while (index < this.funcs.length) {
			const previousResult = this.funcResults[index - 1];
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

			const task = this.funcs[index];
			const { args = [], handler, interceptor } = task;
			const { errorHandler = _errorHandler, successHandler = _successHandler } = handler || {};

			// execute fn
			let currentResult: IResultObject<T> = { success: true };
			try {
				switch (task.type) {
					case EFnType.Normal:
						currentResult = successHandler(task.fn(...args));
						break;
					case EFnType.Callback:
						task.fn(...args, (error: Error, data: T) => {
							if (error) {
								currentResult = errorHandler(error);
							} else {
								currentResult = successHandler(data);
							}
						});
						break;
					case EFnType.Async:
						currentResult = await task
							.fn<T>(...args)
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
				const interceptorFn = isIInterceptorObject(interceptor) ? interceptor : interceptor.fn;
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
		// At least for one result, if this.funcs is empty, return the init-value { success: true }
		return this.funcResults[this.funcResults.length - 1];
	}
}
