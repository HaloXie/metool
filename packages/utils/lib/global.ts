// https://stackoverflow.com/questions/59480160/typescript-check-object-by-type-or-interface-at-runtime-with-typeguards-in-2020
const primitiveGuard = <T>(typeOf: string) => (x: unknown): x is T => typeof x === typeOf;

global.isString = primitiveGuard<string>('string');
global.isNumber = primitiveGuard<number>('number');
global.isBoolean = primitiveGuard<boolean>('boolean');
global.isNull = (x: unknown): x is null => x === null;
global.isObject = (x: unknown): x is object => !isNull(x) && typeof x === 'object';
global.isEnum = <T>(enumObject: T) => (token: unknown): token is T[keyof T] =>
  Object.values(enumObject).includes(token as T[keyof T]);
global.isArray = <T>(elemGuard: Guard<T>) => (x: unknown): x is Array<T> =>
  Array.isArray(x) && x.every((el) => elemGuard(el));

Array.prototype.compact = function <T>(this: Array<T>): Array<NonNullable<T>> {
  return this.filter((value): value is NonNullable<T> => value !== null && value !== undefined);
};

Array.prototype.mapBy = function <T, K extends keyof T>(this: Array<T>, key: K): Map<T[K], T> {
  return this.reduce((acc, el) => acc.set(el[key], el), new Map<T[K], T>());
};

Array.prototype.groupBy = function <T, K extends keyof T>(
  this: Array<T>,
  key: K,
): Map<T[K], Array<T>> {
  return this.reduce(
    (acc, el) => acc.set(el[key], (acc.get(el[key]) || []).concat([el])),
    new Map<T[K], Array<T>>(),
  );
};

Array.prototype.isIntersectedWith = function <T>(this: Array<T>, another: Array<T>): boolean {
  return this.some((value) => another.includes(value));
};

Array.prototype.common = function <T>(this: Array<T>, another: Array<T>): Array<T> {
  return this.filter((value) => another.includes(value));
};

Array.prototype.subtracts = function <T>(this: Array<T>, another: Array<T>): Array<T> {
  return this.compactMap((value) => (another.includes(value) ? undefined : value));
};

Array.prototype.compactMap = function <T, U>(
  this: Array<T>,
  callbackfn: (value: T, index: number, array: T[]) => U,
  thisArg?: unknown,
): NonNullable<U>[] {
  return this.map(callbackfn, thisArg).compact();
};

Array.prototype.reversed = function <T>(this: Array<T>): Array<T> {
  return [...this].reverse();
};

Array.prototype.unique = function <T>(this: Array<T>, by?: keyof T, override = false): Array<T> {
  if (by === undefined) {
    return [...new Set(this)];
  }

  return this.reduce((acc, current) => {
    const index = acc.findIndex((value) => value[by] === current[by]);

    if (index < 0) {
      return acc.concat(current);
    }

    if (override) {
      acc[index] = current;
    }

    return acc;
  }, [] as Array<T>);
};

Array.prototype.sorted = function <T>(
  this: Array<T>,
  compareFn?: (a: T, b: T) => number,
): Array<T> {
  return [...this].sort(compareFn);
};
