import { lazyProxy } from "#lazy";
import { Plugin } from "#plugin";
import { isPluginEnabled, plugins, saveEnabledPlugins, setPluginEnabled } from "#plugin_registry";
import { mappedRequire, React } from "#webpack";
import { FunctionComponent } from "react";

const Switch: FunctionComponent<any> = lazyProxy(() => Object.values<any>(mappedRequire("fluxer_app/components/form/Switch.tsx"))[0]);

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
