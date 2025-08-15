// ESLint v9+ flat config for a React + TypeScript monorepo
import js from '@eslint/js';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';

import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import testingLibrary from 'eslint-plugin-testing-library';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  {
    ignores: ['node_modules', 'dist', 'build'],
  },
  js.configs.recommended,
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    languageOptions: {
      globals: {
        jest: true,
        test: true,
        expect: true,
        beforeEach: true,
        afterEach: true,
        describe: true,
        it: true,
        global: true,
      },
    },

  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tseslintPlugin,
      'react': react,
      'react-hooks': reactHooks,
      'testing-library': testingLibrary,
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        fetch: true,
        console: true,
        alert: true,
        window: true,
        document: true,
        URLSearchParams: true,
      },
    },
    rules: {
      ...tseslintPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'testing-library/prefer-find-by': 'warn',
    },
  },
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: {
      globals: {
        require: true,
        module: true,
        process: true,
        __dirname: true,
        console: true,
        fetch: true,
        URLSearchParams: true,
      },
    },
  },
];
