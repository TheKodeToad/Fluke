import { registerPlugin } from "../plugin_registry";
import SettingsMenu from "./SettingsMenu";

export function registerPlugins() {
	registerPlugin(SettingsMenu);
}
