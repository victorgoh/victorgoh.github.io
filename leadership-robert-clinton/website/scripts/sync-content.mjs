import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const websiteRoot = resolve(scriptDirectory, "..");
const courseRoot = resolve(websiteRoot, "..");
const dataDirectory = resolve(websiteRoot, "public", "data");
const assetDirectory = resolve(websiteRoot, "public", "assets");

const manifest = [
  {
    id: "course-introduction",
    file: "00-course-introduction.md",
    label: "Course Introduction",
    shortLabel: "Introduction",
    kind: "introduction",
  },
  {
    id: "session-1",
    file: "01-session-1-sovereign-foundations.md",
    label: "Understanding How Your Story Shapes Your Leadership",
    shortLabel: "Session 1",
    kind: "session",
    sessionNumber: 1,
  },
  {
    id: "session-2",
    file: "02-session-2-inner-life-growth.md",
    label: "Building Character Before Influence",
    shortLabel: "Session 2",
    kind: "session",
    sessionNumber: 2,
  },
  {
    id: "session-3",
    file: "03-session-3-ministry-tasks.md",
    label: "Learning Faithfulness Through Service",
    shortLabel: "Session 3",
    kind: "session",
    sessionNumber: 3,
  },
  {
    id: "session-4",
    file: "04-session-4-giftedness.md",
    label: "Discovering and Developing Your Gifts",
    shortLabel: "Session 4",
    kind: "session",
    sessionNumber: 4,
  },
  {
    id: "session-5",
    file: "05-session-5-relationships-and-authority.md",
    label: "Leading Through Conflict and Relationships",
    shortLabel: "Session 5",
    kind: "session",
    sessionNumber: 5,
  },
  {
    id: "session-6",
    file: "06-session-6-life-maturing.md",
    label: "Leading From Spiritual Depth",
    shortLabel: "Session 6",
    kind: "session",
    sessionNumber: 6,
  },
  {
    id: "facilitator-guide",
    file: "07-facilitator-guide.md",
    label: "Facilitator Guide for the Six Group Sessions",
    shortLabel: "Facilitator Guide",
    kind: "facilitator",
  },
];

const imageFiles = [
  "01-six-phase-lifetime.svg",
  "01-six-phase-lifetime.png",
  "02-course-coverage-map.svg",
  "02-course-coverage-map.png",
  "03-formation-pathway.svg",
  "03-formation-pathway.png",
  "04-testing-expansion-cycle.svg",
  "04-testing-expansion-cycle.png",
  "05-ministry-task-continuum.svg",
  "05-ministry-task-continuum.png",
  "06-giftedness-development.svg",
  "06-giftedness-development.png",
  "07-backlash-cycle.svg",
  "07-backlash-cycle.png",
  "08-being-doing-spiral.svg",
  "08-being-doing-spiral.png",
];

function removeFrontmatter(markdown) {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
}

await mkdir(dataDirectory, { recursive: true });
await mkdir(assetDirectory, { recursive: true });

const documents = await Promise.all(
  manifest.map(async (item) => ({
    ...item,
    markdown: removeFrontmatter(
      await readFile(resolve(courseRoot, item.file), "utf8"),
    ),
  })),
);

await writeFile(
  resolve(dataDirectory, "course.json"),
  `${JSON.stringify({ title: "How God Develops Leaders", documents }, null, 2)}\n`,
  "utf8",
);

await Promise.all(
  imageFiles.map((file) =>
    copyFile(
      resolve(courseRoot, "assets", file),
      resolve(assetDirectory, file),
    ),
  ),
);

console.log(`Synced ${documents.length} course documents and ${imageFiles.length} diagrams.`);
