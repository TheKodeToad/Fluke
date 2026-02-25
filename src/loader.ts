import * as webpack from "#webpack";
import { Patch, Plugin } from "#plugin";
import { patchWebpack } from "#webpack";
import { plugins } from "#plugins";

function flukeInit() {
	window["Fluke"] = { plugins, webpack };

	restoreEnabledPlugins();

	const pendingPatches: Patch[] = [];

	for (const name in plugins) {
		const plugin = plugins[name]!;

		if (!isPluginEnabled(plugin)) {
			continue;
		}

		for (const patch of plugin.patches) {
			pendingPatches.push(patch);

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
					"Fluke.plugins[" + JSON.stringify(plugin.name) + "]"
				);
			}
		}
	}

	const patchModule = (key: string, value: any): any => {
		let src = Function.prototype.toString.call(value);

		for (let i = 0; i < pendingPatches.length; ++i) {
			const patch = pendingPatches[i]!;

			if (!src.includes(patch.find)) {
				continue;
			}

			for (const replace of patch.replace) {
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

			pendingPatches.splice(i, 1);
			--i;
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
}

const enabledPlugins: Set<string> = new Set;

export function isPluginEnabled(plugin: Plugin): boolean {
	return plugin.forceEnable || enabledPlugins.has(plugin.name);
}

export function setPluginEnabled(plugin: Plugin, enabled: boolean) {
	if (plugin.forceEnable) {
		return;
	}

	if (enabled) {
		enabledPlugins.add(plugin.name);
	} else {
		enabledPlugins.delete(plugin.name);
	}
}

const ENABLED_STORAGE_KEY = "fluke_enabled_plugins";

function restoreEnabledPlugins() {
	const str = localStorage.getItem(ENABLED_STORAGE_KEY);
	if (str === null) {
		return;
	}

	try {
		var loaded = JSON.parse(str);
		if (!Array.isArray(loaded)) {
			console.warn(`${ENABLED_STORAGE_KEY} is not an array`);
			return;
		}
	} catch (err) {
		if (!(err instanceof SyntaxError)) {
			throw err;
		}

		console.warn("Failed to load ${ITEM_NAME}", err);
		return;
	}

	enabledPlugins.clear();
	for (const item of loaded) {
		if (typeof item !== "string") {
			console.warn(`Item in ${ENABLED_STORAGE_KEY} is not a string`, item);
			continue;
		}

		const plugin = plugins[item];
		if (plugin) {
			setPluginEnabled(plugin, true);
		}
	}
}

export function saveEnabledPlugins() {
	localStorage.setItem(ENABLED_STORAGE_KEY, JSON.stringify([...enabledPlugins]));
}

flukeInit();
