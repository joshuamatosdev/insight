import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import strictArchPlugin from './eslint-plugin-strict-architecture.js'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      'strict-architecture': strictArchPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Strict architecture rules
      'strict-architecture/no-naked-html': 'error',
      'strict-architecture/one-interface-per-file': 'warn',
      'strict-architecture/max-function-body-statements': ['warn', { max: 15 }],
      'strict-architecture/require-barrel-import': 'warn',
    },
  },
])
