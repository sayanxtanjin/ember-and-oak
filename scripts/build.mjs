import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const dist = new URL("../dist/", import.meta.url);

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const entry of ["index.html", "css", "js", "pages", "uploads"]) {
  await cp(new URL(entry, root), new URL(entry, dist), { recursive: true });
}
const menu = JSON.parse(await readFile(new URL("data/menu.json", root), "utf8"));
await writeFile(new URL("netlify/functions/seed-menu.mjs", root), `export default ${JSON.stringify(menu)};\n`);
