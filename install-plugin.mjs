import fs from "fs";
import path from "path";
import manifest from "./manifest.json" with { type: "json" };
import https from "https";

// Join all argv args to handle vault paths that contain spaces
const destinationFolder = process.argv.slice(2).join(" ") || (fs.existsSync(".vault-path") ? fs.readFileSync(".vault-path", "utf8").trim() : "");

if (!destinationFolder) {
	console.error("Please provide path to Obsidian Vault");
	process.exit(1);
}

// Persist the vault path locally so 'npm run dev' can use it via esbuild
fs.writeFileSync(".vault-path", destinationFolder);

const pluginsFolder = path.join(destinationFolder, ".obsidian", "plugins");
const thisPluginFolder = path.join(pluginsFolder, manifest.id);

if (!fs.existsSync(thisPluginFolder)) {
	fs.mkdirSync(thisPluginFolder, { recursive: true });
}

const filesToCopy = ["main.js", "styles.css", "manifest.json"];

filesToCopy.forEach((file) => {
	fs.copyFileSync(file, path.join(thisPluginFolder, file));
});

// install hot-reload plugin to automatically reload this plugin
const hotReloadFilePath = path.join(thisPluginFolder, ".hotreload");
if (!fs.existsSync(hotReloadFilePath)) {
	fs.writeFileSync(hotReloadFilePath, "");
}
const hotReloadFolder = path.join(pluginsFolder, "hot-reload");

if (!fs.existsSync(hotReloadFolder)) {
	fs.mkdirSync(hotReloadFolder, { recursive: true });
	const hotReloadMain = "https://raw.githubusercontent.com/pjeby/hot-reload/master/main.js";
	const hotReloadManifest = "https://raw.githubusercontent.com/pjeby/hot-reload/master/manifest.json";
	https.get(hotReloadMain, function (response) {
		response.pipe(fs.createWriteStream(path.join(hotReloadFolder, "main.js")));
	});
	https.get(hotReloadManifest, function (response) {
		response.pipe(fs.createWriteStream(path.join(hotReloadFolder, "manifest.json")));
	});
}

console.log(`${new Date().toLocaleTimeString()} Plugin installed successfully!`);
