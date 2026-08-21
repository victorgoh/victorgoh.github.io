import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const courseRoot = resolve(import.meta.dirname, "..");
const moduleFiles = [
  "modules/01-god-uses-your-story.md",
  "modules/02-character-is-formed-under-pressure.md",
  "modules/03-be-faithful-with-what-you-have.md",
  "modules/04-discover-and-develop-your-gifts.md",
  "modules/05-learn-to-lead-with-people.md",
  "modules/06-lead-from-a-deepening-life-with-god.md",
];

const introductionFile = "COURSE-INTRODUCTION.md";

{
  const source = await readFile(resolve(courseRoot, introductionFile), "utf8");
  let majorSection = 0;
  let nestedSection = 0;

  const numbered = source
    .split("\n")
    .map((line) => {
      const majorHeading = line.match(/^##\s+(?:I\.\d+(?:\.\d+)*\s+)?(.+)$/);
      if (majorHeading) {
        majorSection += 1;
        nestedSection = 0;
        return `## I.${majorSection} ${majorHeading[1]}`;
      }

      const nestedHeading = line.match(/^###\s+(?:I\.\d+(?:\.\d+)*\s+)?(.+)$/);
      if (nestedHeading) {
        nestedSection += 1;
        return `### I.${majorSection}.${nestedSection} ${nestedHeading[1]}`;
      }

      return line;
    })
    .join("\n");

  await writeFile(resolve(courseRoot, introductionFile), numbered, "utf8");
}

for (const [index, file] of moduleFiles.entries()) {
  const moduleNumber = index + 1;
  const source = await readFile(resolve(courseRoot, file), "utf8");
  let majorSection = 0;
  let nestedSection = 0;

  const numbered = source
    .split("\n")
    .map((line) => {
      const majorHeading = line.match(/^##\s+(?:(?:\d+\.)+\d+\s+)?(.+)$/);
      if (majorHeading) {
        majorSection += 1;
        nestedSection = 0;
        return `## ${moduleNumber}.${majorSection} ${majorHeading[1]}`;
      }

      const nestedHeading = line.match(/^###\s+(?:(?:\d+\.)+\d+\s+)?(.+)$/);
      if (nestedHeading) {
        nestedSection += 1;
        return `### ${moduleNumber}.${majorSection}.${nestedSection} ${nestedHeading[1]}`;
      }

      return line;
    })
    .join("\n");

  await writeFile(resolve(courseRoot, file), numbered, "utf8");
}

console.log(`Numbered the introduction and ${moduleFiles.length} module files.`);
