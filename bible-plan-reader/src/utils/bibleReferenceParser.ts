import { parseBibleReference } from './helloAoBible';

// List of Bible book names and common aliases/abbreviations
const BIBLE_BOOKS = [
  // OT
  'Genesis', 'Gen', 'Ge', 'Gn',
  'Exodus', 'Exod', 'Exo', 'Ex',
  'Leviticus', 'Lev', 'Le', 'Lv',
  'Numbers', 'Num', 'Nu', 'Nm',
  'Deuteronomy', 'Deut', 'Deu', 'Dt',
  'Joshua', 'Josh', 'Jos',
  'Judges', 'Judg', 'Jdg', 'Jdgs',
  'Ruth', 'Rut', 'Rth',
  '1 Samuel', '1Sam', '1 Sam', '1 Sa', '1sa', 'I Samuel', 'I Sam',
  '2 Samuel', '2Sam', '2 Sam', '2 Sa', '2sa', 'II Samuel', 'II Sam',
  '1 Kings', '1Kings', '1 Kgs', '1kgs', '1 Ki', '1ki', 'I Kings', 'I Kgs',
  '2 Kings', '2Kings', '2 Kgs', '2kgs', '2 Ki', '2ki', 'II Kings', 'II Kgs',
  '1 Chronicles', '1Chronicles', '1 Chron', '1chron', '1 Chr', '1chr', 'I Chron',
  '2 Chronicles', '2Chronicles', '2 Chron', '2chron', '2 Chr', '2chr', 'II Chron',
  'Ezra', 'Ezr',
  'Nehemiah', 'Neh', 'Ne',
  'Esther', 'Esth', 'Est',
  'Job', 'Jb',
  'Psalms', 'Psalm', 'Psa', 'Psm', 'Pss', 'Ps',
  'Proverbs', 'Prov', 'Pro', 'Prv', 'Pr',
  'Ecclesiastes', 'Eccles', 'Eccl', 'Ecc',
  'Song of Solomon', 'Song of Songs', 'Song', 'Canticles',
  'Isaiah', 'Isa', 'Is',
  'Jeremiah', 'Jer', 'Je',
  'Lamentations', 'Lam', 'La',
  'Ezekiel', 'Ezek', 'Ezk', 'Eze',
  'Daniel', 'Dan', 'Da', 'Dn',
  'Hosea', 'Hos', 'Ho',
  'Joel', 'Jol', 'Joe',
  'Amos', 'Amo',
  'Obadiah', 'Obad', 'Oba', 'Ob',
  'Jonah', 'Jona', 'Jon', 'Jnh',
  'Micah', 'Mic', 'Mc',
  'Nahum', 'Nah', 'Nam', 'Na',
  'Habakkuk', 'Hab', 'Hb',
  'Zephaniah', 'Zeph', 'Zep',
  'Haggai', 'Hag', 'Hg',
  'Zechariah', 'Zech', 'Zec',
  'Malachi', 'Mal', 'Ml',

  // NT
  'Matthew', 'Matt', 'Mat', 'Mt',
  'Mark', 'Mrk', 'Mk',
  'Luke', 'Luk', 'Lk', 'Lu',
  'John', 'Jhn', 'Jn', 'Joh',
  'Acts', 'Act', 'Ac',
  'Romans', 'Rom', 'Ro', 'Rm',
  '1 Corinthians', '1Corinthians', '1 Cor', '1cor', '1 Co', '1co', 'I Corinthians', 'I Cor',
  '2 Corinthians', '2Corinthians', '2 Cor', '2cor', '2 Co', '2co', 'II Corinthians', 'II Cor',
  'Galatians', 'Gal', 'Ga',
  'Ephesians', 'Eph', 'Ep',
  'Philippians', 'Phil', 'Php', 'Pp',
  'Colossians', 'Col', 'Co',
  '1 Thessalonians', '1Thessalonians', '1 Thess', '1thess', '1 Th', '1th', 'I Thessalonians', 'I Thess',
  '2 Thessalonians', '2Thessalonians', '2 Thess', '2thess', '2 Th', '2th', 'II Thessalonians', 'II Thess',
  '1 Timothy', '1Timothy', '1 Tim', '1tim', '1 Ti', '1ti', 'I Timothy', 'I Tim',
  '2 Timothy', '2Timothy', '2 Tim', '2tim', '2 Ti', '2ti', 'II Timothy', 'II Tim',
  'Titus', 'Tit', 'Ti',
  'Philemon', 'Philem', 'Phm', 'Pm',
  'Hebrews', 'Heb', 'He',
  'James', 'Jas', 'Jm',
  '1 Peter', '1Peter', '1 Pet', '1pet', '1 Pe', '1pe', '1 Pt', '1pt', 'I Peter', 'I Pet',
  '2 Peter', '2Peter', '2 Pet', '2pet', '2 Pe', '2pe', '2 Pt', '2pt', 'II Peter', 'II Pet',
  '1 John', '1John', '1 Jn', '1jn', '1 Jo', '1jo', 'I John', 'I Jn',
  '2 John', '2John', '2 Jn', '2jn', '2 Jo', '2jo', 'II John', 'II Jn',
  '3 John', '3John', '3 Jn', '3jn', '3 Jo', '3jo', 'III John', 'III Jn',
  'Jude', 'Jud', 'Jd',
  'Revelation', 'Revelations', 'Rev', 'Re'
];

// Sort books longest first to ensure greedy matching (e.g. "1 Corinthians" before "1 Cor")
const SORTED_BOOKS = [...BIBLE_BOOKS].sort((a, b) => b.length - a.length);
const BOOK_REGEX_STR = SORTED_BOOKS.map(b => b.replace(/\s+/g, '\\s+')).join('|');

// Regex to identify references like "Exodus 3:1-12", "Exodus 3:11", "Joshua 1:6, 7, 9", "1 Sam 16:7", "Psalm 78:70–72"
const BIBLE_REF_REGEX = new RegExp(
  `\\b(${BOOK_REGEX_STR})\\.?\\s+(\\d+)(?:\\s*:\\s*(\\d+)(?:\\s*(?:[-–—]|,\\s*\\d+(?:,\\s*\\d+)*|[-–—]\\s*\\d+)?\\s*(\\d+)?)?)?\\b`,
  'gi'
);

/**
 * Normalizes a raw matched reference string into a clean standard format that HelloAO understands.
 * E.g. "1 Sam 16:7" -> "1 Samuel 16:7" or "Exodus 3:1–12" -> "Exodus 3:1-12"
 */
export function normalizeReferenceForApi(raw: string): string {
  // Replace en-dash/em-dash with standard hyphen
  let clean = raw.replace(/[–—]/g, '-').trim();

  // If there are comma-separated verses like "Joshua 1:6, 7, 9", convert to range "Joshua 1:6-9"
  const commaMatch = clean.match(/^(.+?\s+\d+:\s*)(\d+)(?:\s*,\s*\d+)*\s*,\s*(\d+)$/);
  if (commaMatch) {
    clean = `${commaMatch[1]}${commaMatch[2]}-${commaMatch[3]}`;
  }

  return clean;
}

/**
 * Takes markdown text and transforms any recognized Bible references into custom links:
 * e.g. "Read Exodus 3:11 for context" -> "Read [Exodus 3:11](#bible-ref:Exodus%203%3A11) for context"
 * 
 * Safely avoids replacing references inside existing markdown links, URLs, or code spans.
 */
export function linkifyBibleReferences(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') return '';

  // 1. Temporarily extract code blocks, inline code, and existing markdown links
  const placeholders: string[] = [];
  const mask = (match: string) => {
    const key = `%%REF_MASK_${placeholders.length}%%`;
    placeholders.push(match);
    return key;
  };

  // Mask code blocks (```...```)
  let text = markdown.replace(/```[\s\S]*?```/g, mask);
  // Mask inline code (`...`)
  text = text.replace(/`[^`]+`/g, mask);
  // Mask existing markdown links ([...](...)) and images (![...](...))
  text = text.replace(/!?\[[^\]]*\]\([^\)]+\)/g, mask);
  // Mask raw URLs (http:// or https://)
  text = text.replace(/https?:\/\/[^\s\)]+/g, mask);

  // 2. Linkify Bible references in the remaining text
  text = text.replace(BIBLE_REF_REGEX, (fullMatch) => {
    const normalized = normalizeReferenceForApi(fullMatch);
    const parsed = parseBibleReference(normalized);
    if (!parsed) {
      return fullMatch; // Not a valid Bible reference, leave unchanged
    }

    return `[${fullMatch}](#bible-ref:${encodeURIComponent(normalized)})`;
  });

  // 3. Restore masked blocks
  text = text.replace(/%%REF_MASK_(\d+)%%/g, (_, index) => {
    return placeholders[parseInt(index, 10)] ?? '';
  });

  return text;
}
