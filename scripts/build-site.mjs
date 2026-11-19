import { copyFile, mkdir } from "node:fs/promises";

await mkdir("dist", { recursive: true });
await copyFile("index.html", "dist/index.html");
await copyFile("public/template.json", "dist/template.json");
console.log("Static workbench and committed XO template are ready for hosting.");
