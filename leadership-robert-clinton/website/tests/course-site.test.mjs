import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("exports the course shell and course data", async () => {
  const [html, rawData] = await Promise.all([
    readFile(new URL("dist/client/index.html", root), "utf8"),
    readFile(new URL("dist/client/data/course.json", root), "utf8"),
  ]);
  const data = JSON.parse(rawData);
  const facilitatorGuide = data.documents.find((item) => item.kind === "facilitator");

  assert.match(html, /<title>How God Develops Leaders<\/title>/i);
  assert.match(html, /og\.png/);
  assert.equal(data.title, "How God Develops Leaders");
  assert.equal(data.documents.length, 8);
  assert.equal(data.documents.filter((item) => item.kind === "session").length, 6);
  assert.ok(data.documents.every((item) => item.markdown.length > 500));
  const introduction = data.documents.find((item) => item.kind === "introduction");
  assert.equal((introduction.markdown.match(/^## I\.\d+ /gm) || []).length, 12);
  assert.match(introduction.markdown, /^## I\.1 Welcome to/m);
  assert.match(introduction.markdown, /^## I\.12 Source and Further Reading/m);
  assert.ok(
    data.documents
      .filter((item) => item.kind === "session")
      .every((item) => item.markdown.includes("### Session at a Glance")),
  );
  assert.ok(
    data.documents
      .filter((item) => item.kind === "session")
      .every(
        (item) =>
          item.markdown.includes("**Individual study before the meeting:**") &&
          item.markdown.includes("**Group session:**") &&
          item.markdown.includes("**Practice after the meeting:**") &&
          /\*\*Core exercise \d+\.\d+:\*\*/.test(item.markdown) &&
          /\*\*Go Deeper \d+\.\d+:\*\*/.test(item.markdown) &&
          new RegExp(`^### ${item.sessionNumber}\\.1 `, "m").test(item.markdown),
      ),
  );
  assert.ok(
    data.documents
      .filter((item) => item.kind === "session")
      .every((item) => !item.markdown.includes("## Part 3:")),
  );
  assert.ok(
    data.documents
      .filter((item) => item.kind === "session")
      .every(
        (item) =>
          item.markdown.includes("## Learn, Reflect and Apply") &&
          !item.markdown.includes("## Part 1:") &&
          !item.markdown.includes("## Part 2:"),
      ),
  );
  assert.equal((facilitatorGuide.markdown.match(/^## Session \d:/gm) || []).length, 6);
  assert.equal((facilitatorGuide.markdown.match(/\*\*Participant-session links:\*\*/g) || []).length, 6);
  assert.equal((facilitatorGuide.markdown.match(/\| Reference \| Material \| Group use \|/g) || []).length, 6);
  assert.equal((facilitatorGuide.markdown.match(/^### Discussion Questions \(DQ1–DQ[56]\)$/gm) || []).length, 6);
  assert.match(facilitatorGuide.markdown, /Suggested Group Plan/);
  assert.match(facilitatorGuide.markdown, /explore Phases V and VI to Clinton's original work/);
  assert.doesNotMatch(facilitatorGuide.markdown, /Reserve Phases V and VI/);
  assert.doesNotMatch(facilitatorGuide.markdown, /Part 1|Part 2/);
});

test("includes local answers, printing and fillable tables", async () => {
  const [app, css] = await Promise.all([
    readFile(new URL("app/course-app.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);

  assert.match(app, /window\.localStorage/);
  assert.doesNotMatch(app, /course-answer-change/);
  assert.doesNotMatch(app, /className="save-status"/);
  assert.match(app, /function openSettings\(\) \{\s*const count = answerCount\(\)/);
  assert.match(app, /window\.print\(\)/);
  assert.match(app, /turn off Headers and footers/);
  assert.doesNotMatch(app, /className="print-footer"/);
  assert.match(app, /targetId\.startsWith\(`\$\{item\.id\}--`\)/);
  assert.match(app, /linkedFile\.endsWith\("\.md"\)/);
  assert.match(app, /withoutSectionReference/);
  assert.match(app, /className="section-permalink"/);
  assert.match(app, /data-section-title/);
  assert.match(app, /stableFieldId\(document\.markdown, line, "table", column\)/);
  assert.match(app, /`\$\{document\.id\}:table:\$\{line\}:\$\{column\}`/);
  assert.match(app, /View larger/);
  assert.match(app, /role="dialog"/);
  assert.match(css, /@media print/);
  assert.match(css, /\.site-header,\s*\n\s*\.skip-link,/);
  assert.doesNotMatch(css, /counter\(page\)/);
  assert.match(css, /\.diagram-overlay/);
  assert.match(css, /\.print-answer/);
  assert.match(css, /\.print-blank \.print-answer/);
  assert.match(app, /Print without responses/);
  assert.doesNotMatch(app, /blank workbook/i);
});

test("provides a guarded Settings reset for corrupted browser storage", async () => {
  const [app, css] = await Promise.all([
    readFile(new URL("app/course-app.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);

  assert.match(app, /Manage saved data/);
  assert.match(app, /window\.localStorage\.clear\(\)/);
  assert.match(app, /Yes, clear all local storage/);
  assert.match(app, /The lesson content is stored separately/);
  assert.match(app, /key=\{`\$\{activeDocument\.id\}:\$\{resetRevision\}`\}/);
  assert.match(css, /\.settings-overlay/);
  assert.match(css, /\.danger-button/);
});

test("protects saved work across content updates and storage failures", async () => {
  const app = await readFile(new URL("app/course-app.tsx", root), "utf8");

  assert.match(app, /how-god-develops-leaders`:v2|storageNamespace = "how-god-develops-leaders"/);
  assert.match(app, /legacyStoragePrefix/);
  assert.match(app, /safeStorageGet/);
  assert.match(app, /safeStorageSet/);
  assert.match(app, /stableFieldId/);
  assert.match(app, /Download backup/);
  assert.match(app, /Restore backup/);
  assert.match(app, /storageVersion: 2/);
});

test("includes accessible navigation, progress, reading and offline support", async () => {
  const [app, css, worker] = await Promise.all([
    readFile(new URL("app/course-app.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
    readFile(new URL("public/sw.js", root), "utf8"),
  ]);

  assert.match(app, /Skip to lesson content/);
  assert.match(app, /aria-label=\{menuOpen \? "Close course contents" : "Open course contents"\}/);
  assert.match(app, /aria-label="Print this document"/);
  assert.match(app, /Continue where you left off/);
  assert.match(app, /Mark session complete/);
  assert.match(app, /Session complete/);
  assert.match(app, /aria-label="Session progress"/);
  assert.match(app, /In this session/);
  assert.match(app, /Participant course/);
  assert.match(app, /Facilitator resources/);
  assert.match(app, /nav-complete/);
  assert.match(app, /exercise-marker--/);
  assert.match(app, /Use more line spacing/);
  assert.match(css, /min-width: 44px/);
  assert.match(css, /\.session-sections/);
  assert.match(css, /\.exercise-marker--core/);
  assert.match(css, /\.exercise-marker--deeper/);
  assert.match(css, /\.section-permalink/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(worker, /how-god-develops-leaders-v7/);
  assert.match(worker, /data\/course\.json/);
  assert.match(worker, /06-giftedness-development\.svg/);
});
