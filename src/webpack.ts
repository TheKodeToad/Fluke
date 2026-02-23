export let wreq;
export let React: typeof import("react");

export const requireMap: Map<string, string> = new Map;

export function mappedRequire(id: string): any {
	return wreq(requireMap.get(id) ?? id);
}

const nodeModulePattern = /^\.\.\/node_modules\/\.pnpm\/.+?\/node_modules\/(.+?)$/;

function unmapID(id: string): string | null {
	if (id.startsWith("./src/")) {
		return "fluxer_app/" + id.substring("./src/".length);
	}

	const nodeModuleMatch = id.match(nodeModulePattern);
	if (nodeModuleMatch !== null) {
		return nodeModuleMatch[1]!;
	}

	return null;
}

export function patchWebpack(require: any, modules: any, patchModule: (key: string, value: string) => string) {
	wreq = require;

	const addModule = (id: string, value: any) => {
		const unmappedID = unmapID(id);

		if (unmappedID !== null) {
			requireMap.set(unmappedID, id);
		}

		modules[id] = patchModule(unmappedID ?? id, value);

		if (unmappedID === "react/index.js") {
			React = wreq(id);
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
