// Type definitions for environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;
      FRONTEND_URL?: string;
      [key: string]: string | undefined;
    }
  }
}

// This ensures this file is treated as a module
export {};
