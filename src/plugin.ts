export interface Plugin {
	name: string;
	patches: Patch[];
}

export interface Patch {
	module: string;
	replace: PatchReplace[];
}

export interface PatchReplace {
	pattern: RegExp;
	replacement: string;
}

export function definePlugin(p: Plugin & Record<PropertyKey, any>): Plugin {
	return p;
}
