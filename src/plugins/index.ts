import { registerPlugin } from "#plugin_registry";
import DisableSentry from "#plugins/DisableSentry";
import NoReplyPing from "#plugins/NoReplyPing";
import SettingsMenu from "./SettingsMenu";

export function registerPlugins() {
	registerPlugin(SettingsMenu);
	registerPlugin(DisableSentry);
	registerPlugin(NoReplyPing);
}
