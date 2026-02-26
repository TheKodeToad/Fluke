import { Component, ComponentType, FunctionComponent } from "react";

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

export const lazyProxyValue = Symbol("lazyProxyValue");

export function lazyProxy<T>(load: () => T): T {
	const target = () => { };
	const value = (): any => {
		if ("value" in target) {
			return target.value;
		} else {
			const result = load();

			if (result == null) {
				throw new Error("load() returned nullish value");
			}
			if (typeof result !== "object" && typeof result !== "function") {
				throw new Error(`load() returned non-object value '${typeof result}'`);
			}

			// NOTE: just so it's visible in DevTools
			target["value"] = result;
			return result;
		}
	};

	return new Proxy(target, {
		apply(_target, thisArg, argArray) {
			return Reflect.apply(value(), thisArg, argArray);
		},
		construct(_target, argArray, newTarget) {
			return Reflect.construct(value(), argArray, newTarget);
		},
		defineProperty(_target, prop, attributes) {
			return Reflect.defineProperty(value(), prop, attributes);
		},
		deleteProperty(_target, prop) {
			return Reflect.deleteProperty(value(), prop);
		},
		get(_target, prop) {
			if (prop === lazyProxyValue) {
				return value();
			}
			return Reflect.get(value(), prop);
		},
		getOwnPropertyDescriptor(_target, prop) {
			return Reflect.getOwnPropertyDescriptor(value(), prop);
		},
		getPrototypeOf() {
			return Reflect.getPrototypeOf(value());
		},
		has(_target, prop) {
			return Reflect.has(value(), prop);
		},
		isExtensible() {
			return Reflect.isExtensible(value());
		},
		ownKeys() {
			return Reflect.ownKeys(value());
		},
		preventExtensions() {
			return Reflect.preventExtensions(value());
		},
		set(_target, prop, newValue) {
			return Reflect.set(value(), prop, newValue);
		},
		setPrototypeOf(_target, proto) {
			return Reflect.setPrototypeOf(value(), proto);
		},
	}) as T;
}

export function lazyComponent<P extends object>(load: () => ComponentType<P>): FunctionComponent<P> {
	const value = lazyLoad(load);

	return props => {
		const Component = value();

		if (Component) {
			return <Component {...props} />;
		} else {
			return <></>;
		}
	}
}
