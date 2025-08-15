"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_LANGUAGES = void 0;
exports.t = t;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const SUPPORTED_LANGUAGES = [
    'en', 'nl', 'de', 'fr', 'zh-Hant', 'zh-Hans', 'it', 'id', 'es', 'pt', 'el', 'hr', 'sr', 'pl', 'cs', 'sk', 'hu', 'bg', 'tr', 'ar', 'hi', 'ur', 'ja', 'no', 'da', 'sv', 'fi', 'ru', 'ro', 'sq', 'ko'
];
exports.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
const localeCache = {};
function loadLocale(lang) {
    if (localeCache[lang])
        return localeCache[lang];
    try {
        const filePath = path_1.default.join(__dirname, '../../locales', `${lang}.json`);
        const data = fs_1.default.readFileSync(filePath, 'utf-8');
        localeCache[lang] = JSON.parse(data);
        return localeCache[lang];
    }
    catch (e) {
        if (lang !== 'en')
            return loadLocale('en');
        return {};
    }
}
function t(key, lang = 'en') {
    const locale = loadLocale(lang);
    return locale[key] || loadLocale('en')[key] || key;
}
//# sourceMappingURL=i18n.js.map