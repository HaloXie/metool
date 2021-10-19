// todo not complete
export const omitObject = <T extends Obj<any>, K extends keyof T>(
	targetObj: T,
	fields: K[],
	keyMap = new Map<string, string>()
) =>
	fields.reduce((prev, curr) => {
		if (curr in targetObj && targetObj[curr]) {
			const key = curr ? keyMap.get(curr) : curr;

			return { ...prev, [key]: targetObj[curr] };
		}
		return prev;
	}, {});
