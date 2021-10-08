type TSuccessResultObject<T> = { success: true; data?: T };
type TErrorResultObject = { success: false; error: Error };
type IResultObject<T> = TSuccessResultObject<T> | TErrorResultObject;
