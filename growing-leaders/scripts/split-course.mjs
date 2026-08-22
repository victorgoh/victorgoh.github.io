import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const courseRoot = resolve(scriptDirectory, "..");

const completeCourseFile = resolve(courseRoot, "GROWING-LEADERS-COMPLETE-COURSE.md");
const targetFiles = [
  resolve(courseRoot, "COURSE-INTRODUCTION.md"),
  resolve(courseRoot, "modules/01-god-uses-your-story.md"),
  resolve(courseRoot, "modules/02-character-is-formed-under-pressure.md"),
  resolve(courseRoot, "modules/03-be-faithful-with-what-you-have.md"),
  resolve(courseRoot, "modules/04-discover-and-develop-your-gifts.md"),
  resolve(courseRoot, "modules/05-learn-to-lead-with-people.md"),
  resolve(courseRoot, "modules/06-lead-from-a-deepening-life-with-god.md"),
];

const fullContent = await readFile(completeCourseFile, "utf8");
const sections = fullContent.split(/\n---\n\n(?=# Module \d+:)/);

if (sections.length !== 7) {
  throw new Error(`Expected 7 sections (intro + 6 modules), but found ${sections.length}`);
}

await Promise.all(
  sections.map(async (section, index) => {
    const targetFile = targetFiles[index];
    await writeFile(targetFile, `${section.trim()}\n`, "utf8");
  }),
);

console.log("Successfully split GROWING-LEADERS-COMPLETE-COURSE.md into introduction and 6 module files.");
