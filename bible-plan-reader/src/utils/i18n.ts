import { en } from '../locales/en';
import { zh } from '../locales/zh';
import { ms } from '../locales/ms';

export type LanguageCode = 'en' | 'zh' | 'ms';

const translations: Record<LanguageCode, any> = { en, zh, ms };

export function translate(
  lang: LanguageCode,
  key: string,
  params?: Record<string, string | number>
): string {
  const dict = translations[lang] || translations.en;

  const parts = key.split('.');
  let current = dict;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      current = undefined;
      break;
    }
  }

  // Fallback to English if not found in target dictionary
  if (current === undefined && lang !== 'en') {
    let fallback = translations.en;
    for (const part of parts) {
      if (fallback && typeof fallback === 'object' && part in fallback) {
        fallback = fallback[part];
      } else {
        fallback = undefined;
        break;
      }
    }
    current = fallback;
  }

  if (typeof current !== 'string') {
    return key;
  }

  if (params) {
    let parsed = current;
    for (const [paramKey, paramVal] of Object.entries(params)) {
      parsed = parsed.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramVal));
    }
    return parsed;
  }

  return current;
}
