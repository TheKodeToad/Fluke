import { definePlugin } from "#plugin";

export default definePlugin({
	name: "Test",
	description: "A test plugin",
	patches: [{
		module: "fluxer_app/index.tsx",
		replace: [{
			pattern: /"Fluxer"/,
			replacement: '"Fluke Skywalker"',
		}]
	}]
});
