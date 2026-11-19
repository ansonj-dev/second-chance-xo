import { copyFile, mkdir } from "node:fs/promises";

await mkdir("dist", { recursive: true });
await copyFile("index.html", "dist/index.html");
await copyFile("dist/second-chance.xo.json", "dist/template.json");
console.log("Static workbench and exported XO template are ready for hosting.");
