import { lazyComponent } from "#lazy";
import { isPluginEnabled, saveEnabledPlugins, setPluginEnabled } from "#loader";
import { Plugin } from "#plugin";
import { plugins } from "#plugins";
import { React, wpRequire } from "#webpack";
import { ComponentType } from "react";

const Switch: ComponentType<any> = lazyComponent(() => Object.values<any>(wpRequire("./src/components/form/Switch.tsx"))[0]);

export function PluginComponent({ plugin }: { plugin: Plugin }) {
	// FIXME: this is horrible
	const [, forceUpdate] = React.useReducer(x => x + 1, 0);

	let name = plugin.name;
	if (plugin.forceEnable) {
		name += " (Required)";
	}

	return <Switch
		label={name}
		description={plugin.description}
		disabled={plugin.forceEnable}
		value={isPluginEnabled(plugin)}
		onChange={v => {
			setPluginEnabled(plugin, v);
			saveEnabledPlugins();
			forceUpdate();
		}}
	/>;
}

export default function() {
	return <>{Object.values(plugins).map(p => <PluginComponent plugin={p} />)}</>;
};
