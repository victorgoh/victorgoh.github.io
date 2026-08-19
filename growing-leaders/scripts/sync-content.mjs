import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const courseRoot = resolve(scriptDirectory, "..");
const dataDirectory = resolve(courseRoot, "public", "data");

const sessions = [
  {
    id: "session-1",
    file: "sessions/01-god-uses-your-story.md",
    label: "God Uses Your Story",
    sessionNumber: 1,
  },
  {
    id: "session-2",
    file: "sessions/02-character-is-formed-under-pressure.md",
    label: "God Forms Your Character",
    sessionNumber: 2,
  },
  {
    id: "session-3",
    file: "sessions/03-be-faithful-with-what-you-have.md",
    label: "God Builds Your Faithfulness",
    sessionNumber: 3,
  },
  {
    id: "session-4",
    file: "sessions/04-discover-and-develop-your-gifts.md",
    label: "God Develops Your Gifts",
    sessionNumber: 4,
  },
  {
    id: "session-5",
    file: "sessions/05-learn-to-lead-with-people.md",
    label: "God Shapes How You Lead People",
    sessionNumber: 5,
  },
  {
    id: "session-6",
    file: "sessions/06-lead-from-a-deepening-life-with-god.md",
    label: "God Deepens Your Life With Him",
    sessionNumber: 6,
  },
];

function splitSession(markdown, file) {
  const divider = /\n---\n\n(?=# Facilitator guide\s*$)/m;
  const parts = markdown.split(divider);
  if (parts.length !== 2) {
    throw new Error(`Expected participant and facilitator sections in ${file}`);
  }
  return { participant: parts[0].trimEnd(), facilitator: parts[1].trim() };
}

await mkdir(dataDirectory, { recursive: true });

const introduction = await readFile(resolve(courseRoot, "COURSE-INTRODUCTION.md"), "utf8");
const sessionSources = await Promise.all(
  sessions.map(async (session) => ({
    ...session,
    ...splitSession(await readFile(resolve(courseRoot, session.file), "utf8"), session.file),
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
  ...sessionSources.map((session) => ({
    id: session.id,
    file: session.file,
    label: session.label,
    shortLabel: `Session ${session.sessionNumber}`,
    kind: "session",
    sessionNumber: session.sessionNumber,
    markdown: session.participant,
  })),
  ...sessionSources.map((session) => ({
    id: `facilitator-${session.sessionNumber}`,
    file: `${session.file}#facilitator-guide`,
    label: session.label,
    shortLabel: `Session ${session.sessionNumber} Guide`,
    kind: "facilitator",
    sessionNumber: session.sessionNumber,
    markdown: session.facilitator,
  })),
];

await writeFile(
  resolve(dataDirectory, "course.json"),
  `${JSON.stringify({ title: "How God Develops Leaders", documents }, null, 2)}\n`,
  "utf8",
);

console.log(`Synced ${sessions.length} Markdown sessions into ${documents.length} website documents.`);
