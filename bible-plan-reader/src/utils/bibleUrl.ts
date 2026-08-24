import { parseBibleReference } from './helloAoBible';

export type SupportedBibleTranslation =
  | 'BSB'
  | 'ESV'
  | 'CSB'
  | 'NIV'
  | 'NLT'
  | 'NKJV'
  | 'NASB2020'
  | 'MSG'
  | 'NRSVUE'
  | 'AMP';

export interface BibleTranslationInfo {
  id: number;
  code: string;
  name: string;
  shortName: string;
}

export const BIBLE_TRANSLATIONS: Record<SupportedBibleTranslation, BibleTranslationInfo> = {
  BSB: {
    id: 3034,
    code: 'BSB',
    name: 'Berean Standard Bible',
    shortName: 'BSB'
  },
  ESV: {
    id: 59,
    code: 'ESV',
    name: 'English Standard Version',
    shortName: 'ESV'
  },
  CSB: {
    id: 1713,
    code: 'CSB',
    name: 'Christian Standard Bible',
    shortName: 'CSB'
  },
  NIV: {
    id: 111,
    code: 'NIV',
    name: 'New International Version',
    shortName: 'NIV'
  },
  NLT: {
    id: 116,
    code: 'NLT',
    name: 'New Living Translation',
    shortName: 'NLT'
  },
  NKJV: {
    id: 114,
    code: 'NKJV',
    name: 'New King James Version',
    shortName: 'NKJV'
  },
  NASB2020: {
    id: 2692,
    code: 'NASB2020',
    name: 'New American Standard Bible 2020',
    shortName: 'NASB 2020'
  },
  MSG: {
    id: 97,
    code: 'MSG',
    name: 'The Message',
    shortName: 'MSG'
  },
  NRSVUE: {
    id: 3523,
    code: 'NRSVUE',
    name: 'New Revised Standard Version Updated Edition',
    shortName: 'NRSVUE'
  },
  AMP: {
    id: 1588,
    code: 'AMP',
    name: 'Amplified Bible',
    shortName: 'AMP'
  }
};

export const SUPPORTED_TRANSLATION_KEYS: SupportedBibleTranslation[] = [
  'BSB',
  'ESV',
  'CSB',
  'NIV',
  'NLT',
  'NKJV',
  'NASB2020',
  'MSG',
  'NRSVUE',
  'AMP'
];

/**
 * Builds a deep link URL to YouVersion (Bible.com) for a given Scripture reference
 * and selected translation version.
 */
export function buildBibleComUrl(
  reference: string,
  translation: SupportedBibleTranslation = 'BSB',
  fallbackUrl?: string
): string {
  if (!reference) return fallbackUrl || '';

  const parsed = parseBibleReference(reference);
  const transInfo = BIBLE_TRANSLATIONS[translation] || BIBLE_TRANSLATIONS.BSB;

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
  if (fallbackUrl && fallbackUrl.includes('bible.com/bible/')) {
    return fallbackUrl.replace(
      /bible\.com\/bible\/\d+\/([A-Z0-9]+(?:\.\d+)*(?:-[0-9]+)?)\.[A-Z0-9]+/i,
      `bible.com/bible/${transInfo.id}/$1.${transInfo.code}`
    );
  }

  return fallbackUrl || `https://www.bible.com/bible/${transInfo.id}`;
}
