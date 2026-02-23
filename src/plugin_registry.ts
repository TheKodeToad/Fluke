import { Plugin } from "#plugin";

export const plugins: Record<string, Plugin> = Object.create(null);

export function registerPlugin(plugin: Plugin) {
	if (plugin.name in plugins) {
		throw new Error(`Duplicate plugin: '${plugin.name}'`);
	}

	plugins[plugin.name] = plugin;
}
