import { definePlugin } from "#plugin";
import PluginsTab from "#plugins/SettingsMenu/PluginsTab";
import PlugIcon from "#ui/icons/PlugIcon";

export default definePlugin({
	name: "SettingsMenu",
	description: "Adds Fluke settings to Fluxer.",
	forceEnable: true,
	patches: [
		{
			module: "fluxer_app/components/modals/utils/SettingsConstants.tsx",
			replace: [
				{
					pattern: /{type:"developer_options",category:"staff_only"/,
					replacement: '...$this.sections(),$&'
				},
				{
					pattern: /(?<=function \i\(\i\)\{switch\(\i\)\{)case"user_settings"/,
					replacement: "default:return $this.categoryName(arguments[0]);$&"
				}
			]
		},
		{
			module: "fluxer_app/components/modals/UserSettingsModal.tsx",
			replace: [
				{
					pattern: /(?<=(?<tabName>\i)=>\{var \i;return )null!=\(\i=\i\[\i\]\)\?\i:null/, 
					replacement: "$this.tabComponent($<tabName>)??($&);"
				}
			]
		},
	],
	sections() {
		return [{
			type: "fluke_plugins",
			category: "fluke",
			"label": { "message": "Plugins" },
			icon: PlugIcon,
		}];
	},
	tabComponent(id: string) {
		switch (id) {
			case "fluke_plugins":
				return PluginsTab;
		}
	},
	categoryName(id: string) {
		switch (id) {
			case "fluke":
				return "Fluke";
		}
	},
})
