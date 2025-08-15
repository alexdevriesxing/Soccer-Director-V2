// Environment configuration
type NodeEnv = 'development' | 'production' | 'test';

// Simple environment variable access with defaults
const getEnv = (key: string, defaultValue: string): string => {
  if (typeof process === 'undefined' || !process.env) {
    return defaultValue;
  }
  return process.env[key] ?? defaultValue;
};

interface EnvConfig {
  PORT: number;
  NODE_ENV: NodeEnv;
  FRONTEND_URL: string;
  IS_DEVELOPMENT: boolean;
  IS_PRODUCTION: boolean;
  IS_TEST: boolean;
}

const env: EnvConfig = {
  PORT: parseInt(getEnv('PORT', '3001'), 10),
  NODE_ENV: getEnv('NODE_ENV', 'development') as NodeEnv,
  FRONTEND_URL: getEnv('FRONTEND_URL', 'http://localhost:3000'),
  get IS_DEVELOPMENT() {
    return this.NODE_ENV === 'development';
  },
  get IS_PRODUCTION() {
    return this.NODE_ENV === 'production';
  },
  get IS_TEST() {
    return this.NODE_ENV === 'test';
  },
} as const;

export default env;
