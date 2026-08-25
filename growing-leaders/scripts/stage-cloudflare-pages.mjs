import { cp, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const staticBuildDirectory = join(projectDirectory, "dist", "client");

const deploymentPaths = [
  "_headers",
  "_next",
  "data",
  "favicon.png",
  "index.html",
  "index.rsc",
  "og.png",
  "sw.js",
];

await Promise.all(
  deploymentPaths.map((path) =>
    rm(join(projectDirectory, path), { force: true, recursive: true }),
  ),
);

for (const entry of deploymentPaths) {
  await cp(join(staticBuildDirectory, entry), join(projectDirectory, entry), {
    force: true,
    recursive: true,
  });
}

console.log("Staged the static Cloudflare Pages site at the project root.");
