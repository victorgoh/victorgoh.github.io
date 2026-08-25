import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const courseRoot = resolve(scriptDirectory, "..");
const dataDirectory = resolve(courseRoot, "public", "data");
const rootDataDirectory = resolve(courseRoot, "data");

const modules = [
  {
    id: "module-1",
    file: "modules/01-god-uses-your-story.md",
    label: "God Uses Your Story",
    moduleNumber: 1,
  },
  {
    id: "module-2",
    file: "modules/02-character-is-formed-under-pressure.md",
    label: "God Forms Your Character",
    moduleNumber: 2,
  },
  {
    id: "module-3",
    file: "modules/03-be-faithful-with-what-you-have.md",
    label: "God Builds Your Faithfulness",
    moduleNumber: 3,
  },
  {
    id: "module-4",
    file: "modules/04-discover-and-develop-your-gifts.md",
    label: "God Develops Your Gifts",
    moduleNumber: 4,
  },
  {
    id: "module-5",
    file: "modules/05-learn-to-lead-with-people.md",
    label: "God Shapes How You Lead People",
    moduleNumber: 5,
  },
  {
    id: "module-6",
    file: "modules/06-lead-from-a-deepening-life-with-god.md",
    label: "God Deepens Your Life With Him",
    moduleNumber: 6,
  },
];

function splitModule(markdown, file) {
  const divider = /\n---\n\n(?=# Facilitator guide\s*$)/m;
  const parts = markdown.split(divider);
  if (parts.length !== 2) {
    throw new Error(`Expected participant and facilitator sections in ${file}`);
  }
  return { participant: parts[0].trimEnd(), facilitator: parts[1].trim() };
}

await mkdir(dataDirectory, { recursive: true });
await mkdir(rootDataDirectory, { recursive: true });

const introduction = await readFile(resolve(courseRoot, "COURSE-INTRODUCTION.md"), "utf8");
const moduleSources = await Promise.all(
  modules.map(async (module) => ({
    ...module,
    ...splitModule(await readFile(resolve(courseRoot, module.file), "utf8"), module.file),
  })),
);

const documents = [
  {
    id: "course-introduction",
    file: "COURSE-INTRODUCTION.md",
    label: "Welcome to Growing Leaders",
    shortLabel: "Introduction",
    kind: "introduction",
    markdown: introduction,
  },
  ...moduleSources.map((module) => ({
    id: module.id,
    file: module.file,
    label: module.label,
    shortLabel: `Module ${module.moduleNumber}`,
    kind: "module",
    moduleNumber: module.moduleNumber,
    markdown: module.participant,
  })),
  ...moduleSources.map((module) => ({
    id: `facilitator-${module.moduleNumber}`,
    file: `${module.file}#facilitator-guide`,
    label: module.label,
    shortLabel: `Module ${module.moduleNumber} Guide`,
    kind: "facilitator",
    moduleNumber: module.moduleNumber,
    markdown: module.facilitator,
  })),
];

const coursePayload = `${JSON.stringify({ title: "Growing Leaders: From Foundations to Maturity", documents }, null, 2)}\n`;

await writeFile(resolve(dataDirectory, "course.json"), coursePayload, "utf8");
await writeFile(resolve(rootDataDirectory, "course.json"), coursePayload, "utf8");

console.log(`Synced ${modules.length} Markdown modules into ${documents.length} website documents.`);
