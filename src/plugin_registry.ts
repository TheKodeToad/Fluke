import { Plugin } from "#plugin";

export const plugins: Record<string, Plugin> = Object.create(null);
const enabledPlugins: Set<string> = new Set;

export function registerPlugin(plugin: Plugin) {
	if (plugin.name in plugins) {
		throw new Error(`Duplicate plugin: '${plugin.name}'`);
	}

	plugins[plugin.name] = plugin;
}

const ENABLED_STORAGE_KEY = "fluke_enabled_plugins";

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

export function restoreEnabledPlugins() {
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
