import { definePlugin } from "../plugin";
import PlugIcon from "../ui/icons/PlugIcon";

export default definePlugin({
	name: "SettingsMenu",
	patches: [{
		module: "fluxer_app/components/modals/utils/SettingsConstants.tsx",
		replace: [
			{
				pattern: /{type:"developer_options",category:"staff_only"/,
				replacement: '...$this.sections(),$&'
			},
			{
				pattern: /(?<=function \i\(\i\)\{switch\(\i\)\{)case"user_settings"/,
				replacement: "default:return $this.getCategoryName(arguments[0]);$&"
			}
		]
	}],
	sections() {
		return [{
			type: "fluke_plugins",
			category: "fluke",
			"label": { "message": "Plugins" },
			icon: PlugIcon,
		}];
	},
	getCategoryName(id: string) {
		switch (id) {
			case "fluke":
				return "Fluke";
		}
	}
})
