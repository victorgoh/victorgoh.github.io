/**
 * Utility for parsing Bible references and retrieving Scripture text via HelloAO Bible API
 * Documentation: https://bible.helloao.org/docs/
 */

// Mapping of book names and common aliases to USFM 3-letter book codes
const USFM_BOOK_MAP: Record<string, string> = {
  // Old Testament
  genesis: 'GEN', gen: 'GEN', ge: 'GEN', gn: 'GEN',
  exodus: 'EXO', exo: 'EXO', ex: 'EXO',
  leviticus: 'LEV', lev: 'LEV', le: 'LEV', lv: 'LEV',
  numbers: 'NUM', num: 'NUM', nu: 'NUM', nm: 'NUM', nb: 'NUM',
  deuteronomy: 'DEU', deut: 'DEU', de: 'DEU', dt: 'DEU',
  joshua: 'JOS', josh: 'JOS', jos: 'JOS',
  judges: 'JDG', judg: 'JDG', jdg: 'JDG', jg: 'JDG', jdgs: 'JDG',
  ruth: 'RUT', rut: 'RUT', rth: 'RUT', ru: 'RUT',
  '1 samuel': '1SA', '1samuel': '1SA', '1 sam': '1SA', '1sam': '1SA', '1 sa': '1SA', '1sa': '1SA', '1 s': '1SA', '1s': '1SA', 'i samuel': '1SA', 'i sam': '1SA',
  '2 samuel': '2SA', '2samuel': '2SA', '2 sam': '2SA', '2sam': '2SA', '2 sa': '2SA', '2sa': '2SA', '2 s': '2SA', '2s': '2SA', 'ii samuel': '2SA', 'ii sam': '2SA',
  '1 kings': '1KI', '1kings': '1KI', '1 kgs': '1KI', '1kgs': '1KI', '1 ki': '1KI', '1ki': '1KI', '1 k': '1KI', '1k': '1KI', 'i kings': '1KI', 'i kgs': '1KI',
  '2 kings': '2KI', '2kings': '2KI', '2 kgs': '2KI', '2kgs': '2KI', '2 ki': '2KI', '2ki': '2KI', '2 k': '2KI', '2k': '2KI', 'ii kings': '2KI', 'ii kgs': '2KI',
  '1 chronicles': '1CH', '1chronicles': '1CH', '1 chron': '1CH', '1chron': '1CH', '1 chr': '1CH', '1chr': '1CH', '1 ch': '1CH', '1ch': '1CH', 'i chron': '1CH',
  '2 chronicles': '2CH', '2chronicles': '2CH', '2 chron': '2CH', '2chron': '2CH', '2 chr': '2CH', '2chr': '2CH', '2 ch': '2CH', '2ch': '2CH', 'ii chron': '2CH',
  ezra: 'EZR', ezr: 'EZR', ez: 'EZR',
  nehemiah: 'NEH', neh: 'NEH', ne: 'NEH',
  esther: 'EST', esth: 'EST', est: 'EST', es: 'EST',
  job: 'JOB', jb: 'JOB',
  psalms: 'PSA', psalm: 'PSA', psa: 'PSA', psm: 'PSA', pss: 'PSA', ps: 'PSA',
  proverbs: 'PRO', prov: 'PRO', pro: 'PRO', prv: 'PRO', pr: 'PRO',
  ecclesiastes: 'ECC', eccles: 'ECC', ecc: 'ECC', ec: 'ECC', qoh: 'ECC', qoheleth: 'ECC',
  'song of solomon': 'SNG', 'song of songs': 'SNG', song: 'SNG', sng: 'SNG', sos: 'SNG', canticles: 'SNG', canticle: 'SNG',
  isaiah: 'ISA', isa: 'ISA', is: 'ISA',
  jeremiah: 'JER', jer: 'JER', je: 'JER', jr: 'JER',
  lamentations: 'LAM', lam: 'LAM', la: 'LAM',
  ezekiel: 'EZK', ezek: 'EZK', ezk: 'EZK', eze: 'EZK',
  daniel: 'DAN', dan: 'DAN', da: 'DAN', dn: 'DAN',
  hosea: 'HOS', hos: 'HOS', ho: 'HOS',
  joel: 'JOL', jol: 'JOL', joe: 'JOL', jl: 'JOL',
  amos: 'AMO', amo: 'AMO', am: 'AMO',
  obadiah: 'OBA', obad: 'OBA', oba: 'OBA', ob: 'OBA',
  jonah: 'JON', jona: 'JON', jon: 'JON', jnh: 'JON',
  micah: 'MIC', mic: 'MIC', mc: 'MIC',
  nahum: 'NAM', nah: 'NAM', nam: 'NAM', na: 'NAM',
  habakkuk: 'HAB', hab: 'HAB', hb: 'HAB',
  zephaniah: 'ZEP', zeph: 'ZEP', zep: 'ZEP', zp: 'ZEP',
  haggai: 'HAG', hag: 'HAG', hg: 'HAG',
  zechariah: 'ZEC', zech: 'ZEC', zec: 'ZEC', zc: 'ZEC',
  malachi: 'MAL', mal: 'MAL', ml: 'MAL',

  // New Testament
  matthew: 'MAT', matt: 'MAT', mat: 'MAT', mt: 'MAT',
  mark: 'MRK', mrk: 'MRK', mk: 'MRK', mr: 'MRK',
  luke: 'LUK', luk: 'LUK', lk: 'LUK', lu: 'LUK',
  john: 'JHN', jhn: 'JHN', jn: 'JHN', joh: 'JHN',
  acts: 'ACT', act: 'ACT', ac: 'ACT',
  romans: 'ROM', rom: 'ROM', ro: 'ROM', rm: 'ROM',
  '1 corinthians': '1CO', '1corinthians': '1CO', '1 cor': '1CO', '1cor': '1CO', '1 co': '1CO', '1co': '1CO', 'i corinthians': '1CO', 'i cor': '1CO',
  '2 corinthians': '2CO', '2corinthians': '2CO', '2 cor': '2CO', '2cor': '2CO', '2 co': '2CO', '2co': '2CO', 'ii corinthians': '2CO', 'ii cor': '2CO',
  galatians: 'GAL', gal: 'GAL', ga: 'GAL',
  ephesians: 'EPH', eph: 'EPH', ep: 'EPH',
  philippians: 'PHP', phil: 'PHP', php: 'PHP', pp: 'PHP',
  colossians: 'COL', col: 'COL', co: 'COL',
  '1 thessalonians': '1TH', '1thessalonians': '1TH', '1 thess': '1TH', '1thess': '1TH', '1 th': '1TH', '1th': '1TH', 'i thess': '1TH',
  '2 thessalonians': '2TH', '2thessalonians': '2TH', '2 thess': '2TH', '2thess': '2TH', '2 th': '2TH', '2th': '2TH', 'ii thess': '2TH',
  '1 timothy': '1TI', '1timothy': '1TI', '1 tim': '1TI', '1tim': '1TI', '1 ti': '1TI', '1ti': '1TI', 'i timothy': '1TI', 'i tim': '1TI',
  '2 timothy': '2TI', '2timothy': '2TI', '2 tim': '2TI', '2tim': '2TI', '2 ti': '2TI', '2ti': '2TI', 'ii timothy': '2TI', 'ii tim': '2TI',
  titus: 'TIT', tit: 'TIT', ti: 'TIT',
  philemon: 'PHM', philem: 'PHM', phm: 'PHM', pm: 'PHM',
  hebrews: 'HEB', heb: 'HEB', he: 'HEB',
  james: 'JAS', jas: 'JAS', jm: 'JAS', jam: 'JAS',
  '1 peter': '1PE', '1peter': '1PE', '1 pet': '1PE', '1pet': '1PE', '1 pe': '1PE', '1pe': '1PE', '1 pt': '1PE', '1pt': '1PE', 'i peter': '1PE', 'i pet': '1PE',
  '2 peter': '2PE', '2peter': '2PE', '2 pet': '2PE', '2pet': '2PE', '2 pe': '2PE', '2pe': '2PE', '2 pt': '2PE', '2pt': '2PE', 'ii peter': '2PE', 'ii pet': '2PE',
  '1 john': '1JN', '1john': '1JN', '1 jn': '1JN', '1jn': '1JN', '1 jo': '1JN', '1jo': '1JN', '1 jhn': '1JN', '1jhn': '1JN', 'i john': '1JN', 'i jn': '1JN',
  '2 john': '2JN', '2john': '2JN', '2 jn': '2JN', '2jn': '2JN', '2 jo': '2JN', '2jo': '2JN', '2 jhn': '2JN', '2jhn': '2JN', 'ii john': '2JN', 'ii jn': '2JN',
  '3 john': '3JN', '3john': '3JN', '3 jn': '3JN', '3jn': '3JN', '3 jo': '3JN', '3jo': '3JN', '3 jhn': '3JN', '3jhn': '3JN', 'iii john': '3JN', 'iii jn': '3JN',
  jude: 'JUD', jud: 'JUD', jd: 'JUD',
  revelation: 'REV', rev: 'REV', re: 'REV', revelations: 'REV', apocalypse: 'REV'
};

// Supported translation codes mapping to HelloAO translation IDs
export const HELLOAO_TRANSLATION_MAP: Record<string, { id: string; name: string }> = {
  BSB: { id: 'BSB', name: 'Berean Standard Bible (BSB)' },
  WEB: { id: 'ENGWEBP', name: 'World English Bible (WEB)' },
  KJV: { id: 'eng_kjv', name: 'King James Version (KJV)' },
  CU1: { id: 'cmn_cu1', name: 'Chinese Union Version Simplified (新标点和合本-简)' },
  CUV: { id: 'cmn_cuv', name: 'Chinese Union Version Traditional (新標點和合本-繁)' },
  TB:  { id: 'ind_tb',  name: 'Indonesian Terjemahan Baru (TB)' },
  // Backward compatibility alias mappings
  NIV: { id: 'BSB', name: 'Berean Standard Bible (BSB)' },
  ESV: { id: 'BSB', name: 'Berean Standard Bible (BSB)' },
  NASB: { id: 'BSB', name: 'Berean Standard Bible (BSB)' },
  AVB: { id: 'ind_tb', name: 'Indonesian / Malay Bible' },
  IND: { id: 'ind_tb', name: 'Indonesian Terjemahan Baru (TB)' }
};

export interface ParsedReference {
  bookCode: string;
  chapter: number;
  startVerse?: number;
  endVerse?: number;
}

/**
 * Parses a standard Bible reference string (e.g. "John 1:1-4", "1 Corinthians 13:4-7", "Psalm 23")
 */
export function parseBibleReference(ref: string): ParsedReference | null {
  if (!ref || typeof ref !== 'string') return null;

  const cleanRef = ref.trim().replace(/\s+/g, ' ');

  // Regex pattern matching:
  // Group 1: Book name (including leading number, e.g. "1 Corinthians", "1Cor", "1Jn", "John", "Psalm")
  // Group 2: Chapter number
  // Group 3: Optional start verse (after colon)
  // Group 4: Optional end verse (after dash or hyphen)
  const pattern = /^((?:[1-3I|ii|iii]\s*)?[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?)\s*(\d+)(?:\s*:\s*(\d+)(?:\s*[-–—]\s*(\d+))?)?$/i;
  const match = cleanRef.match(pattern);

  if (!match) {
    // Try single-chapter book without colon (e.g. "Jude 4" or "Obadiah 1-4")
    const shortPattern = /^((?:[1-3I|ii|iii]\s*)?[A-Za-z]+)\s+(\d+)(?:\s*[-–—]\s*(\d+))?$/i;
    const shortMatch = cleanRef.match(shortPattern);
    if (!shortMatch) return null;

    const bookKey = shortMatch[1].toLowerCase().replace(/\s+/g, ' ');
    const bookCode = USFM_BOOK_MAP[bookKey];
    if (!bookCode) return null;

    const num1 = parseInt(shortMatch[2], 10);
    const num2 = shortMatch[3] ? parseInt(shortMatch[3], 10) : undefined;

    // Single chapter books (OBADIAH, PHILEMON, 2 JOHN, 3 JOHN, JUDE)
    const singleChapterBooks = ['OBA', 'PHM', '2JN', '3JN', 'JUD'];
    if (singleChapterBooks.includes(bookCode)) {
      return {
        bookCode,
        chapter: 1,
        startVerse: num1,
        endVerse: num2 || num1
      };
    }

    // Otherwise treated as a whole chapter
    return {
      bookCode,
      chapter: num1
    };
  }

  const rawBook = match[1].toLowerCase().replace(/\s+/g, ' ').trim();
  const bookCode = USFM_BOOK_MAP[rawBook];
  if (!bookCode) return null;

  const chapter = parseInt(match[2], 10);
  const startVerse = match[3] ? parseInt(match[3], 10) : undefined;
  const endVerse = match[4] ? parseInt(match[4], 10) : startVerse;

  return {
    bookCode,
    chapter,
    startVerse,
    endVerse
  };
}

// In-memory chapter cache: key = `${translationId}_${bookCode}_${chapter}`
const memoryCache: Record<string, any> = {};

/**
 * Fetches chapter data from HelloAO Bible API with multi-tier caching
 */
async function fetchHelloAoChapter(translationId: string, bookCode: string, chapter: number): Promise<any> {
  const cacheKey = `helloao_chapter_${translationId}_${bookCode}_${chapter}`;

  // 1. Check in-memory cache
  if (memoryCache[cacheKey]) {
    return memoryCache[cacheKey];
  }

  // 2. Check localStorage cache
  try {
    if (typeof localStorage !== 'undefined') {
      const localCached = localStorage.getItem(cacheKey);
      if (localCached) {
        const parsed = JSON.parse(localCached);
        memoryCache[cacheKey] = parsed;
        return parsed;
      }
    }
  } catch (e) {
    // Ignore localStorage errors
  }

  // 3. Fetch from HelloAO API simple JSON endpoint
  const url = `https://bible.helloao.org/api/${translationId}/${bookCode}/${chapter}.simple.json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HelloAO API returned HTTP status ${res.status}`);
  }

  const data = await res.json();
  memoryCache[cacheKey] = data;

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(cacheKey, JSON.stringify(data));
    }
  } catch (e) {
    // localStorage may be full; safe to ignore
  }

  return data;
}

/**
 * Fetches formatted Scripture text for any Bible reference via HelloAO API
 */
export async function fetchHelloAoPassage(
  reference: string,
  preferredTranslation = 'BSB'
): Promise<string> {
  const parsed = parseBibleReference(reference);
  if (!parsed) {
    throw new Error(`Unable to parse Bible reference: "${reference}"`);
  }

  const transConfig = HELLOAO_TRANSLATION_MAP[preferredTranslation] || HELLOAO_TRANSLATION_MAP.BSB;
  const translationId = transConfig.id;

  const data = await fetchHelloAoChapter(translationId, parsed.bookCode, parsed.chapter);
  if (!data?.chapter?.content) {
    throw new Error(`No content found for ${reference}`);
  }

  const verses = data.chapter.content.filter((item: any) => {
    if (item.type !== 'verse') return false;
    const vNum = parseInt(item.number, 10);
    if (isNaN(vNum)) return false;

    if (parsed.startVerse !== undefined) {
      if (parsed.endVerse !== undefined) {
        return vNum >= parsed.startVerse && vNum <= parsed.endVerse;
      }
      return vNum === parsed.startVerse;
    }
    return true; // Whole chapter
  });

  if (verses.length === 0) {
    throw new Error(`Verse range not found for ${reference}`);
  }

  return verses
    .map((v: any) => `**${v.number}** ${v.text.trim()}`)
    .join('\n\n');
}
