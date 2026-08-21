import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("builds the course shell from the Markdown sources", async () => {
  const [html, rawData] = await Promise.all([
    readFile(new URL("dist/client/index.html", root), "utf8"),
    readFile(new URL("dist/client/data/course.json", root), "utf8"),
  ]);
  const data = JSON.parse(rawData);

  assert.match(html, /<title>How God Develops Leaders<\/title>/i);
  assert.equal(data.title, "How God Develops Leaders");
  assert.equal(data.documents.length, 13);
  assert.equal(data.documents.filter((item) => item.kind === "module").length, 6);
  assert.equal(data.documents.filter((item) => item.kind === "facilitator").length, 6);
  assert.deepEqual(
    data.documents.filter((item) => item.kind === "module").map((item) => item.label),
    [
      "God Uses Your Story",
      "God Forms Your Character",
      "God Builds Your Faithfulness",
      "God Develops Your Gifts",
      "God Shapes How You Lead People",
      "God Deepens Your Life With Him",
    ],
  );
  assert.deepEqual(
    data.documents
      .filter((item) => item.kind === "module")
      .map((item) => item.markdown.match(/> \*\*Leadership habit:\*\* (.+)/)?.[1]),
    [
      "Notice and Learn",
      "Pause and Bring It Before God",
      "Record and Follow Through",
      "Serve, Notice, Ask",
      "Listen Before Responding",
      "Abide and Review",
    ],
  );
  assert.ok(data.documents.every((item) => item.markdown.length > 500));
  assert.match(
    data.documents.find((item) => item.id === "course-introduction").markdown,
    /^## I\.1 Welcome to the journey/m,
  );
  assert.match(
    data.documents.find((item) => item.id === "course-introduction").markdown,
    /^### I\.3\.1 Head:/m,
  );
  assert.match(
    data.documents.find((item) => item.id === "course-introduction").markdown,
    /^### I\.5\.1 Bring It Before God/m,
  );
  assert.match(
    data.documents.find((item) => item.id === "module-2").markdown,
    /Let God’s Word shape you/,
  );
  assert.ok(
    data.documents
      .filter((item) => item.kind === "module")
      .every((item) => !item.markdown.includes("# Facilitator guide")),
  );
  assert.ok(
    data.documents
      .filter((item) => item.kind === "module")
      .every(
        (item) =>
          new RegExp(`^## ${item.moduleNumber}\\.1 `, "m").test(item.markdown) &&
          new RegExp(`^### ${item.moduleNumber}\\.\\d+\\.1 `, "m").test(item.markdown),
      ),
  );
  assert.ok(
    data.documents
      .filter((item) => item.kind === "facilitator")
      .every((item) => item.markdown.startsWith("# Facilitator guide")),
  );
});

test("keeps the Markdown files as the content source", async () => {
  const [rawData, introduction, moduleTwo] = await Promise.all([
    readFile(new URL("dist/client/data/course.json", root), "utf8"),
    readFile(new URL("COURSE-INTRODUCTION.md", root), "utf8"),
    readFile(new URL("modules/02-character-is-formed-under-pressure.md", root), "utf8"),
  ]);
  const data = JSON.parse(rawData);
  const divider = /\n---\n\n(?=# Facilitator guide\s*$)/m;
  const [participant, facilitator] = moduleTwo.split(divider);

  assert.equal(
    data.documents.find((item) => item.id === "course-introduction").markdown,
    introduction,
  );
  assert.equal(
    data.documents.find((item) => item.id === "module-2").markdown,
    participant.trimEnd(),
  );
  assert.equal(
    data.documents.find((item) => item.id === "facilitator-2").markdown,
    facilitator.trim(),
  );
});

test("includes local responses, progress, printing, and accessible navigation", async () => {
  const [app, css, worker] = await Promise.all([
    readFile(new URL("app/course-app.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
    readFile(new URL("public/sw.js", root), "utf8"),
  ]);

  assert.match(app, /window\.localStorage/);
  assert.match(app, /window\.print\(\)/);
  assert.match(app, /Mark module complete/);
  assert.match(app, /Skip to lesson content/);
  assert.match(app, /Participant course/);
  assert.match(app, /Facilitator resources/);
  assert.match(css, /@media print/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(worker, /data\/course\.json/);
});
