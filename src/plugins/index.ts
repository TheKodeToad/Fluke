import { registerPlugin } from "#plugin_registry";
import NoReplyPing from "#plugins/NoReplyPing";
import SettingsMenu from "./SettingsMenu";

export function registerPlugins() {
	registerPlugin(SettingsMenu);
	registerPlugin(NoReplyPing);
}
