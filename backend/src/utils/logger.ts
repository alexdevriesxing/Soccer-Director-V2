import { createLogger, format, transports } from 'winston';
import type { TransformableInfo } from 'logform';
import path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';
import process from 'node:process';

const { combine, timestamp, printf, colorize, json } = format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, ...meta }: TransformableInfo & { timestamp?: string }) => {
  return `${timestamp} [${level.toUpperCase()}] ${message} ${
    Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
  }`;
});

// Log directory
const logDir = path.join(process.cwd(), 'logs');

// Create logger instance
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', 
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json(),
    logFormat
  ),
  defaultMeta: { service: 'football-director' },
  transports: [
    // Console transport
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),
    // Daily rotate file transport for errors
    new DailyRotateFile({
      level: 'error',
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
    // Daily rotate file transport for all logs
    new DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
  exceptionHandlers: [
    new transports.File({ filename: path.join(logDir, 'exceptions.log') }),
  ],
  exitOnError: false,
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  throw reason;
});

export default logger;
export const httpStream = {
  write(message: string) {
    logger.info(message.trim());
  },
};
