interface Array<T> {
  compact(): Array<NonNullable<T>>;
  mapBy<K extends keyof T>(key: K): Map<T[K], T>;
  groupBy<K extends keyof T>(key: K): Map<T[K], Array<T>>;
  isIntersectedWith(another: Array<T>): boolean;
  common(another: Array<T>): Array<T>;
  subtracts(another: Array<T>): Array<T>;
  compactMap<U>(
    callbackfn: (value: T, index: number, array: T[]) => U,
    thisArg?: unknown,
  ): Array<NonNullable<U>>;
  unique(by?: keyof T, override?: boolean): Array<T>;
  reversed(): Array<T>;
  sorted(compareFn?: (a: T, b: T) => number): Array<T>;
}
