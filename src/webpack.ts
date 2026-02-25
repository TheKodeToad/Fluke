export interface WebpackRequire {
	(id: string): any;
	m: Record<PropertyKey, Function>;
}

export let wpRequire: WebpackRequire;
export let React: typeof import("react");

const libRequireMap: Map<string, string> = new Map;

/**
 * Simplified import for libraries in node_modules - import with the ../node_modules/.pnpm/.../node_modules prefix stripped.
 */
export function libRequire(id: string): any {
	return wpRequire(libRequireMap.get(id) ?? id);
}

const nodeModulePattern = /^\.\.\/node_modules\/\.pnpm\/.+?\/node_modules\/(.+?)$/;

function mapLibID(id: string): string | null {
	const nodeModuleMatch = id.match(nodeModulePattern);
	return nodeModuleMatch?.[1]! ?? null;
}

export function patchWebpack(webpackRequire: any, modules: WebpackRequire["m"], patchModule: (key: string, value: string) => Function) {
	wpRequire = webpackRequire;

	const addModule = (id: string, value: any) => {
		const mappedID = mapLibID(id);

		if (mappedID !== null) {
			if (libRequireMap.has(mappedID)) {
				console.warn(`Multiple modules mapped to '${mappedID}' - '${libRequireMap.get(mappedID)}' and '${id}' conflicting`);
			} else {
				libRequireMap.set(mappedID, id);
			}
		}

		modules[id] = patchModule(id, value);

		if (mappedID === "react/index.js") {
			React = wpRequire(id);
		}
	};

	wpRequire.m = new Proxy(modules, {
		set(_, id, newValue) {
			if (typeof id !== "string") {
				modules[id] = newValue;
			} else {
				addModule(id, newValue);
			}
			return true;
		}
	});

	for (const id in modules) {
		addModule(id, modules[id]);
	}
}
