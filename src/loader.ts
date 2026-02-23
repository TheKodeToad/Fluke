import * as pluginRegistry from "#plugin_registry";
import * as webpack from "#webpack";
import { PatchReplace } from "#plugin";
import { registerPlugins } from "#plugins";
import { patchWebpack } from "#webpack";
import { plugins } from "#plugin_registry";

window["fluke"] = { pluginRegistry, webpack };

registerPlugins();

const replaceByModule: Map<string, PatchReplace[]> = new Map;

for (const name in plugins) {
	const plugin = plugins[name]!;

	for (const patch of plugin.patches) {
		let modEntry = replaceByModule.get(patch.module);
		if (!modEntry) {
			modEntry = [];
			replaceByModule.set(patch.module, modEntry);
		}

		for (const replace of patch.replace) {
			// preprocess the pattern to allow \i to match JavaScript identifiers
			// NOTE: yes I know JavaScript identifiers can contain all unicode letters (at least according to MDN)
			// but I don't think we'll encounter those
			const newSource = replace.pattern.source.replaceAll(
				"\\i",
				"(?:[A-Za-z$_][A-Za-z$_0-9]*)"
			);
			replace.pattern = new RegExp(newSource, replace.pattern.flags);

			replace.replacement = replace.replacement.replaceAll(
				"$this",
				"fluke.pluginRegistry.plugins[" + JSON.stringify(plugin.name) + "]"
			);
		}

		modEntry.push(...patch.replace);
	}
}

function patchModule(key: string, value: any): any {
	const modReplaces = replaceByModule.get(key);

	let src = Function.prototype.toString.call(value);

	if (modReplaces) {
		for (const replace of modReplaces) {
			let newSrc: string;
			if (replace.pattern.flags.includes("g")) {
				newSrc = src.replaceAll(replace.pattern, replace.replacement);
			} else {
				newSrc = src.replace(replace.pattern, replace.replacement);
			}

			if (src === newSrc) {
				console.warn("Patch had no effect", replace);
			} else {
				src = newSrc;
			}
		}
	}

	// for now we are always doing this even with no patches because it makes dev easier
	src = 
		`//# sourceURL=file:///fluke_patched/${key}\n`
		+ `0,${src}`; // NOTE: "0," is needed to have a floating unnamed function

	// NOTE: It's also apparently a good idea to use this trick with eval: https://esbuild.github.io/link/direct-eval
	// I love JavaScript
	return (0, eval)(src);
}

Object.defineProperty(Function.prototype, "m", {
	set(modules) {
		delete Function.prototype["m"];
		patchWebpack(this, modules, patchModule);
	},
	configurable: true,
});
