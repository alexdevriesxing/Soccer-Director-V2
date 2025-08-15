import { Request, Response, NextFunction } from 'express';
import { SUPPORTED_LANGUAGES } from '../utils/i18n';

declare module 'express-serve-static-core' {
  interface Request {
    language?: string;
  }
}

export function languageMiddleware(req: Request, res: Response, next: NextFunction) {
  let lang = req.headers['accept-language'] as string || req.query.lang as string || 'en';
  if (!SUPPORTED_LANGUAGES.includes(lang)) lang = 'en';
  req.language = lang;
  next();
} 