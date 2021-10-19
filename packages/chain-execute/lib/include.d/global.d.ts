type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type NoResultCallback = (error: Error | null) => void;
type ResultCallback<T> = (error: Error | null, result: T) => void;
