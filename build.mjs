import esbuild from "esbuild";
import { readdir } from "node:fs/promises";
import { dirname } from "node:path";

const dev = process.argv.includes("--dev");

let pluginsGenPlugin = {
	name: "plugins-gen",
	setup(build) {
		build.onLoad({ filter: /.\/src\/plugins\/index.ts/, namespace: "file" }, async args => {
			let imports = "";
			let mappings = "";

			const entries = await readdir(dirname(args.path), { withFileTypes: true });
			// make the order deterministic!
			// NOTE: on some platforms node apparently does automatically sort but this behaviour may not be guaranteed
			entries.sort((a, b) => a.name.localeCompare(b.name, "en-US"));

			for (const entry of entries) {
				let modName;

				if (entry.isFile()) {
					if (entry.name === "index.ts") {
						continue;
					}

					if (entry.name.endsWith(".ts")) {
						modName = entry.name.slice(0, -3);
					} else if (entry.name.endsWith(".tsx")) {
						modName = entry.name.slice(0, -4);
					} else {
						continue;
					}
				} else if (entry.isDirectory()) {
					modName = entry.name;
				} else {
					continue;
				}

				imports += `import ${modName} from ${JSON.stringify("./" + modName)};`;
				mappings += `[${modName}.name]: ${modName},`;

			}

			return { contents: `${imports}export const plugins = {${mappings}};` };
		});
	}
}

const ctx = await esbuild.context({
	entryPoints: ["src/loader.ts"],
	// no electron support but when that is added the distinction may be important
	outfile: "dist/fluke_renderer.js",

	bundle: true,
	format: "iife",
	minify: !dev,
	treeShaking: true,
	jsxFactory: "Fluke.webpack.React.createElement",
	jsxFragment: "Fluke.webpack.React.Fragment",

	logLevel: "info",
	plugins: [pluginsGenPlugin],
})

if (dev) {
	await ctx.watch();
} else {
	await ctx.rebuild();
	await ctx.dispose();
}

