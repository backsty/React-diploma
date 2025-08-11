import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  // Базовые рекомендации JavaScript
  js.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
      },
      globals: {
        ...globals.browser,
        ...globals.es2020,
        // Явно добавляем DOM типы
        Response: 'readonly',
        RequestInit: 'readonly',
        AbortController: 'readonly',
        StorageEvent: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // TypeScript правила
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // React правила
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      
      // React Hooks правила
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // React Refresh
      'react-refresh/only-export-components': ['warn', {
        allowConstantExport: true,
      }],
      
      // Базовые правила
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-undef': 'off', // Отключаем, так как TypeScript сам проверяет
    },
  },

  {
    ignores: [
      'dist/',
      'build/',
      'node_modules/',
      'coverage/',
      'public/',
      'src/htmlTemplates--unused/',
      '.vite/',
      '*.log',
    ],
  },
];