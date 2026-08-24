import React from "react";

/**
 * Utility for Bible translation selection, reference parsing,
 * and deep-linking to YouVersion (Bible.com).
 * Sourced from bible-plan-reader app.
 */

export type SupportedBibleTranslation =
  | "BSB"
  | "ESV"
  | "CSB"
  | "NIV"
  | "NLT"
  | "NKJV"
  | "NASB2020"
  | "MSG"
  | "NRSVUE"
  | "AMP";

export interface BibleTranslationInfo {
  id: number;
  code: string;
  name: string;
  shortName: string;
  label: string;
}

export const DEFAULT_BIBLE_TRANSLATION: SupportedBibleTranslation = "NIV";

export const BIBLE_TRANSLATIONS: Record<SupportedBibleTranslation, BibleTranslationInfo> = {
  NIV: {
    id: 111,
    code: "NIV",
    name: "New International Version",
    shortName: "NIV",
    label: "NIV — New International Version (Default)",
  },
  BSB: {
    id: 3034,
    code: "BSB",
    name: "Berean Standard Bible",
    shortName: "BSB",
    label: "BSB — Berean Standard Bible",
  },
  ESV: {
    id: 59,
    code: "ESV",
    name: "English Standard Version",
    shortName: "ESV",
    label: "ESV — English Standard Version",
  },
  CSB: {
    id: 1713,
    code: "CSB",
    name: "Christian Standard Bible",
    shortName: "CSB",
    label: "CSB — Christian Standard Bible",
  },
  NLT: {
    id: 116,
    code: "NLT",
    name: "New Living Translation",
    shortName: "NLT",
    label: "NLT — New Living Translation",
  },
  NKJV: {
    id: 114,
    code: "NKJV",
    name: "New King James Version",
    shortName: "NKJV",
    label: "NKJV — New King James Version",
  },
  NASB2020: {
    id: 2692,
    code: "NASB2020",
    name: "New American Standard Bible 2020",
    shortName: "NASB 2020",
    label: "NASB2020 — New American Standard Bible 2020",
  },
  MSG: {
    id: 97,
    code: "MSG",
    name: "The Message",
    shortName: "MSG",
    label: "MSG — The Message",
  },
  NRSVUE: {
    id: 3523,
    code: "NRSVUE",
    name: "New Revised Standard Version Updated Edition",
    shortName: "NRSVUE",
    label: "NRSVUE — New Revised Standard Version Updated Edition",
  },
  AMP: {
    id: 1588,
    code: "AMP",
    name: "Amplified Bible",
    shortName: "AMP",
    label: "AMP — Amplified Bible",
  },
};

export const SUPPORTED_TRANSLATION_KEYS: SupportedBibleTranslation[] = [
  "BSB",
  "ESV",
  "CSB",
  "NIV",
  "NLT",
  "NKJV",
  "NASB2020",
  "MSG",
  "NRSVUE",
  "AMP",
];

// Mapping of book names and common aliases to USFM 3-letter book codes
export const USFM_BOOK_MAP: Record<string, string> = {
  // Old Testament
  genesis: "GEN", gen: "GEN", ge: "GEN", gn: "GEN",
  exodus: "EXO", exo: "EXO", ex: "EXO",
  leviticus: "LEV", lev: "LEV", le: "LEV", lv: "LEV",
  numbers: "NUM", num: "NUM", nu: "NUM", nm: "NUM", nb: "NUM",
  deuteronomy: "DEU", deut: "DEU", de: "DEU", dt: "DEU",
  joshua: "JOS", josh: "JOS", jos: "JOS",
  judges: "JDG", judg: "JDG", jdg: "JDG", jg: "JDG", jdgs: "JDG",
  ruth: "RUT", rut: "RUT", rth: "RUT", ru: "RUT",
  "1 samuel": "1SA", "1samuel": "1SA", "1 sam": "1SA", "1sam": "1SA", "1 sa": "1SA", "1sa": "1SA", "1 s": "1SA", "1s": "1SA", "i samuel": "1SA", "i sam": "1SA",
  "2 samuel": "2SA", "2samuel": "2SA", "2 sam": "2SA", "2sam": "2SA", "2 sa": "2SA", "2sa": "2SA", "2 s": "2SA", "2s": "2SA", "ii samuel": "2SA", "ii sam": "2SA",
  "1 kings": "1KI", "1kings": "1KI", "1 kgs": "1KI", "1kgs": "1KI", "1 ki": "1KI", "1ki": "1KI", "1 k": "1KI", "1k": "1KI", "i kings": "1KI", "i kgs": "1KI",
  "2 kings": "2KI", "2kings": "2KI", "2 kgs": "2KI", "2kgs": "2KI", "2 ki": "2KI", "2ki": "2KI", "2 k": "2KI", "2k": "2KI", "ii kings": "2KI", "ii kgs": "2KI",
  "1 chronicles": "1CH", "1chronicles": "1CH", "1 chron": "1CH", "1chron": "1CH", "1 chr": "1CH", "1chr": "1CH", "1 ch": "1CH", "1ch": "1CH", "i chron": "1CH",
  "2 chronicles": "2CH", "2chronicles": "2CH", "2 chron": "2CH", "2chron": "2CH", "2 chr": "2CH", "2chr": "2CH", "2 ch": "2CH", "2ch": "2CH", "ii chron": "2CH",
  ezra: "EZR", ezr: "EZR", ez: "EZR",
  nehemiah: "NEH", neh: "NEH", ne: "NEH",
  esther: "EST", esth: "EST", est: "EST", es: "EST",
  job: "JOB", jb: "JOB",
  psalms: "PSA", psalm: "PSA", psa: "PSA", psm: "PSA", pss: "PSA", ps: "PSA",
  proverbs: "PRO", prov: "PRO", pro: "PRO", prv: "PRO", pr: "PRO",
  ecclesiastes: "ECC", eccles: "ECC", ecc: "ECC", ec: "ECC", qoh: "ECC", qoheleth: "ECC",
  "song of solomon": "SNG", "song of songs": "SNG", song: "SNG", sng: "SNG", sos: "SNG", canticles: "SNG", canticle: "SNG",
  isaiah: "ISA", isa: "ISA", is: "ISA",
  jeremiah: "JER", jer: "JER", je: "JER", jr: "JER",
  lamentations: "LAM", lam: "LAM", la: "LAM",
  ezekiel: "EZK", ezek: "EZK", ezk: "EZK", eze: "EZK",
  daniel: "DAN", dan: "DAN", da: "DAN", dn: "DAN",
  hosea: "HOS", hos: "HOS", ho: "HOS",
  joel: "JOL", jol: "JOL", joe: "JOL", jl: "JOL",
  amos: "AMO", amo: "AMO", am: "AMO",
  obadiah: "OBA", obad: "OBA", oba: "OBA", ob: "OBA",
  jonah: "JON", jona: "JON", jon: "JON", jnh: "JON",
  micah: "MIC", mic: "MIC", mc: "MIC",
  nahum: "NAM", nah: "NAM", nam: "NAM", na: "NAM",
  habakkuk: "HAB", hab: "HAB", hb: "HAB",
  zephaniah: "ZEP", zeph: "ZEP", zep: "ZEP", zp: "ZEP",
  haggai: "HAG", hag: "HAG", hg: "HAG",
  zechariah: "ZEC", zech: "ZEC", zec: "ZEC", zc: "ZEC",
  malachi: "MAL", mal: "MAL", ml: "MAL",

  // New Testament
  matthew: "MAT", matt: "MAT", mat: "MAT", mt: "MAT",
  mark: "MRK", mrk: "MRK", mk: "MRK", mr: "MRK",
  luke: "LUK", luk: "LUK", lk: "LUK", lu: "LUK",
  john: "JHN", jhn: "JHN", jn: "JHN", joh: "JHN",
  acts: "ACT", act: "ACT", ac: "ACT",
  romans: "ROM", rom: "ROM", ro: "ROM", rm: "ROM",
  "1 corinthians": "1CO", "1corinthians": "1CO", "1 cor": "1CO", "1cor": "1CO", "1 co": "1CO", "1co": "1CO", "i corinthians": "1CO", "i cor": "1CO",
  "2 corinthians": "2CO", "2corinthians": "2CO", "2 cor": "2CO", "2cor": "2CO", "2 co": "2CO", "2co": "2CO", "ii corinthians": "2CO", "ii cor": "2CO",
  galatians: "GAL", gal: "GAL", ga: "GAL",
  ephesians: "EPH", eph: "EPH", ep: "EPH",
  philippians: "PHP", phil: "PHP", php: "PHP", pp: "PHP",
  colossians: "COL", col: "COL", co: "COL",
  "1 thessalonians": "1TH", "1thessalonians": "1TH", "1 thess": "1TH", "1thess": "1TH", "1 th": "1TH", "1th": "1TH", "i thess": "1TH",
  "2 thessalonians": "2TH", "2thessalonians": "2TH", "2 thess": "2TH", "2thess": "2TH", "2 th": "2TH", "2th": "2TH", "ii thess": "2TH",
  "1 timothy": "1TI", "1timothy": "1TI", "1 tim": "1TI", "1tim": "1TI", "1 ti": "1TI", "1ti": "1TI", "i timothy": "1TI", "i tim": "1TI",
  "2 timothy": "2TI", "2timothy": "2TI", "2 tim": "2TI", "2tim": "2TI", "2 ti": "2TI", "2ti": "2TI", "ii timothy": "2TI", "ii tim": "2TI",
  titus: "TIT", tit: "TIT", ti: "TIT",
  philemon: "PHM", philem: "PHM", phm: "PHM", pm: "PHM",
  hebrews: "HEB", heb: "HEB", he: "HEB",
  james: "JAS", jas: "JAS", jm: "JAS", jam: "JAS",
  "1 peter": "1PE", "1peter": "1PE", "1 pet": "1PE", "1pet": "1PE", "1 pe": "1PE", "1pe": "1PE", "1 pt": "1PE", "1pt": "1PE", "i peter": "1PE", "i pet": "1PE",
  "2 peter": "2PE", "2peter": "2PE", "2 pet": "2PE", "2pet": "2PE", "2 pe": "2PE", "2pe": "2PE", "2 pt": "2PE", "2pt": "2PE", "ii peter": "2PE", "ii pet": "2PE",
  "1 john": "1JN", "1john": "1JN", "1 jn": "1JN", "1jn": "1JN", "1 jo": "1JN", "1jo": "1JN", "1 jhn": "1JN", "1jhn": "1JN", "i john": "1JN", "i jn": "1JN",
  "2 john": "2JN", "2john": "2JN", "2 jn": "2JN", "2jn": "2JN", "2 jo": "2JN", "2jo": "2JN", "2 jhn": "2JN", "2jhn": "2JN", "ii john": "2JN", "ii jn": "2JN",
  "3 john": "3JN", "3john": "3JN", "3 jn": "3JN", "3jn": "3JN", "3 jo": "3JN", "3jo": "3JN", "3 jhn": "3JN", "3jhn": "3JN", "iii john": "3JN", "iii jn": "3JN",
  jude: "JUD", jud: "JUD", jd: "JUD",
  revelation: "REV", rev: "REV", re: "REV", revelations: "REV", apocalypse: "REV",
};

export interface ParsedReference {
  bookCode: string;
  chapter: number;
  startVerse?: number;
  endVerse?: number;
}

/**
 * Parses a standard Bible reference string (e.g. "Genesis 50:15–21", "1 Samuel 24:1-12", "John 15:1-17", "1 Samuel 3")
 */
export function parseBibleReference(ref: string): ParsedReference | null {
  if (!ref || typeof ref !== "string") return null;

  const cleanRef = ref.trim().replace(/\s+/g, " ");

  // Matches "1 Samuel 24:1–12", "Genesis 50:15-21", "1 Peter 4:7–11", "John 15:1-17"
  const pattern = /^((?:[1-3I|ii|iii]\s*)?[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?)\s*(\d+)(?:\s*:\s*(\d+)(?:\s*[-–—]\s*(\d+))?)?$/i;
  const match = cleanRef.match(pattern);

  if (match) {
    const bookKey = match[1].toLowerCase().replace(/\s+/g, " ");
    const bookCode = USFM_BOOK_MAP[bookKey];
    if (!bookCode) return null;

    const chapter = parseInt(match[2], 10);
    const startVerse = match[3] ? parseInt(match[3], 10) : undefined;
    const endVerse = match[4] ? parseInt(match[4], 10) : startVerse;

    return {
      bookCode,
      chapter,
      startVerse,
      endVerse,
    };
  }

  // Single chapter books (e.g. "Jude 4" or "Obadiah 1-4")
  const shortPattern = /^((?:[1-3I|ii|iii]\s*)?[A-Za-z]+)\s+(\d+)(?:\s*[-–—]\s*(\d+))?$/i;
  const shortMatch = cleanRef.match(shortPattern);
  if (!shortMatch) return null;

  const bookKey = shortMatch[1].toLowerCase().replace(/\s+/g, " ");
  const bookCode = USFM_BOOK_MAP[bookKey];
  if (!bookCode) return null;

  const num1 = parseInt(shortMatch[2], 10);
  const num2 = shortMatch[3] ? parseInt(shortMatch[3], 10) : undefined;

  const singleChapterBooks = ["OBA", "PHM", "2JN", "3JN", "JUD"];
  if (singleChapterBooks.includes(bookCode)) {
    return {
      bookCode,
      chapter: 1,
      startVerse: num1,
      endVerse: num2 || num1,
    };
  }

  return {
    bookCode,
    chapter: num1,
    startVerse: undefined,
    endVerse: undefined,
  };
}

/**
 * Builds a deep link URL to YouVersion (Bible.com) for a given Scripture reference
 * and selected translation version.
 */
export function buildBibleComUrl(
  reference: string,
  translation: SupportedBibleTranslation = DEFAULT_BIBLE_TRANSLATION,
  fallbackUrl?: string
): string {
  if (!reference) return fallbackUrl || "";

  const parsed = parseBibleReference(reference);
  const transInfo = BIBLE_TRANSLATIONS[translation] || BIBLE_TRANSLATIONS[DEFAULT_BIBLE_TRANSLATION];

  if (parsed) {
    const { bookCode, chapter, startVerse, endVerse } = parsed;
    const base = `https://www.bible.com/bible/${transInfo.id}/${bookCode}.${chapter}`;
    if (startVerse !== undefined && endVerse !== undefined && startVerse !== endVerse) {
      return `${base}.${startVerse}-${endVerse}.${transInfo.code}`;
    } else if (startVerse !== undefined) {
      return `${base}.${startVerse}.${transInfo.code}`;
    }
    return `${base}.${transInfo.code}`;
  }

  // If already a bible.com link, replace version
  if (fallbackUrl && fallbackUrl.includes("bible.com/bible/")) {
    return fallbackUrl.replace(
      /bible\.com\/bible\/\d+\/([A-Z0-9]+(?:\.\d+)*(?:-[0-9]+)?)\.[A-Z0-9]+/i,
      `bible.com/bible/${transInfo.id}/$1.${transInfo.code}`
    );
  }

  return fallbackUrl || `https://www.bible.com/bible/${transInfo.id}`;
}

export function BibleLink({
  reference,
  translation,
}: {
  reference: string;
  translation: SupportedBibleTranslation;
}) {
  const url = buildBibleComUrl(reference, translation);
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="bible-ref-link"
      title={`Open ${reference} on Bible.com (${translation})`}
      aria-label={`Open ${reference} on Bible.com in ${translation}`}
      onClick={(event) => event.stopPropagation()}
    >
      <span className="bible-ref-icon" aria-hidden="true">📖</span>
      <span className="bible-ref-text">Bible.com</span>
      <svg
        className="bible-ref-external"
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
  );
}

/**
 * Splits text by Bible references and appends <BibleLink /> beside each detected passage.
 */
export function renderTextWithBibleLinks(
  text: string,
  translation: SupportedBibleTranslation = DEFAULT_BIBLE_TRANSLATION,
  keyPrefix = "bible-link"
): React.ReactNode {
  if (typeof text !== "string" || !text) return text;

  // Regex pattern matching Bible book references
  // e.g. "Genesis 50:15–21", "1 Samuel 24:1–12", "1 Samuel 3", "Luke 16:10–13", "1 Peter 4:7–11", "Mark 10:35–45", "John 15:1–17"
  const regex = /\b((?:(?:[1-3]|I{1,3})\s+)?[A-Z][a-z]+(?:\s+of\s+[A-Z][a-z]+)?\s+\d+(?::\d+(?:[-–—]\d+)?)?)\b/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const candidate = match[0];
    const parsed = parseBibleReference(candidate);

    if (parsed) {
      if (match.index > lastIndex) {
        elements.push(text.slice(lastIndex, match.index));
      }
      elements.push(candidate);
      elements.push(
        <BibleLink
          key={`${keyPrefix}-${match.index}-${candidate}`}
          reference={candidate}
          translation={translation}
        />
      );
      lastIndex = regex.lastIndex;
    }
  }

  if (elements.length === 0) {
    return text;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements;
}

/**
 * Recursively enhances React children by identifying Scripture references in text nodes.
 */
export function enhanceWithBibleLinks(
  nodes: React.ReactNode,
  translation: SupportedBibleTranslation = DEFAULT_BIBLE_TRANSLATION
): React.ReactNode {
  const childArray = React.Children.toArray(nodes);
  const alreadyEnhanced = childArray.some(
    (c) =>
      React.isValidElement(c) &&
      (c.type === BibleLink ||
        (c.props as { className?: string })?.className?.includes("bible-ref-link"))
  );
  if (alreadyEnhanced) {
    return nodes;
  }

  return React.Children.map(nodes, (child, index) => {
    if (typeof child === "string") {
      return renderTextWithBibleLinks(child, translation, `node-${index}`);
    }
    if (typeof child === "number" || typeof child === "boolean" || !child) {
      return child;
    }
    if (React.isValidElement(child)) {
      if (
        child.type === BibleLink ||
        child.type === "a" ||
        child.type === "button" ||
        (child.props as { className?: string })?.className?.includes("bible-ref-link")
      ) {
        return child;
      }
      const childProps = child.props as { children?: React.ReactNode };
      if (childProps && childProps.children) {
        return React.cloneElement(child, {
          ...childProps,
          children: enhanceWithBibleLinks(childProps.children, translation),
        });
      }
    }
    return child;
  });
}
