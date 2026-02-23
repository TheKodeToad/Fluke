export function lazyLoad<T>(load: () => T): () => T {
	let value: T;

	return () => {
		if (value !== undefined) {
			return value;
		}

		value = load();
		return value;
	};
}

export function lazyProxy<T>(load: () => T): T {
	const target: () => any = lazyLoad(load);

	return new Proxy({}, {
		apply(_, thisArg, argArray) {
			return Reflect.apply(target(), thisArg, argArray);
		},
		construct(_, argArray, newTarget) {
			return Reflect.construct(target(), argArray, newTarget);
		},
		defineProperty(_, prop, attributes) {
			return Reflect.defineProperty(target(), prop, attributes);
		},
		deleteProperty(_, prop) {
			return Reflect.deleteProperty(target(), prop);
		},
		get(_, prop) {
			return Reflect.get(target(), prop);
		},
		getOwnPropertyDescriptor(_, prop) {
			return Reflect.getOwnPropertyDescriptor(target(), prop);
		},
		getPrototypeOf() {
			return Reflect.getPrototypeOf(target());
		},
		has(_, prop) {
			return Reflect.has(target(), prop);
		},
		isExtensible() {
			return Reflect.isExtensible(target());
		},
		ownKeys() {
			return Reflect.ownKeys(target());
		},
		preventExtensions() {
			return Reflect.preventExtensions(target());
		},
		set(_, prop, newValue) {
			return Reflect.set(target(), prop, newValue);
		},
		setPrototypeOf(_, value) {
			return Reflect.setPrototypeOf(target(), value);
		},
	}) as T;
}
