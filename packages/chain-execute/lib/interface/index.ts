import { EFnType } from '../enum';

// interceptor
export interface IInterceptorObject {
	/**
	 * todo: 只有当 fn 返回 true 的时候从才会被触发
	 * 设想的工作流，可以跳转到其他方法，对应 funcs[] 的下标
	 */
	goto?: number;
	/**
	 * todo: 如果被拦截到，是否继续下面的方法
	 * 相当于跳过本次的错误退出，继续执行下一个方法，相当于 (goto = currentIndex + 1) + (fn = true)
	 * 注意这里并不会修改 fn 的返回值
	 */
	continue?: boolean;
	fn: TInterceptorFunction;
}

//
export interface IOptions {
	/**
	 * 是否进行输出，输出 当前任务和运行结果
	 */
	console: boolean;
	/**
	 * 全局拦截器，如果声明该拦截器贼会在每个方法【之前】执行，如验证用户、权限等
	 * 所以 previousResult = resultArray[currentIndex - 1]
	 */
	interceptor: <T>(previousResult: T, currentIndex: number, resultArray: T[]) => boolean;
}

//
interface IFuncObjectBase<T> {
	fn: T;
	args?: unknown[];
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
	interceptor?: TInterceptorFunction | IInterceptorObject;
}
export interface IFuncObjectNormal extends IFuncObjectBase<TNormalFunction> {
	type: EFnType.Normal;
}
export interface IFuncObjectCallback extends IFuncObjectBase<TCallbackFunction> {
	type: EFnType.Callback;
}
export interface IFuncObjectAsync extends IFuncObjectBase<TAsyncFunction> {
	type: EFnType.Async;
}
