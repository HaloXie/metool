// https://stackoverflow.com/questions/59480160/typescript-check-object-by-type-or-interface-at-runtime-with-typeguards-in-2020
const primitiveGuard =
	<T>(typeOf: string) =>
	(x: unknown): x is T =>
		typeof x === typeOf;

global.isString = primitiveGuard<string>('string');
global.isNumber = primitiveGuard<number>('number');
global.isBoolean = primitiveGuard<boolean>('boolean');
global.isNull = (x: unknown): x is null => x === null;
global.isObject = (x: unknown): x is object => !isNull(x) && typeof x === 'object';
global.isEnum =
	<T>(enumObject: T) =>
	(token: unknown): token is T[keyof T] =>
		Object.values(enumObject).includes(token as T[keyof T]);
global.isArray =
	<T>(elemGuard: Guard<T>) =>
	(x: unknown): x is Array<T> =>
		Array.isArray(x) && x.every(el => elemGuard(el));
