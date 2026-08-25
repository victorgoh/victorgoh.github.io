"use client";

import React, {
  Children,
  ReactNode,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BIBLE_TRANSLATIONS,
  DEFAULT_BIBLE_TRANSLATION,
  SUPPORTED_TRANSLATION_KEYS,
  SupportedBibleTranslation,
  enhanceWithBibleLinks,
} from "./bible-url";

type CourseEdition = "everyday" | "essentials" | "complete";

type CourseDocument = {
  id: string;
  file: string;
  label: string;
  shortLabel: string;
  kind: "introduction" | "module" | "facilitator" | "session";
  edition?: CourseEdition;
  moduleNumber?: number;
  sessionNumber?: number;
  markdown: string;
};

type CourseData = {
  title: string;
  documents: CourseDocument[];
};

const EDITIONS: { id: CourseEdition; label: string; tag: string; description: string; icon: string }[] = [
  {
    id: "everyday",
    label: "Everyday Edition",
    tag: "Practical & Grounded",
    description: "Relatable workplace, family, and ministry scenarios with 60-min group plans",
    icon: "☕",
  },
  {
    id: "essentials",
    label: "Essentials Edition",
    tag: "Fast-Track Basics",
    description: "Concise, accessible format focusing on core principles and fast-track modules",
    icon: "⚡",
  },
  {
    id: "complete",
    label: "Complete Course",
    tag: "In-Depth Study",
    description: "Comprehensive foundation with extensive biblical exegesis and theological depth",
    icon: "📚",
  },
];

function documentEdition(doc?: CourseDocument): CourseEdition {
  if (doc?.edition) return doc.edition;
  if (doc?.id.startsWith("everyday-")) return "everyday";
  if (doc?.id.startsWith("essentials-")) return "essentials";
  return "complete";
}

function findTargetInEdition(
  allDocs: CourseDocument[],
  targetEdition: CourseEdition,
  currentDoc: CourseDocument,
): CourseDocument {
  const targetDocs = allDocs.filter((d) => documentEdition(d) === targetEdition);
  if (currentDoc.kind === "introduction") {
    return targetDocs.find((d) => d.kind === "introduction") || targetDocs[0];
  }
  const modNum = currentDoc.moduleNumber || currentDoc.sessionNumber;
  if (currentDoc.kind === "facilitator") {
    const match = targetDocs.find(
      (d) => d.kind === "facilitator" && (d.moduleNumber === modNum || d.sessionNumber === modNum),
    );
    if (match) return match;
  } else {
    const match = targetDocs.find(
      (d) => d.kind !== "facilitator" && (d.moduleNumber === modNum || d.sessionNumber === modNum),
    );
    if (match) return match;
  }
  return targetDocs[0];
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const storageNamespace = "growing-leaders-course";
const storagePrefix = `${storageNamespace}:v2`;
const legacyStoragePrefix = `${storageNamespace}:v1`;

type StorageIssueHandler = () => void;

type ResumePoint = {
  documentId: string;
  targetId: string;
  title: string;
};

function isCourseModule(document?: CourseDocument) {
  return document?.kind === "module" || document?.kind === "session";
}

type GTagFunction = (...args: unknown[]) => void;

function trackGAEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    const gtag = (window as unknown as { gtag?: GTagFunction }).gtag;
    if (typeof gtag === "function") {
      gtag("event", eventName, params);
    }
  }
}

function activeDocumentIsNotModule(data: CourseData, activeId: string) {
  const doc = data.documents.find((document) => document.id === activeId);
  return !isCourseModule(doc);
}

function safeStorageGet(key: string) {
  try {
    return { value: window.localStorage.getItem(key), failed: false };
  } catch {
    return { value: null, failed: true };
  }
}

function safeStorageSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeStorageRemove(key: string) {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function stableFieldId(
  markdown: string,
  lineNumber: number,
  kind: "response" | "table" | "check",
  column = 0,
) {
  const lines = markdown.split(/\r?\n/);
  const currentIndex = Math.max(0, lineNumber - 1);
  let section = "general";
  let context = "response";

  for (let index = currentIndex; index >= 0; index -= 1) {
    const heading = lines[index]?.match(/^#{2,4}\s+(.+)$/);
    if (heading) {
      section = withoutSectionReference(plainText(heading[1]));
      break;
    }
  }

  if (kind === "table") {
    const cells = (lines[currentIndex] ?? "")
      .split("|")
      .map((cell) => plainText(cell))
      .filter(Boolean);
    context = cells[0] || `table-column-${column}`;
  } else {
    const contextParts: string[] = [];
    if (kind === "response") {
      const blockText: string[] = [];
      for (let index = currentIndex; index < lines.length; index += 1) {
        const source = lines[index] ?? "";
        if (!source.trim()) continue;
        if (!source.trimStart().startsWith(">")) break;
        const candidate = plainText(source.replace(/^\s*>\s?/, ""));
        if (candidate && !/^write your response here\.?$/i.test(candidate)) blockText.push(candidate);
      }
      const inlinePrompt = blockText.join(" ");
      if (inlinePrompt && !/^your response\b/i.test(inlinePrompt)) {
        context = inlinePrompt;
        return [kind, slugify(section), slugify(context)].join(":");
      }
    }
    for (let index = currentIndex; index >= 0; index -= 1) {
      if (kind === "response" && (lines[index] ?? "").trimStart().startsWith(">")) {
        continue;
      }
      const candidate = plainText(
        (lines[index] ?? "")
          .replace(/^>\s?/, "")
          .replace(/^[-*]\s+\[[ xX]\]\s*/, ""),
      );
      if (
        candidate &&
        !/^(your response|write your response here|enter response)$/i.test(candidate) &&
        !/^#{1,4}\s/.test(lines[index] ?? "")
      ) {
        contextParts.push(candidate);
        if (kind !== "response" || contextParts.length === 2) break;
      }
    }
    if (contextParts.length) context = contextParts.reverse().join(" ");
  }

  return [kind, slugify(section), slugify(context), column || ""].filter(Boolean).join(":");
}

function joinBasePath(path: string) {
  const normalizedBase = basePath.endsWith("/")
    ? basePath.slice(0, -1)
    : basePath;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function textFromChildren(value: ReactNode): string {
  return Children.toArray(value)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }
      if (isValidElement<{ children?: ReactNode }>(child)) {
        return textFromChildren(child.props.children);
      }
      return "";
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function plainText(markdown: string) {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .trim();
}

function slugify(value: string) {
  return plainText(value)
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function withoutSectionReference(value: string) {
  return value.replace(/^(?:I|\d+)\.\d+(?:\.\d+)*\s+/i, "");
}

function sectionId(documentId: string, title: string) {
  return `${documentId}--${slugify(withoutSectionReference(title))}`;
}

function moduleSections(document: CourseDocument) {
  return Array.from(document.markdown.matchAll(/^##\s+(.+)$/gm), (match) => ({
    title: plainText(match[1]),
    id: sectionId(document.id, match[1]),
  }));
}

function normalizeCourseHash(hash: string) {
  if (hash === "study-guide" || hash.startsWith("study-guide--")) {
    return "course-introduction";
  }
  if (hash.startsWith("essentials-session-")) {
    return hash.replace("essentials-session-", "essentials-module-");
  }
  if (/^(?:module|session)-\d+--part-(1-learn|2-reflect-and-apply)$/.test(hash)) {
    return hash.replace(/--part-(1-learn|2-reflect-and-apply)$/, "--learn-reflect-and-apply");
  }
  if (/^(?:module|session)-\d+--part-3-(facilitator-guide-for-the-group-meeting|lead-the-group-session)$/.test(hash)) {
    return "facilitator-guide";
  }
  return hash;
}

function useStoredValue(
  key: string,
  initialValue = "",
  legacyKey?: string | string[],
  onStorageIssue?: StorageIssueHandler,
) {
  const [initialStorage] = useState(() => {
    if (typeof window === "undefined") return initialValue;

    const current = safeStorageGet(key);
    if (current.failed) {
      return { value: initialValue, failed: true };
    }
    if (current.value !== null) return { value: current.value, failed: false };

    if (legacyKey) {
      for (const candidateKey of Array.isArray(legacyKey) ? legacyKey : [legacyKey]) {
        const legacy = safeStorageGet(candidateKey);
        if (legacy.failed) {
          return { value: initialValue, failed: true };
        }
        if (legacy.value !== null) {
          safeStorageSet(key, legacy.value);
          return { value: legacy.value, failed: false };
        }
      }
    }

    return { value: initialValue, failed: false };
  });
  const normalizedInitial = typeof initialStorage === "string"
    ? { value: initialStorage, failed: false }
    : initialStorage;
  const [value, setValue] = useState(normalizedInitial.value);

  useEffect(() => {
    if (normalizedInitial.failed) onStorageIssue?.();
  }, [normalizedInitial.failed, onStorageIssue]);

  function update(nextValue: string) {
    setValue(nextValue);
    if (!safeStorageSet(key, nextValue)) onStorageIssue?.();
  }

  return { value, update };
}

function AnswerField({
  storageId,
  legacyStorageId,
  compact = false,
  label = "Your response",
  onStorageIssue,
}: {
  storageId: string;
  legacyStorageId?: string | string[];
  compact?: boolean;
  label?: string;
  onStorageIssue?: StorageIssueHandler;
}) {
  const { value, update } = useStoredValue(
    `${storagePrefix}:answer:${storageId}`,
    "",
    legacyStorageId
      ? (Array.isArray(legacyStorageId) ? legacyStorageId : [legacyStorageId]).map(
          (id) => `${legacyStoragePrefix}:${id}`,
        )
      : undefined,
    onStorageIssue,
  );
  const inputId = `${storagePrefix}-${storageId}`.replace(/[^a-zA-Z0-9_-]/g, "-");

  return (
    <div className={`answer-field ${compact ? "answer-field--compact" : ""}`}>
      <label htmlFor={inputId}>{label}</label>
      <textarea
        id={inputId}
        rows={compact ? 2 : 6}
        value={value}
        onChange={(event) => update(event.target.value)}
        placeholder="Write your response here…"
      />
      <div
        className={`print-answer ${value ? "print-answer--filled" : ""}`}
        aria-hidden="true"
      >
        {value || " "}
      </div>
    </div>
  );
}

function SavedCheckbox({
  storageId,
  legacyStorageId,
  defaultChecked,
  label,
  onStorageIssue,
}: {
  storageId: string;
  legacyStorageId?: string | string[];
  defaultChecked?: boolean;
  label: string;
  onStorageIssue?: StorageIssueHandler;
}) {
  const key = `${storagePrefix}:answer:${storageId}`;
  const { value, update } = useStoredValue(
    key,
    defaultChecked ? "true" : "",
    legacyStorageId
      ? (Array.isArray(legacyStorageId) ? legacyStorageId : [legacyStorageId]).map(
          (id) => `${legacyStoragePrefix}:${id}`,
        )
      : undefined,
    onStorageIssue,
  );
  return (
    <input
      type="checkbox"
      checked={value === "true"}
      onChange={(event) => update(event.target.checked ? "true" : "")}
      aria-label={label}
    />
  );
}

function answerCount() {
  let count = 0;
  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (
        key?.startsWith(`${storagePrefix}:answer:`) &&
        window.localStorage.getItem(key)?.trim()
      ) {
        count += 1;
      }
    }
  } catch {
    return null;
  }
  return count;
}

function DiagramImage({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  return (
    <span className="diagram">
      <button
        ref={triggerRef}
        type="button"
        className="diagram-open"
        aria-label={`View larger: ${alt}`}
        onClick={() => setOpen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" />
        <span className="diagram-action">View larger</span>
      </button>
      {open && (
        <span
          className="diagram-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <span className="diagram-dialog">
            <button
              ref={closeRef}
              type="button"
              className="diagram-close"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} />
          </span>
        </span>
      )}
    </span>
  );
}

function CopyNotesButton({
  documentId,
  documentTitle,
}: {
  documentId: string;
  documentTitle: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const notes: string[] = [];
    try {
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(`${storagePrefix}:answer:${documentId}:`)) {
          const val = window.localStorage.getItem(key)?.trim();
          if (val) {
            notes.push(val);
          }
        }
      }
    } catch {
      // Ignore storage errors
    }

    const textToCopy =
      notes.length > 0
        ? `📝 Reflection Notes: ${documentTitle}\n\n` +
          notes.map((n) => `• ${n}`).join("\n\n")
        : `📝 ${documentTitle}\n\n(No responses written yet on this device.)`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      });
    }
  };

  return (
    <button
      type="button"
      className="copy-notes-btn"
      onClick={handleCopy}
      title="Copy your written notes for this module to clipboard"
    >
      <span aria-hidden="true">{copied ? "✓" : "📋"}</span>
      <span>{copied ? "Copied to clipboard!" : "Copy My Notes"}</span>
    </button>
  );
}

function CourseMarkdown({
  document,
  documents,
  onNavigate,
  onStorageIssue,
  moduleProgress,
  bibleTranslation = DEFAULT_BIBLE_TRANSLATION,
}: {
  document: CourseDocument;
  documents: CourseDocument[];
  onNavigate: (documentId: string, target?: string) => void;
  onStorageIssue?: StorageIssueHandler;
  moduleProgress?: ReactNode;
  bibleTranslation?: SupportedBibleTranslation;
}) {
  const heading = (level: 1 | 2 | 3 | 4) => {
    function Heading({ children }: { children?: ReactNode }) {
      const title = textFromChildren(children);
      const id = sectionId(document.id, title);
      const renderedHeading = React.createElement(
        `h${level}`,
        { id, className: "content-heading", "data-section-title": title },
        level >= 2 ? (
          <>
            <span>{enhanceWithBibleLinks(children, bibleTranslation)}</span>
            <a
              className="section-permalink"
              href={`#${id}`}
              aria-label={`Link to ${title}`}
              title="Link to this section"
            >
              <span aria-hidden="true">#</span>
            </a>
          </>
        ) : (
          enhanceWithBibleLinks(children, bibleTranslation)
        ),
      );
      const isReflectionHeading =
        (level === 3 || level === 2) &&
        (title.toLowerCase().includes("reflection notes") ||
          title.toLowerCase().includes("prepare to share") ||
          title.toLowerCase().includes("growth plan"));

      if (isReflectionHeading) {
        return (
          <div className="section-heading-wrap">
            {renderedHeading}
            <CopyNotesButton
              documentId={document.id}
              documentTitle={document.label}
            />
          </div>
        );
      }

      if (level === 2 && title === "Learn, Reflect and Apply" && moduleProgress) {
        return <>{renderedHeading}{moduleProgress}</>;
      }
      return renderedHeading;
    }
    Heading.displayName = `CourseHeading${level}`;
    return Heading;
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: heading(1),
        h2: heading(2),
        h3: heading(3),
        h4: heading(4),
        p({ children }) {
          return <p>{enhanceWithBibleLinks(children, bibleTranslation)}</p>;
        },
        li({ children }) {
          return <li>{enhanceWithBibleLinks(children, bibleTranslation)}</li>;
        },
        blockquote({ node, children }) {
          const text = textFromChildren(children);
          const exerciseType = /^Core exercise(?: \d+\.\d+)?:/.test(text)
            ? "core"
            : /^Go Deeper(?: \d+\.\d+)?:/.test(text)
              ? "deeper"
              : undefined;
          const isResponse =
            text.includes("Your response:") ||
            text.includes("Write your response here.") ||
            text.includes("My first leadership commitment:") ||
            text.includes("My second leadership commitment:");

          if (exerciseType) {
            return (
              <aside className={`exercise-marker exercise-marker--${exerciseType}`}>
                {children}
              </aside>
            );
          }

          if (!isResponse) return <blockquote>{children}</blockquote>;

          const prompt = Children.toArray(children).filter(
            (child) => textFromChildren(child) !== "Write your response here.",
          );
          const line = node?.position?.start.line ?? 0;
          const legacyLine = isCourseModule(document) ? Math.max(0, line - 6) : line;
          const stableId = stableFieldId(document.markdown, line, "response");
          return (
            <div className="response-card">
              {textFromChildren(prompt) !== "Your response:" && (
                <div className="response-prompt">{prompt}</div>
              )}
              <AnswerField
                storageId={`${document.id}:${stableId}`}
                legacyStorageId={[
                  `${document.id}:response:${line}`,
                  `${document.id}:response:${legacyLine}`,
                ]}
                onStorageIssue={onStorageIssue}
              />
            </div>
          );
        },
        table({ children }) {
          return (
            <div className="table-wrap">
              <table>{children}</table>
            </div>
          );
        },
        td({ node, children }) {
          const value = textFromChildren(children);
          const line = node?.position?.start.line ?? 0;
          const column = node?.position?.start.column ?? 0;
          const legacyLine = isCourseModule(document) ? Math.max(0, line - 6) : line;
          const stableId = stableFieldId(document.markdown, line, "table", column);
          return (
            <td>
              {value ? (
                enhanceWithBibleLinks(children, bibleTranslation)
              ) : (
                <AnswerField
                  compact
                  label="Enter response"
                  storageId={`${document.id}:${stableId}`}
                  legacyStorageId={[
                    `${document.id}:table:${line}:${column}`,
                    `${document.id}:table:${legacyLine}:${column}`,
                  ]}
                  onStorageIssue={onStorageIssue}
                />
              )}
            </td>
          );
        },
        input({ node, type, checked, ...props }) {
          if (type !== "checkbox") return <input type={type} {...props} />;
          const line = node?.position?.start.line ?? 0;
          const column = node?.position?.start.column ?? 0;
          const legacyLine = isCourseModule(document) ? Math.max(0, line - 6) : line;
          const checkboxLabel = plainText(document.markdown.split(/\r?\n/)[line - 1] ?? "Save this selection");
          const stableId = stableFieldId(document.markdown, line, "check", column);
          return (
            <SavedCheckbox
              defaultChecked={checked}
              label={checkboxLabel || "Save this selection"}
              storageId={`${document.id}:${stableId}`}
              legacyStorageId={[
                `${document.id}:check:${line}:${column}`,
                `${document.id}:check:${legacyLine}:${column}`,
              ]}
              onStorageIssue={onStorageIssue}
            />
          );
        },
        a({ href = "", children }) {
          const [linkedFile, linkedSection] = href.split("#");
          if (linkedFile.endsWith(".md")) {
            const target = documents.find((item) => item.file === linkedFile);
            if (target) {
              const matchingSection = linkedSection
                ? moduleSections(target).find(
                    (section) =>
                      slugify(section.title) === linkedSection ||
                      section.id === `${target.id}--${linkedSection}`,
                  )
                : undefined;
              const targetId = matchingSection?.id ??
                (linkedSection ? `${target.id}--${linkedSection}` : target.id);
              return (
                <a
                  href={`#${targetId}`}
                  onClick={(event) => {
                    event.preventDefault();
                    onNavigate(target.id, targetId);
                  }}
                >
                  {children}
                </a>
              );
            }
          }

          if (href.startsWith("#")) {
            const targetId = href.slice(1);
            const targetDocument = documents.find(
              (item) =>
                targetId === item.id || targetId.startsWith(`${item.id}--`),
            );
            return (
              <a
                href={href}
                onClick={(event) => {
                  if (!targetDocument) return;
                  event.preventDefault();
                  onNavigate(targetDocument.id, targetId);
                }}
              >
                {children}
              </a>
            );
          }

          return (
            <a href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          );
        },
        img({ src = "", alt = "" }) {
          const rawSrc = typeof src === "string" ? src : "";
          const imageSource = rawSrc.startsWith("assets/")
            ? joinBasePath(rawSrc)
            : rawSrc;
          return <DiagramImage src={imageSource} alt={alt} />;
        },
      }}
    >
      {document.markdown}
    </ReactMarkdown>
  );
}

function ModuleSectionMenu({
  document,
  compact,
  onNavigate,
}: {
  document: CourseDocument;
  compact: boolean;
  onNavigate: (documentId: string, target?: string) => void;
}) {
  const sections = moduleSections(document);
  const [open, setOpen] = useState(!compact);

  return (
    <details
      className="module-sections session-sections"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        <span>In this module</span>
        <span>{sections.length} sections</span>
      </summary>
      <nav aria-label={`${document.shortLabel} sections`}>
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(document.id, section.id);
            }}
          >
            {section.title}
          </a>
        ))}
      </nav>
    </details>
  );
}

export function CourseApp() {
  const [data, setData] = useState<CourseData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [activeId, setActiveId] = useState("course-introduction");
  const [menuOpen, setMenuOpen] = useState(false);
  const [compactNavigation, setCompactNavigation] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [storageIssue, setStorageIssue] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resetConfirmation, setResetConfirmation] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [resetNotice, setResetNotice] = useState("");
  const [resetRevision, setResetRevision] = useState(0);
  const [printMenuOpen, setPrintMenuOpen] = useState(false);
  const [editionMenuOpen, setEditionMenuOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [resumePoint, setResumePoint] = useState<ResumePoint | null>(null);
  const [readingSize, setReadingSize] = useState("standard");
  const [relaxedReading, setRelaxedReading] = useState(false);
  const [bibleTranslation, setBibleTranslation] = useState<SupportedBibleTranslation>(DEFAULT_BIBLE_TRANSLATION);
  const [progressRevision, setProgressRevision] = useState(0);
  const pendingScroll = useRef<string | null>(null);
  const settingsCloseButton = useRef<HTMLButtonElement | null>(null);
  const settingsButton = useRef<HTMLButtonElement | null>(null);
  const menuButton = useRef<HTMLButtonElement | null>(null);
  const courseNav = useRef<HTMLElement | null>(null);
  const printMenu = useRef<HTMLDivElement | null>(null);
  const editionMenu = useRef<HTMLDivElement | null>(null);

  const reportStorageIssue = useCallback(() => setStorageIssue(true), []);

  useEffect(() => {
    fetch(joinBasePath(`data/course.json?t=${Date.now()}`), { cache: "no-cache" })
      .then((response) => {
        if (!response.ok) throw new Error("Course data could not be loaded.");
        return response.json() as Promise<CourseData>;
      })
      .then((courseData) => setData(courseData))
      .catch(() =>
        setLoadError(
          "The course content could not be loaded. Please refresh the page.",
        ),
      );
  }, []);

  useEffect(() => {
    const size = safeStorageGet(`${storagePrefix}:preference:reading-size`);
    const relaxed = safeStorageGet(`${storagePrefix}:preference:relaxed-reading`);
    const translation = safeStorageGet(`${storagePrefix}:preference:bible-translation`);
    const savedResume = safeStorageGet(`${storagePrefix}:preference:last-location`);
    const selectedEdition = safeStorageGet(`${storagePrefix}:preference:edition-selected`);
    const hasHash = typeof window !== "undefined" && window.location.hash.length > 1;

    const frame = window.requestAnimationFrame(() => {
      if (size.failed || relaxed.failed || translation.failed || savedResume.failed) setStorageIssue(true);
      if (size.value === "large" || size.value === "standard") setReadingSize(size.value);
      setRelaxedReading(relaxed.value === "true");
      if (translation.value && translation.value in BIBLE_TRANSLATIONS) {
        setBibleTranslation(translation.value as SupportedBibleTranslation);
      }
      if (savedResume.value) {
        try {
          setResumePoint(JSON.parse(savedResume.value) as ResumePoint);
        } catch {
          safeStorageRemove(`${storagePrefix}:preference:last-location`);
        }
      }
      if (!selectedEdition.value && !hasHash) {
        setOnboardingOpen(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 980px)");
    const update = () => setCompactNavigation(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!menuOpen || !compactNavigation) return;
    const previousOverflow = document.body.style.overflow;
    const drawer = courseNav.current;
    const returnButton = menuButton.current;
    const focusables = drawer?.querySelectorAll<HTMLElement>("a, button") ?? [];
    const closeMenu = () => setMenuOpen(false);
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
      if (event.key !== "Tab" || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    window.requestAnimationFrame(() => focusables[0]?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
      returnButton?.focus();
    };
  }, [compactNavigation, menuOpen]);

  useEffect(() => {
    if (!settingsOpen) return;

    const previousOverflow = document.body.style.overflow;
    const mobileReturnButton = menuButton.current;
    const desktopReturnButton = settingsButton.current;
    const background = document.querySelectorAll<HTMLElement>(
      ".site-header, .course-nav, .course-main",
    );
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSettingsOpen(false);
      if (event.key !== "Tab") return;
      const dialog = document.querySelector<HTMLElement>(".settings-dialog");
      const focusables = dialog?.querySelectorAll<HTMLElement>(
        'button, select, input:not([type="hidden"]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    background.forEach((element) => element.setAttribute("inert", ""));
    window.addEventListener("keydown", closeOnEscape);
    window.requestAnimationFrame(() => settingsCloseButton.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      background.forEach((element) => element.removeAttribute("inert"));
      window.removeEventListener("keydown", closeOnEscape);
      if (compactNavigation) mobileReturnButton?.focus();
      else desktopReturnButton?.focus();
    };
  }, [compactNavigation, settingsOpen]);

  useEffect(() => {
    if (!printMenuOpen) return;
    const close = (event: MouseEvent) => {
      if (!printMenu.current?.contains(event.target as Node)) setPrintMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPrintMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [printMenuOpen]);

  useEffect(() => {
    if (!editionMenuOpen) return;
    const close = (event: MouseEvent) => {
      if (!editionMenu.current?.contains(event.target as Node)) setEditionMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEditionMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [editionMenuOpen]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "0.0.0.0";

    if (isLocalhost) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().catch(() => undefined);
        }
      });
      if ("caches" in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key).catch(() => undefined);
          }
        });
      }
      return;
    }

    navigator.serviceWorker
      .register(joinBasePath("sw.js"), { updateViaCache: "none" })
      .then((reg) => {
        reg.update().catch(() => undefined);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!data) return;
    const applyHash = () => {
      const originalHash = window.location.hash.slice(1);
      const hash = normalizeCourseHash(originalHash);
      if (!hash) return;
      const target = data.documents.find(
        (document) =>
          hash === document.id || hash.startsWith(`${document.id}--`),
      );
      if (target) {
        setActiveId(target.id);
        pendingScroll.current = hash === target.id ? null : hash;
        if (hash !== originalHash) window.history.replaceState(null, "", `#${hash}`);
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [data]);

  useEffect(() => {
    if (!data) return;
    const currentDoc = data.documents.find((d) => d.id === activeId) || data.documents[0];
    const edition = documentEdition(currentDoc);
    trackGAEvent("course_edition_view", {
      course_edition: edition,
      document_id: currentDoc.id,
      document_title: currentDoc.label,
      document_kind: currentDoc.kind,
    });
    if (typeof window !== "undefined") {
      const gtag = (window as unknown as { gtag?: GTagFunction }).gtag;
      if (typeof gtag === "function") {
        gtag("set", "user_properties", {
          course_edition: edition,
        });
      }
    }
  }, [data, activeId]);

  useEffect(() => {
    if (!pendingScroll.current) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const target = pendingScroll.current;
    pendingScroll.current = null;
    window.requestAnimationFrame(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
    });
  }, [activeId]);

  useEffect(() => {
    courseNav.current
      ?.querySelector<HTMLElement>('a[aria-current="page"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  useEffect(() => {
    if (!data || activeDocumentIsNotModule(data, activeId)) return;
    let scheduled = false;
    const recordLocation = () => {
      scheduled = false;
      const headings = Array.from(
        document.querySelectorAll<HTMLElement>(".course-content h2, .course-content h3"),
      );
      const current = [...headings].reverse().find((heading) => heading.getBoundingClientRect().top <= 150);
      if (!current) return;
      const documentItem = data.documents.find((item) => item.id === activeId);
      if (!documentItem) return;
      const nextPoint = {
        documentId: activeId,
        targetId: current.id,
        title: current.dataset.sectionTitle ?? current.innerText,
      };
      if (!safeStorageSet(`${storagePrefix}:preference:last-location`, JSON.stringify(nextPoint))) {
        setStorageIssue(true);
        return;
      }
      setResumePoint(nextPoint);
    };
    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(recordLocation);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [activeId, data]);

  function navigate(documentId: string, target?: string) {
    pendingScroll.current = target ?? null;
    setActiveId(documentId);
    setMenuOpen(false);
    window.history.pushState(null, "", `#${target ?? documentId}`);
    if (documentId === activeId && target) {
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
    }
  }

  function openSettings() {
    const count = answerCount();
    if (count === null) setStorageIssue(true);
    else setSavedCount(count);
    setSettingsError("");
    setResetConfirmation(false);
    setMenuOpen(false);
    setSettingsOpen(true);
  }

  function printDocument(includeResponses: boolean) {
    setPrintMenuOpen(false);
    document.body.classList.toggle("print-blank", !includeResponses);
    const cleanUp = () => document.body.classList.remove("print-blank");
    window.addEventListener("afterprint", cleanUp, { once: true });
    window.print();
    window.setTimeout(cleanUp, 1000);
  }

  function exportBackup() {
    try {
      const entries: Record<string, string> = {};
      for (let index = 0; index < window.localStorage.length; index += 1) {
        const key = window.localStorage.key(index);
        if (!key?.startsWith(`${storageNamespace}:`)) continue;
        const value = window.localStorage.getItem(key);
        if (value !== null) entries[key] = value;
      }
      const backup = JSON.stringify(
        {
          course: "Growing Leaders: From Foundations to Maturity",
          storageVersion: 2,
          exportedAt: new Date().toISOString(),
          entries,
        },
        null,
        2,
      );
      const url = URL.createObjectURL(new Blob([backup], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `growing-leaders-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setSettingsError("A backup could not be created. Check your browser storage settings and try again.");
    }
  }

  async function importBackup(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as {
        course?: string;
        storageVersion?: number;
        entries?: Record<string, unknown>;
      };
      if (
        (parsed.course !== "Growing Leaders: From Foundations to Maturity" &&
          parsed.course !== "How God Develops Leaders" &&
          parsed.course !== "Growing Leaders") ||
        parsed.storageVersion !== 2 ||
        !parsed.entries
      ) {
        throw new Error("Invalid backup");
      }
      for (const [key, value] of Object.entries(parsed.entries)) {
        if (!key.startsWith(`${storageNamespace}:`) || typeof value !== "string") continue;
        if (!safeStorageSet(key, value)) throw new Error("Storage unavailable");
      }
      const restoredCount = answerCount();
      if (restoredCount !== null) setSavedCount(restoredCount);
      setResetRevision((revision) => revision + 1);
      setProgressRevision((revision) => revision + 1);
      setStorageIssue(false);
      setSettingsError("");
      setResetNotice("Your saved course data has been restored from the backup.");
      window.setTimeout(() => setResetNotice(""), 6000);
    } catch {
      setSettingsError("This file is not a valid backup for Growing Leaders.");
    }
  }

  function updateReadingSize(size: string) {
    setReadingSize(size);
    if (!safeStorageSet(`${storagePrefix}:preference:reading-size`, size)) reportStorageIssue();
  }

  function updateRelaxedReading(enabled: boolean) {
    setRelaxedReading(enabled);
    if (!safeStorageSet(`${storagePrefix}:preference:relaxed-reading`, String(enabled))) {
      reportStorageIssue();
    }
  }

  function updateBibleTranslation(translation: SupportedBibleTranslation) {
    setBibleTranslation(translation);
    if (!safeStorageSet(`${storagePrefix}:preference:bible-translation`, translation)) {
      reportStorageIssue();
    }
  }

  function moduleProgressKey(documentId: string) {
    return `${storagePrefix}:progress:${documentId}:module`;
  }

  function moduleIsComplete(documentId: string) {
    void progressRevision;
    const result = safeStorageGet(moduleProgressKey(documentId));
    if (result.failed) return false;
    if (result.value !== null) return result.value === "true";

    // Legacy progress keys check
    const legacySessionKey = `${storagePrefix}:progress:${documentId}:session`;
    const legacySessionResult = safeStorageGet(legacySessionKey);
    if (legacySessionResult.value === "true") {
      safeStorageSet(moduleProgressKey(documentId), "true");
      return true;
    }

    const altId = documentId.startsWith("module-")
      ? documentId.replace("module-", "session-")
      : documentId.replace("session-", "module-");
    const altSessionResult = safeStorageGet(`${storagePrefix}:progress:${altId}:session`);
    if (altSessionResult.value === "true") {
      safeStorageSet(moduleProgressKey(documentId), "true");
      return true;
    }
    const altModuleResult = safeStorageGet(`${storagePrefix}:progress:${altId}:module`);
    if (altModuleResult.value === "true") {
      safeStorageSet(moduleProgressKey(documentId), "true");
      return true;
    }

    const oldPartOne = safeStorageGet(
      `${storagePrefix}:progress:${documentId}:${documentId}--part-1-learn`,
    );
    const oldPartTwo = safeStorageGet(
      `${storagePrefix}:progress:${documentId}:${documentId}--part-2-reflect-and-apply`,
    );
    if (oldPartOne.value === "true" && oldPartTwo.value === "true") {
      safeStorageSet(moduleProgressKey(documentId), "true");
      return true;
    }

    return false;
  }

  function toggleModuleComplete(documentId: string) {
    const key = moduleProgressKey(documentId);
    const next = !moduleIsComplete(documentId);
    if (!safeStorageSet(key, String(next))) {
      reportStorageIssue();
      return;
    }
    setProgressRevision((revision) => revision + 1);
  }

  function resetLocalStorage() {
    try {
      window.localStorage.clear();
      setSavedCount(0);
      setResetRevision((revision) => revision + 1);
      setProgressRevision((revision) => revision + 1);
      setResumePoint(null);
      setStorageIssue(false);
      setResetConfirmation(false);
      setSettingsOpen(false);
      setResetNotice("Saved browser data has been cleared. The course content was not changed.");
      window.setTimeout(() => setResetNotice(""), 6000);
    } catch {
      setSettingsError(
        "The browser could not clear its saved data. Check your browser privacy settings and try again.",
      );
    }
  }

  if (loadError) {
    return (
      <main className="state-message">
        <p>{loadError}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="state-message" aria-live="polite">
        <span className="loading-mark" />
        <p>Preparing your course…</p>
      </main>
    );
  }

  const activeIndex = Math.max(
    0,
    data.documents.findIndex((document) => document.id === activeId),
  );
  const activeDocument = data.documents[activeIndex] || data.documents[0];
  const activeEdition = documentEdition(activeDocument);
  const editionDocuments = data.documents.filter(
    (document) => documentEdition(document) === activeEdition,
  );
  const editionActiveIndex = Math.max(
    0,
    editionDocuments.findIndex((document) => document.id === activeDocument.id),
  );
  const previousDocument = editionDocuments[editionActiveIndex - 1];
  const nextDocument = editionDocuments[editionActiveIndex + 1];
  const resumeDocument = resumePoint
    ? data.documents.find((document) => document.id === resumePoint.documentId)
    : undefined;
  const complete = isCourseModule(activeDocument) && moduleIsComplete(activeDocument.id);
  const currentEditionMeta = EDITIONS.find((e) => e.id === activeEdition) || EDITIONS[0];

  return (
    <div
      className={`course-shell reading-${readingSize} ${relaxedReading ? "reading-relaxed" : ""}`}
    >
      <a className="skip-link" href="#lesson-content">Skip to lesson content</a>
      <header className="site-header">
        <button
          ref={menuButton}
          className="menu-button"
          type="button"
          aria-label={menuOpen ? "Close course contents" : "Open course contents"}
          aria-expanded={menuOpen}
          aria-controls="course-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">☰</span>
          <span>Course contents</span>
        </button>
        <a
          className="brand"
          href={`#${activeDocument.id}`}
          onClick={(event) => {
            event.preventDefault();
            const introDoc = editionDocuments.find((d) => d.kind === "introduction") || activeDocument;
            navigate(introDoc.id);
          }}
        >
          <span className="brand-mark" aria-hidden="true">G</span>
          <span className="brand-text">
            <strong>Growing Leaders</strong>
            <small>From Foundations to Maturity</small>
          </span>
        </a>
        <div className="header-actions">
          <div className="header-edition-wrap" ref={editionMenu}>
            <button
              className="header-edition-dropdown-btn"
              type="button"
              aria-label="Select course edition"
              aria-expanded={editionMenuOpen}
              aria-haspopup="menu"
              onClick={() => setEditionMenuOpen((open) => !open)}
            >
              <span className="edition-btn-icon" aria-hidden="true">{currentEditionMeta.icon}</span>
              <span className="edition-btn-label">{currentEditionMeta.label}</span>
              <span className="edition-btn-tag">{currentEditionMeta.tag}</span>
              <span className="edition-btn-chevron" aria-hidden="true">▾</span>
            </button>

            {editionMenuOpen && (
              <div className="header-edition-menu" role="menu" aria-label="Course editions">
                <div className="edition-menu-header">
                  <span>Switch Edition</span>
                </div>
                {EDITIONS.map((ed) => {
                  const isSelected = activeEdition === ed.id;
                  return (
                    <button
                      key={ed.id}
                      type="button"
                      role="menuitem"
                      className={`edition-menu-item ${isSelected ? "edition-menu-item--active" : ""}`}
                      onClick={() => {
                        setEditionMenuOpen(false);
                        const target = findTargetInEdition(data.documents, ed.id, activeDocument);
                        trackGAEvent("course_edition_switch", {
                          selected_edition: ed.id,
                          previous_edition: activeEdition,
                          source_document_id: activeDocument.id,
                          target_document_id: target.id,
                        });
                        navigate(target.id);
                      }}
                    >
                      <div className="edition-menu-item-top">
                        <span className="edition-menu-item-icon">{ed.icon}</span>
                        <strong className="edition-menu-item-title">{ed.label}</strong>
                        <span className="edition-menu-item-tag">{ed.tag}</span>
                        {isSelected && <span className="edition-menu-item-check" aria-hidden="true">✓</span>}
                      </div>
                      <p className="edition-menu-item-desc">{ed.description}</p>
                    </button>
                  );
                })}

                <div className="edition-menu-footer">
                  <button
                    type="button"
                    role="menuitem"
                    className="edition-menu-compare-btn"
                    onClick={() => {
                      setEditionMenuOpen(false);
                      setOnboardingOpen(true);
                    }}
                  >
                    <span>✦ Compare all editions & choose</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="print-menu-wrap" ref={printMenu}>
            <button
              className="print-button"
              type="button"
              aria-label="Print this document"
              aria-expanded={printMenuOpen}
              aria-haspopup="menu"
              onClick={() => setPrintMenuOpen((open) => !open)}
            >
              <span className="print-icon" aria-hidden="true">🖨︎</span>
              <span className="print-label">Print this document</span>
              <span className="print-chevron" aria-hidden="true">▾</span>
            </button>
            {printMenuOpen && (
              <div className="print-menu" role="menu">
                <button type="button" role="menuitem" onClick={() => printDocument(true)}>
                  Print with my responses
                </button>
                <button type="button" role="menuitem" onClick={() => printDocument(false)}>
                  Print without responses
                </button>
                <div className="print-menu-note" role="none">
                  <strong>For a clean PDF:</strong> In More settings, turn off Headers and footers.
                  The course does not add page numbers. Turn browser headers and footers on only
                  if you want browser-generated page numbers and other browser details.
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <aside
        ref={courseNav}
        id="course-navigation"
        className={`course-nav ${menuOpen ? "course-nav--open" : ""}`}
        role={compactNavigation && menuOpen ? "dialog" : undefined}
        aria-modal={compactNavigation && menuOpen ? "true" : undefined}
        aria-label={compactNavigation && menuOpen ? "Course contents" : undefined}
        aria-hidden={compactNavigation && !menuOpen ? "true" : undefined}
      >
        <div className="edition-nav-section">
          <p className="nav-kicker">Course Edition</p>
          <div className="edition-tabs" role="tablist" aria-label="Course editions">
            {EDITIONS.map((ed) => {
              const isSelected = activeEdition === ed.id;
              return (
                <button
                  key={ed.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`edition-tab ${isSelected ? "edition-tab--active" : ""}`}
                  onClick={() => {
                    const target = findTargetInEdition(data.documents, ed.id, activeDocument);
                    trackGAEvent("course_edition_switch", {
                      selected_edition: ed.id,
                      previous_edition: activeEdition,
                      source_document_id: activeDocument.id,
                      target_document_id: target.id,
                    });
                    navigate(target.id);
                  }}
                  title={ed.description}
                >
                  <span className="edition-tab-label">{ed.label}</span>
                  <span className="edition-tab-tag">{ed.tag}</span>
                </button>
              );
            })}
          </div>
        </div>

        <nav aria-label="Course documents">
          {[
            {
              label: activeEdition === "essentials" ? "Participant modules" : "Participant course",
              documents: editionDocuments.filter((document) => document.kind !== "facilitator"),
            },
            {
              label: "Facilitator resources",
              documents: editionDocuments.filter((document) => document.kind === "facilitator"),
            },
          ].map((group) => (
            <div className="nav-group" key={group.label}>
              <p className="nav-group-title">{group.label}</p>
              {group.documents.map((document) => {
                const documentComplete =
                  isCourseModule(document) && moduleIsComplete(document.id);
                return (
                  <a
                    key={document.id}
                    href={`#${document.id}`}
                    className={document.id === activeDocument.id ? "active" : ""}
                    aria-current={document.id === activeDocument.id ? "page" : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      navigate(document.id);
                    }}
                  >
                    <span className="nav-kicker">{document.shortLabel}</span>
                    <span className="nav-link-label">
                      <span>{document.label}</span>
                      {documentComplete && (
                        <span
                          className="nav-complete"
                          aria-label={`${document.shortLabel} complete`}
                          title="Module complete"
                        >
                          ✓
                        </span>
                      )}
                    </span>
                  </a>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="storage-note">
          <strong>Private by design</strong>
          <p>Your responses stay in this browser on this device.</p>
        </div>
        <div className="settings-block">
          <p className="nav-kicker">Settings</p>
          <button
            ref={settingsButton}
            type="button"
            className="settings-button"
            onClick={openSettings}
          >
            <span aria-hidden="true">⚙</span>
            Settings
          </button>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="menu-scrim"
          aria-label="Close course contents"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {settingsOpen && (
        <div className="settings-overlay">
          <section
            className="settings-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            aria-describedby="settings-description"
          >
            <header className="settings-dialog-header">
              <div>
                <p className="eyebrow">Browser storage</p>
                <h2 id="settings-title">Settings</h2>
              </div>
              <button
                ref={settingsCloseButton}
                type="button"
                className="settings-close"
                aria-label="Close settings"
                onClick={() => setSettingsOpen(false)}
              >
                ×
              </button>
            </header>

            <p id="settings-description">
              Your written responses, fillable table entries and checkbox selections are
              stored locally in this browser. The lesson content is stored separately and
              will not be deleted by a reset.
            </p>

            <div className="settings-summary" aria-live="polite">
              <span>Currently saved</span>
              <strong>{savedCount}</strong>
              <span>{savedCount === 1 ? "response or selection" : "responses and selections"}</span>
            </div>

            <section className="settings-section" aria-labelledby="edition-settings-title">
              <h3 id="edition-settings-title">Course edition</h3>
              <p>
                Currently reading: <strong>{currentEditionMeta.label}</strong> ({currentEditionMeta.tag})
              </p>
              <div className="settings-actions settings-actions--start">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setSettingsOpen(false);
                    setOnboardingOpen(true);
                  }}
                >
                  Change edition
                </button>
              </div>
            </section>

            <section className="settings-section" aria-labelledby="reading-settings-title">
              <h3 id="reading-settings-title">Reading preferences</h3>
              <label>
                Text size
                <select value={readingSize} onChange={(event) => updateReadingSize(event.target.value)}>
                  <option value="standard">Standard</option>
                  <option value="large">Large</option>
                </select>
              </label>
              <label className="settings-check">
                <input
                  type="checkbox"
                  checked={relaxedReading}
                  onChange={(event) => updateRelaxedReading(event.target.checked)}
                />
                Use more line spacing
              </label>
            </section>

            <section className="settings-section" aria-labelledby="bible-settings-title">
              <h3 id="bible-settings-title">Bible translation</h3>
              <p>
                Choose your preferred translation for opening Scripture passages on Bible.com or the YouVersion app.
              </p>
              <label>
                Bible link translation
                <select
                  value={bibleTranslation}
                  onChange={(event) =>
                    updateBibleTranslation(event.target.value as SupportedBibleTranslation)
                  }
                >
                  {SUPPORTED_TRANSLATION_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {BIBLE_TRANSLATIONS[key].label}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            <section className="settings-section" aria-labelledby="backup-settings-title">
              <h3 id="backup-settings-title">Backup and restore</h3>
              <p>Download a private backup before resetting or moving to another browser.</p>
              <div className="settings-actions settings-actions--start">
                <button type="button" className="secondary-button" onClick={exportBackup}>
                  Download backup
                </button>
                <label className="secondary-button file-button">
                  Restore backup
                  <input type="file" accept="application/json,.json" onChange={importBackup} />
                </label>
              </div>
            </section>

            {resetConfirmation ? (
              <div className="settings-confirmation">
                <h3>Clear all local storage?</h3>
                <p>
                  This cannot be undone. It will remove all data stored in localStorage for
                  this website origin—not only course answers. This may also affect another
                  site if it shares the same domain.
                </p>
                <div className="settings-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setResetConfirmation(false)}
                  >
                    Keep my responses
                  </button>
                  <button type="button" className="warning-button" onClick={resetLocalStorage}>
                    Clear everything
                  </button>
                </div>
              </div>
            ) : (
              <div className="settings-actions">
                <button
                  type="button"
                  className="destructive-button"
                  onClick={() => setResetConfirmation(true)}
                >
                  Clear all responses
                </button>
              </div>
            )}

            {settingsError && (
              <p className="settings-error" role="alert">
                {settingsError}
              </p>
            )}
            {storageIssue && (
              <p className="settings-error" role="status">
                This browser is currently limiting access to saved course data. You can still read
                the lessons, but new responses may not be retained.
              </p>
            )}
          </section>
        </div>
      )}

      {onboardingOpen && data && (
        <div
          className="onboarding-overlay"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setOnboardingOpen(false);
            }
          }}
        >
          <div
            className="onboarding-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
          >
            <button
              type="button"
              className="onboarding-close-btn"
              aria-label="Close dialog"
              onClick={() => setOnboardingOpen(false)}
            >
              ✕
            </button>

            <div className="onboarding-dialog-header">
              <span className="onboarding-badge">Welcome to Growing Leaders</span>
              <h2 id="onboarding-title">Choose Your Course Edition</h2>
              <p className="onboarding-subtitle">
                Select the format that best fits your schedule and mentoring context. You can switch editions anytime.
              </p>
            </div>

            <div className="onboarding-cards">
              {EDITIONS.map((ed) => {
                const isCurrent = activeEdition === ed.id;
                return (
                  <button
                    key={ed.id}
                    type="button"
                    className={`onboarding-card onboarding-card--${ed.id} ${isCurrent ? "onboarding-card--current" : ""}`}
                    onClick={() => {
                      safeStorageSet(`${storagePrefix}:preference:edition-selected`, ed.id);
                      setOnboardingOpen(false);
                      const target =
                        data.documents.find((d) => documentEdition(d) === ed.id && d.kind === "introduction") ||
                        data.documents.find((d) => documentEdition(d) === ed.id) ||
                        data.documents[0];
                      trackGAEvent("course_edition_select", {
                        selected_edition: ed.id,
                        source: "onboarding_modal",
                      });
                      navigate(target.id);
                    }}
                  >
                    <div className="onboarding-card-header">
                      <span className="onboarding-card-icon" aria-hidden="true">{ed.icon}</span>
                      <span className="onboarding-card-tag">{ed.tag}</span>
                    </div>
                    <h3 className="onboarding-card-title">{ed.label}</h3>
                    <p className="onboarding-card-desc">{ed.description}</p>
                    <div className="onboarding-card-footer">
                      <span className="onboarding-card-btn-text">
                        {isCurrent ? "Continue with this Edition →" : "Select this Edition →"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="onboarding-dialog-footer">
              <button
                type="button"
                className="onboarding-dismiss-btn"
                onClick={() => setOnboardingOpen(false)}
              >
                Close (keep current edition)
              </button>
            </div>
          </div>
        </div>
      )}

      {resetNotice && (
        <div className="reset-notice" role="status">
          {resetNotice}
        </div>
      )}

      <main id="main-content" className="course-main" tabIndex={-1}>
        <div className="document-announcement" aria-live="polite" aria-atomic="true">
          Now viewing {activeDocument.shortLabel}: {activeDocument.label}
        </div>
        <div className="document-toolbar">
          <div className="toolbar-breadcrumbs">
            <span className="toolbar-crumb-edition">{currentEditionMeta.icon} {currentEditionMeta.label}</span>
            <span className="toolbar-crumb-separator" aria-hidden="true">/</span>
            <span className="toolbar-crumb-current">{activeDocument.shortLabel}</span>
            {isCourseModule(activeDocument) && (
              <button
                type="button"
                className={`toolbar-status-pill ${complete ? "toolbar-status-pill--complete" : ""}`}
                onClick={() => toggleModuleComplete(activeDocument.id)}
                title={complete ? "Click to unmark completion" : "Click to mark module complete"}
                aria-pressed={complete}
              >
                {complete ? "✓ Complete" : "○ In progress"}
              </button>
            )}
          </div>
          <p className="document-position">
            {editionActiveIndex + 1} of {editionDocuments.length}
          </p>
        </div>

        {storageIssue && (
          <div className="storage-warning" role="status">
            Saved responses are unavailable in this browser. Course reading remains available.
            <button type="button" onClick={openSettings}>Open Settings</button>
          </div>
        )}

        {activeDocument.kind === "introduction" && resumePoint && resumeDocument && (
          <section className="continue-card" aria-label="Continue where you left off">
            <div>
              <span>Continue where you left off</span>
              <strong>{resumeDocument.shortLabel}: {resumePoint.title}</strong>
            </div>
            <button
              type="button"
              onClick={() => navigate(resumePoint.documentId, resumePoint.targetId)}
            >
              Continue
            </button>
          </section>
        )}

        {isCourseModule(activeDocument) && (
          <ModuleSectionMenu
            key={`${activeDocument.id}:${compactNavigation}`}
            document={activeDocument}
            compact={compactNavigation}
            onNavigate={navigate}
          />
        )}

        <article
          className="course-content"
          key={`${activeDocument.id}:${resetRevision}`}
          data-print-edition={`${currentEditionMeta.label} (${currentEditionMeta.tag})`}
          data-print-title={`${activeDocument.shortLabel}: ${activeDocument.label}`}
        >
          <CourseMarkdown
            document={activeDocument}
            documents={data.documents}
            onNavigate={navigate}
            onStorageIssue={reportStorageIssue}
            moduleProgress={undefined}
            bibleTranslation={bibleTranslation}
          />
        </article>

        {isCourseModule(activeDocument) && (
          <section className="module-bottom-completion" aria-label="Module completion">
            <div className="completion-card-info">
              <span className="completion-card-icon" aria-hidden="true">{complete ? "🎉" : "📖"}</span>
              <div>
                <strong>{complete ? "Module completed!" : "Finished with this module?"}</strong>
                <p>{complete ? "Great job completing this module. Keep going with your leadership journey!" : "Mark this module complete to track your leadership formation progress."}</p>
              </div>
            </div>
            <button
              type="button"
              className={`completion-toggle-btn ${complete ? "completion-toggle-btn--complete" : ""}`}
              aria-pressed={complete}
              onClick={() => toggleModuleComplete(activeDocument.id)}
            >
              {complete ? "✓ Module Complete" : "Mark Module Complete"}
            </button>
          </section>
        )}

        <nav className="document-pagination" aria-label="Document navigation">
          {previousDocument ? (
            <button type="button" onClick={() => navigate(previousDocument.id)}>
              <span>Previous</span>
              <strong>{previousDocument.shortLabel}</strong>
            </button>
          ) : (
            <span />
          )}
          {nextDocument && (
            <button type="button" onClick={() => navigate(nextDocument.id)}>
              <span>Next</span>
              <strong>{nextDocument.shortLabel}</strong>
            </button>
          )}
        </nav>
      </main>
    </div>
  );
}
