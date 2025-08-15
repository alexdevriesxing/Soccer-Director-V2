// This file provides type definitions for global objects

// Ensure Node.js global types are available
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;
    FRONTEND_URL?: string;
    // Add other environment variables as needed
  }
}

// Ensure the `process` global is available
declare const process: NodeJS.Process;

declare global {
  // These are already available in CommonJS modules
  namespace NodeJS {
    interface Global {
      __filename: string;
      __dirname: string;
    }
  }
  
  const __filename: string;
  const __dirname: string;
}
