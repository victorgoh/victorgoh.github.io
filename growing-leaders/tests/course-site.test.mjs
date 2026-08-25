import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("builds the course shell with Complete, Everyday, and Essentials editions", async () => {
  const [html, rawData] = await Promise.all([
    readFile(new URL("dist/client/index.html", root), "utf8"),
    readFile(new URL("dist/client/data/course.json", root), "utf8"),
  ]);
  const data = JSON.parse(rawData);

  assert.match(html, /<title>Growing Leaders: From Foundations to Maturity<\/title>/i);
  assert.equal(data.title, "Growing Leaders: From Foundations to Maturity");
  assert.equal(data.documents.length, 39);

  const completeDocs = data.documents.filter((item) => item.edition === "complete");
  const everydayDocs = data.documents.filter((item) => item.edition === "everyday");
  const essentialsDocs = data.documents.filter((item) => item.edition === "essentials");

  assert.equal(completeDocs.length, 13);
  assert.equal(everydayDocs.length, 13);
  assert.equal(essentialsDocs.length, 13);

  // Complete course modules
  assert.equal(completeDocs.filter((item) => item.kind === "module").length, 6);
  assert.equal(completeDocs.filter((item) => item.kind === "facilitator").length, 6);
  assert.deepEqual(
    completeDocs.filter((item) => item.kind === "module").map((item) => item.label),
    [
      "God Uses Your Story",
      "God Forms Your Character",
      "God Builds Your Faithfulness",
      "God Develops Your Gifts",
      "God Shapes How You Lead People",
      "God Deepens Your Life With Him",
    ],
  );

  // Everyday edition modules & facilitator guides
  assert.equal(everydayDocs.filter((item) => item.kind === "module").length, 6);
  assert.equal(everydayDocs.filter((item) => item.kind === "facilitator").length, 6);

  // Essentials edition modules & facilitator guides
  assert.equal(essentialsDocs.filter((item) => item.kind === "module").length, 6);
  assert.equal(essentialsDocs.filter((item) => item.kind === "facilitator").length, 6);

  assert.ok(data.documents.every((item) => item.markdown.length > 500));
  assert.match(
    completeDocs.find((item) => item.id === "course-introduction").markdown,
    /^## I\.1 Welcome to the journey/m,
  );
  assert.match(
    everydayDocs.find((item) => item.id === "everyday-introduction").markdown,
    /^## I\.1 Welcome to the Journey/m,
  );
  assert.match(
    essentialsDocs.find((item) => item.id === "essentials-introduction").markdown,
    /^## Welcome to the Journey/m,
  );
});

test("keeps the Markdown files as the content source for all editions", async () => {
  const [rawData, completeIntro] = await Promise.all([
    readFile(new URL("dist/client/data/course.json", root), "utf8"),
    readFile(new URL("COURSE-INTRODUCTION.md", root), "utf8"),
  ]);
  const data = JSON.parse(rawData);

  assert.equal(
    data.documents.find((item) => item.id === "course-introduction").markdown,
    completeIntro,
  );
  assert.ok(data.documents.some((item) => item.id === "everyday-module-1"));
  assert.ok(data.documents.some((item) => item.id === "everyday-facilitator-1"));
  assert.ok(data.documents.some((item) => item.id === "essentials-module-1"));
  assert.ok(data.documents.some((item) => item.id === "essentials-facilitator-1"));
});

test("includes local responses, edition switching, progress, printing, and accessible navigation", async () => {
  const [app, css, worker] = await Promise.all([
    readFile(new URL("app/course-app.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
    readFile(new URL("public/sw.js", root), "utf8"),
  ]);

  assert.match(app, /window\.localStorage/);
  assert.match(app, /window\.print\(\)/);
  assert.match(app, /Mark [Mm]odule [Cc]omplete/);
  assert.match(app, /Skip to lesson content/);
  assert.match(app, /Participant course/);
  assert.match(app, /Facilitator resources/);
  assert.match(app, /Course Edition/);
  assert.match(app, /EDITIONS/);
  assert.match(app, /Settings/);
  assert.match(app, /bible-settings-title/);
  assert.match(css, /@media print/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /\.edition-tabs/);
  assert.match(css, /\.edition-tab/);
  assert.match(css, /\.bible-ref-link/);
  assert.match(css, /\.onboarding-overlay/);
  assert.match(css, /\.onboarding-dialog/);
  assert.match(css, /\.copy-notes-btn/);
  assert.match(worker, /data\/course\.json/);
});

test("supports Bible translation selection and deep linking to Bible.com", async () => {
  const bibleUrlContent = await readFile(new URL("app/bible-url.tsx", root), "utf8");

  assert.match(bibleUrlContent, /BSB: \{/);
  assert.match(bibleUrlContent, /ESV: \{/);
  assert.match(bibleUrlContent, /CSB: \{/);
  assert.match(bibleUrlContent, /NIV: \{/);
  assert.match(bibleUrlContent, /NLT: \{/);
  assert.match(bibleUrlContent, /NKJV: \{/);
  assert.match(bibleUrlContent, /NASB2020: \{/);
  assert.match(bibleUrlContent, /MSG: \{/);
  assert.match(bibleUrlContent, /NRSVUE: \{/);
  assert.match(bibleUrlContent, /AMP: \{/);
  assert.match(bibleUrlContent, /https:\/\/www\.bible\.com\/bible\//);
  assert.match(bibleUrlContent, /function parseBibleReference/);
  assert.match(bibleUrlContent, /function buildBibleComUrl/);
  assert.match(bibleUrlContent, /function enhanceWithBibleLinks/);
});
