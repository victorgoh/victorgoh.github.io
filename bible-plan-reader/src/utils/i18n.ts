import { en } from '../locales/en';

export type LanguageCode = 'en';

export function translate(
  _lang: string,
  key: string,
  params?: Record<string, string | number>
): string {
  const parts = key.split('.');
  let current: any = en;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      current = undefined;
      break;
    }
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
