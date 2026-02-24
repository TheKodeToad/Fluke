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
	const target = {};
	const lazyValue = (): any => {
		if ("value" in target) {
			return target.value;
		} else {
			const result = load();

			if (result == null) {
				throw new Error("load() returned nullish value");
			}
			if (typeof result !== "object") {
				throw new Error("load() returned non-object value '${typeof result}'");
			}

			target["value"] = result;
			return result;
		}
	};

	return new Proxy(target, {
		apply(_, thisArg, argArray) {
			return Reflect.apply(lazyValue(), thisArg, argArray);
		},
		construct(_, argArray, newTarget) {
			return Reflect.construct(lazyValue(), argArray, newTarget);
		},
		defineProperty(_, prop, attributes) {
			return Reflect.defineProperty(lazyValue(), prop, attributes);
		},
		deleteProperty(_, prop) {
			return Reflect.deleteProperty(lazyValue(), prop);
		},
		get(_, prop) {
			return Reflect.get(lazyValue(), prop);
		},
		getOwnPropertyDescriptor(_, prop) {
			return Reflect.getOwnPropertyDescriptor(lazyValue(), prop);
		},
		getPrototypeOf() {
			return Reflect.getPrototypeOf(lazyValue());
		},
		has(_, prop) {
			return Reflect.has(lazyValue(), prop);
		},
		isExtensible() {
			return Reflect.isExtensible(lazyValue());
		},
		ownKeys() {
			return Reflect.ownKeys(lazyValue());
		},
		preventExtensions() {
			return Reflect.preventExtensions(lazyValue());
		},
		set(_, prop, newValue) {
			return Reflect.set(lazyValue(), prop, newValue);
		},
		setPrototypeOf(_, value) {
			return Reflect.setPrototypeOf(lazyValue(), value);
		},
	}) as T;
}
