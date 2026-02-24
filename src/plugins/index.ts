import { registerPlugin } from "#plugin_registry";
import Test from "#plugins/Test";
import SettingsMenu from "./SettingsMenu";

export function registerPlugins() {
	registerPlugin(SettingsMenu);
	registerPlugin(Test);
}
