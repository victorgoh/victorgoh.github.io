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

// 1. Complete Course
const introduction = await readFile(resolve(courseRoot, "COURSE-INTRODUCTION.md"), "utf8");
const moduleSources = await Promise.all(
  modules.map(async (module) => ({
    ...module,
    ...splitModule(await readFile(resolve(courseRoot, module.file), "utf8"), module.file),
  })),
);

const completeDocuments = [
  {
    id: "course-introduction",
    file: "COURSE-INTRODUCTION.md",
    label: "Welcome to Growing Leaders",
    shortLabel: "Introduction",
    kind: "introduction",
    edition: "complete",
    markdown: introduction,
  },
  ...moduleSources.map((module) => ({
    id: module.id,
    file: module.file,
    label: module.label,
    shortLabel: `Module ${module.moduleNumber}`,
    kind: "module",
    edition: "complete",
    moduleNumber: module.moduleNumber,
    markdown: module.participant,
  })),
  ...moduleSources.map((module) => ({
    id: `facilitator-${module.moduleNumber}`,
    file: `${module.file}#facilitator-guide`,
    label: module.label,
    shortLabel: `Module ${module.moduleNumber} Guide`,
    kind: "facilitator",
    edition: "complete",
    moduleNumber: module.moduleNumber,
    markdown: module.facilitator,
  })),
];

// 2. Everyday Edition
const everydaySource = await readFile(resolve(courseRoot, "GROWING-LEADERS-EVERYDAY-EDITION.md"), "utf8");
const everydaySections = everydaySource.split(/\n---\n\n(?=# Module \d+:)/);
const everydayIntro = everydaySections[0].trim();
const everydayModules = everydaySections.slice(1).map((sec, index) => {
  const modNum = index + 1;
  const modLabel = modules[index]?.label ?? `Module ${modNum}`;
  const split = splitModule(sec, `GROWING-LEADERS-EVERYDAY-EDITION.md Module ${modNum}`);
  return {
    moduleNumber: modNum,
    label: modLabel,
    participant: split.participant,
    facilitator: split.facilitator,
  };
});

const everydayDocuments = [
  {
    id: "everyday-introduction",
    file: "GROWING-LEADERS-EVERYDAY-EDITION.md#course-introduction",
    label: "Introduction (Everyday Edition)",
    shortLabel: "Introduction",
    kind: "introduction",
    edition: "everyday",
    markdown: everydayIntro,
  },
  ...everydayModules.map((module) => ({
    id: `everyday-module-${module.moduleNumber}`,
    file: `GROWING-LEADERS-EVERYDAY-EDITION.md#module-${module.moduleNumber}`,
    label: module.label,
    shortLabel: `Module ${module.moduleNumber}`,
    kind: "module",
    edition: "everyday",
    moduleNumber: module.moduleNumber,
    markdown: module.participant,
  })),
  ...everydayModules.map((module) => ({
    id: `everyday-facilitator-${module.moduleNumber}`,
    file: `GROWING-LEADERS-EVERYDAY-EDITION.md#module-${module.moduleNumber}-facilitator-guide`,
    label: module.label,
    shortLabel: `Module ${module.moduleNumber} Guide`,
    kind: "facilitator",
    edition: "everyday",
    moduleNumber: module.moduleNumber,
    markdown: module.facilitator,
  })),
];

// 3. Essentials Edition
const essentialsSource = await readFile(resolve(courseRoot, "GROWING-LEADERS-ESSENTIALS.md"), "utf8");
const essentialsSections = essentialsSource.split(/\n---\n\n(?=# Session \d+:)/);
const essentialsIntro = essentialsSections[0].trim();
const essentialsModules = essentialsSections.slice(1).map((sec, index) => {
  const modNum = index + 1;
  const modLabel = modules[index]?.label ?? `Session ${modNum}`;
  const split = splitModule(sec, `GROWING-LEADERS-ESSENTIALS.md Session ${modNum}`);
  return {
    moduleNumber: modNum,
    label: modLabel,
    participant: split.participant,
    facilitator: split.facilitator,
  };
});

const essentialsDocuments = [
  {
    id: "essentials-introduction",
    file: "GROWING-LEADERS-ESSENTIALS.md#course-introduction",
    label: "Introduction (Essentials Edition)",
    shortLabel: "Introduction",
    kind: "introduction",
    edition: "essentials",
    markdown: essentialsIntro,
  },
  ...essentialsModules.map((module) => ({
    id: `essentials-session-${module.moduleNumber}`,
    file: `GROWING-LEADERS-ESSENTIALS.md#session-${module.moduleNumber}`,
    label: module.label,
    shortLabel: `Session ${module.moduleNumber}`,
    kind: "session",
    edition: "essentials",
    moduleNumber: module.moduleNumber,
    sessionNumber: module.moduleNumber,
    markdown: module.participant,
  })),
  ...essentialsModules.map((module) => ({
    id: `essentials-facilitator-${module.moduleNumber}`,
    file: `GROWING-LEADERS-ESSENTIALS.md#session-${module.moduleNumber}-facilitator-guide`,
    label: module.label,
    shortLabel: `Session ${module.moduleNumber} Guide`,
    kind: "facilitator",
    edition: "essentials",
    moduleNumber: module.moduleNumber,
    sessionNumber: module.moduleNumber,
    markdown: module.facilitator,
  })),
];

const allDocuments = [...completeDocuments, ...everydayDocuments, ...essentialsDocuments];

const coursePayload = `${JSON.stringify(
  {
    title: "Growing Leaders: From Foundations to Maturity",
    documents: allDocuments,
  },
  null,
  2,
)}\n`;

await writeFile(resolve(dataDirectory, "course.json"), coursePayload, "utf8");
await writeFile(resolve(rootDataDirectory, "course.json"), coursePayload, "utf8");

console.log(
  `Synced ${allDocuments.length} total documents (Complete: ${completeDocuments.length}, Everyday: ${everydayDocuments.length}, Essentials: ${essentialsDocuments.length}).`,
);
