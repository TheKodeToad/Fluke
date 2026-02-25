import { definePlugin } from "#plugin";

export default definePlugin({
	name: "DisableSentry",
	description: "Disable Sentry and the crash reports it sends.",
	forceEnable: true,
	patches: [
		{
			// index.tsx
			find: '.error("Failed to initialize runtime config:",',
			replace: [{
				pattern: /(?<=\i\.\i\(\{)dsn:/,
				replacement: "enabled:false,$&"
			}]
		}
	]
});
