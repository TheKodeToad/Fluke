export let require;
export let React: typeof import("react");

export const reverseRequireMap: Map<string, string> = new Map;

export function mappedRequire(id: string): any {
	return require(reverseRequireMap.get(id) ?? id);
}

const nodeModulePattern = /^\.\.\/node_modules\/\.pnpm\/.+?\/node_modules\/(.+?)$/;

function mapID(id: string): string | null {
	const srcPrefix = "./src/";
	if (id.startsWith(srcPrefix)) {
		return "fluxer_app/" + id.substring(srcPrefix.length);
	}

	const nodeModuleMatch = id.match(nodeModulePattern);
	if (nodeModuleMatch !== null) {
		return nodeModuleMatch[1]!;
	}

	return null;
}

export function patchWebpack(webpackRequire: any, modules: any, patchModule: (key: string, value: string) => string) {
	require = webpackRequire;

	const addModule = (id: string, value: any) => {
		const mappedID = mapID(id);

		if (mappedID !== null) {
			if (reverseRequireMap.has(mappedID)) {
				console.warn(`Multiple modules mapped to '${mappedID}' - '${reverseRequireMap.get(mappedID)}' and '${id}' conflicting`);
			} else {
				reverseRequireMap.set(mappedID, id);
			}
		}

		modules[id] = patchModule(mappedID ?? id, value);

		if (mappedID === "react/index.js") {
			React = require(id);
		}
	};

	require.m = new Proxy(modules, {
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
