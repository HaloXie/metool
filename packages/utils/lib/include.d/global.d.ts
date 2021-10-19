type Obj<T = unknown> = { [key: string]: T };

type Voidable<T> = T | undefined | null;
type Guard<T> = (x: unknown) => x is T;
type Guarded<T extends Guard<unknown>> = T extends Guard<infer V> ? V : never;
type ArrayGuard = <T>(elemGuard: Guard<T>) => (x: unknown) => x is Array<T>;
type OmitDBKeys<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type Dictionary<K extends keyof never, T> = { [P in K]?: T };
type Optional<T> = T | undefined;

// todo https://www.zhihu.com/question/418792736

// https://stackoverflow.com/questions/38906359/create-a-global-variable-in-typescript
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace NodeJS {
	export interface Global {
		isString: Guard<string>;
		isNumber: Guard<number>;
		isBoolean: Guard<boolean>;
		isNull: Guard<null>;
		isObject: Guard<object>;
		isEnum: <T>(enumObject: T) => (token: unknown) => token is T[keyof T];
		isArray: <T>(elemGuard: Guard<T>) => (x: unknown) => x is Array<T>;
	}
}

declare const isString: Guard<string>;
declare const isNumber: Guard<number>;
declare const isBoolean: Guard<boolean>;
declare const isNull: Guard<null>;
declare const isObject: Guard<object>;
declare const isEnum: <T>(enumObject: T) => (token: unknown) => token is T[keyof T];
declare const isArray: <T>(elemGuard: Guard<T>) => (x: unknown) => x is Array<T>;
