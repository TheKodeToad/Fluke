import { definePlugin } from "#plugin";

export default definePlugin({
	name: "DisableSentry",
	description: "Disable Sentry and the crash reports it sends.",
	forceEnable: true,
	patches: [
		{
			module: "fluxer_app/index.tsx",
			replace: [{
				pattern: /(?<=\i\.\i\(\{)dsn:/,
				replacement: "enabled:false,$&"
			}]
		}
	]
});
