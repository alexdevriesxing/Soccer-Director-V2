"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.languageMiddleware = languageMiddleware;
const i18n_1 = require("../utils/i18n");
function languageMiddleware(req, res, next) {
    let lang = req.headers['accept-language'] || req.query.lang || 'en';
    if (!i18n_1.SUPPORTED_LANGUAGES.includes(lang))
        lang = 'en';
    req.language = lang;
    next();
}
