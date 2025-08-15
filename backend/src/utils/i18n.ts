import fs from 'fs';
import path from 'path';

const SUPPORTED_LANGUAGES = [
  'en', 'nl', 'de', 'fr', 'zh-Hant', 'zh-Hans', 'it', 'id', 'es', 'pt', 'el', 'hr', 'sr', 'pl', 'cs', 'sk', 'hu', 'bg', 'tr', 'ar', 'hi', 'ur', 'ja', 'no', 'da', 'sv', 'fi', 'ru', 'ro', 'sq', 'ko'
];

const localeCache: Record<string, any> = {};

function loadLocale(lang: string) {
  if (localeCache[lang]) return localeCache[lang];
  try {
    const filePath = path.join(__dirname, '../../locales', `${lang}.json`);
    const data = fs.readFileSync(filePath, 'utf-8');
    localeCache[lang] = JSON.parse(data);
    return localeCache[lang];
  } catch (e) {
    if (lang !== 'en') return loadLocale('en');
    return {};
  }
}

export function t(key: string, lang: string = 'en'): string {
  const locale = loadLocale(lang);
  return locale[key] || loadLocale('en')[key] || key;
}

export { SUPPORTED_LANGUAGES }; 