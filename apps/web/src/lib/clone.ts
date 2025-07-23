export function deepClone<T>(obj: T): T {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}

	if (obj instanceof Date) {
		return new Date(obj.getTime()) as any;
	}

	if (obj instanceof Array) {
		const arr = [] as any[];
		for (let i = 0; i < obj.length; i++) {
			arr[i] = deepClone(obj[i]);
		}
		return arr as any;
	}

	if (obj instanceof Object) {
		const copy = { ...obj } as { [key: string]: any };
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				copy[key] = deepClone((obj as any)[key]);
			}
		}
		return copy as T;
	}

	return obj;
} 