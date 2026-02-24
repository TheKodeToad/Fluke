import esbuild from "esbuild";

const dev = process.argv.includes("--dev");

const ctx = await esbuild.context({
	entryPoints: ["src/loader.ts"],
	// no electron support but when that is added the distinction may be important
	outfile: "dist/fluke_renderer.js",
	bundle: true,
	jsxFactory: "Fluke.webpack.React.createElement",
	jsxFragment: "Fluke.webpack.React.Fragment",
	treeShaking: true,
	minify: !dev,
	format: "iife",
	logLevel: "info",
})

if (dev) {
	await ctx.watch();
} else {
	await ctx.rebuild();
	await ctx.dispose();
}

