import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import sonarjsPlugin from "eslint-plugin-sonarjs";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import strictArchPlugin from './eslint-plugin-strict-architecture.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sharedPlugins = {
  "@typescript-eslint": tseslint,
  react: reactPlugin,
  "react-hooks": reactHooksPlugin,
  import: importPlugin,
  "jsx-a11y": jsxA11yPlugin,
  "simple-import-sort": simpleImportSortPlugin,
  sonarjs: sonarjsPlugin,
  "strict-architecture": strictArchPlugin,
};

const sharedSettings = {
  react: { version: "detect" },
  "import/parsers": {
    "@typescript-eslint/parser": [".ts", ".tsx"],
  },
  "import/resolver": {
    typescript: {
      alwaysTryTypes: true,
      project: path.join(__dirname, "tsconfig.app.json"),
    },
  },
};

const strictTypeScriptRules = {
  // Keep TS as the source of truth for "undefined vars"
  "no-undef": "off",

  // Prefer TS-aware unused vars
  "no-unused-vars": "off",
  "@typescript-eslint/no-unused-vars": [
    "error",
    { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
  ],

  // Strict / correctness (type-aware)
  "@typescript-eslint/await-thenable": "error",
  "@typescript-eslint/no-floating-promises": [
    "error",
    { ignoreIIFE: false, ignoreVoid: false },
  ],
  "@typescript-eslint/no-misused-promises": [
    "error",
    { checksVoidReturn: { attributes: false } },
  ],
  "@typescript-eslint/no-unnecessary-type-assertion": "error",
  "@typescript-eslint/no-unnecessary-condition": "error",
  "@typescript-eslint/switch-exhaustiveness-check": "error",

  // The "unsafe *" family (this is where strict TS linting gets real)
  "@typescript-eslint/no-unsafe-argument": "error",
  "@typescript-eslint/no-unsafe-assignment": "error",
  "@typescript-eslint/no-unsafe-call": "error",
  "@typescript-eslint/no-unsafe-member-access": "error",
  "@typescript-eslint/no-unsafe-return": "error",

  // Tighten common footguns
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-non-null-assertion": "error",
  "@typescript-eslint/unbound-method": "error",

  // Consistency
  "@typescript-eslint/consistent-type-imports": [
    "error",
    { prefer: "type-imports", fixStyle: "separate-type-imports" },
  ],
  "@typescript-eslint/consistent-type-exports": "error",
  "@typescript-eslint/no-import-type-side-effects": "error",

  // Safer coercions / strings
  "@typescript-eslint/restrict-template-expressions": [
    "error",
    {
      allowNumber: true,
      allowBoolean: false,
      allowAny: false,
      allowNullish: false,
    },
  ],
  "@typescript-eslint/restrict-plus-operands": "error",
  "@typescript-eslint/no-base-to-string": "error",

  // CRITICAL: Very strict boolean usage (fixes "Cannot read properties of undefined")
  "@typescript-eslint/strict-boolean-expressions": [
    "error",
    {
      allowString: false,
      allowNumber: false,
      allowNullableObject: false,
      allowNullableBoolean: false,
      allowNullableString: false,
      allowNullableNumber: false,
      allowAny: false,
    },
  ],

  // General code quality
  "no-console": "warn",
  "no-debugger": "warn",
  "prefer-const": "error",
  "no-var": "error",
  "arrow-body-style": ["error", "as-needed"],
  "no-param-reassign": ["error", { props: false }],
  "max-len": [
    "warn",
    { code: 120, ignoreStrings: true, ignoreTemplateLiterals: true },
  ],

  // React
  "react/jsx-uses-react": "off",
  "react/react-in-jsx-scope": "off",
  "react/prop-types": "off",
  "react/jsx-props-no-spreading": "off",
  "react/jsx-filename-extension": ["warn", { extensions: [".tsx"] }],
  "react/function-component-definition": [
    "error",
    {
      namedComponents: "function-declaration",
      unnamedComponents: "arrow-function",
    },
  ],

  // React hooks
  "react-hooks/rules-of-hooks": "error",
  "react-hooks/exhaustive-deps": "warn",

  // Imports
  "import/extensions": [
    "error",
    "ignorePackages",
    { ts: "never", tsx: "never", js: "never", jsx: "never" },
  ],
  "import/no-extraneous-dependencies": [
    "error",
    {
      devDependencies: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "**/test/**",
        "**/__tests__/**",
        "vite.config.ts",
        "vitest.config.ts",
      ],
    },
  ],
  "import/prefer-default-export": "off",
  "import/order": [
    "error",
    {
      groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "never",
      alphabetize: { order: "asc", caseInsensitive: true },
    },
  ],

  // a11y - STRICT mode (WCAG 2.1 AA/AAA compliance)
  "jsx-a11y/alt-text": "error",
  "jsx-a11y/anchor-has-content": "error",
  "jsx-a11y/anchor-is-valid": [
    "error",
    {
      components: ["Link"],
      specialLink: ["to", "href"],
      aspects: ["noHref", "invalidHref", "preferButton"],
    },
  ],
  "jsx-a11y/aria-activedescendant-has-tabindex": "error",
  "jsx-a11y/aria-props": "error",
  "jsx-a11y/aria-proptypes": "error",
  "jsx-a11y/aria-role": ["error", { ignoreNonDOM: true }],
  "jsx-a11y/aria-unsupported-elements": "error",
  "jsx-a11y/autocomplete-valid": "error",
  "jsx-a11y/click-events-have-key-events": "error",
  "jsx-a11y/heading-has-content": "error",
  "jsx-a11y/html-has-lang": "error",
  "jsx-a11y/iframe-has-title": "error",
  "jsx-a11y/img-redundant-alt": "error",
  "jsx-a11y/interactive-supports-focus": [
    "error",
    {
      tabbable: [
        "button",
        "checkbox",
        "link",
        "searchbox",
        "spinbutton",
        "switch",
        "textbox",
      ],
    },
  ],
  "jsx-a11y/label-has-associated-control": [
    "error",
    {
      labelComponents: ["Label"],
      labelAttributes: ["label"],
      controlComponents: ["Input", "Select", "Textarea"],
      depth: 3,
    },
  ],
  "jsx-a11y/lang": "error",
  "jsx-a11y/media-has-caption": "error",
  "jsx-a11y/mouse-events-have-key-events": "error",
  "jsx-a11y/no-access-key": "error",
  "jsx-a11y/no-autofocus": "error",
  "jsx-a11y/no-distracting-elements": "error",
  "jsx-a11y/no-interactive-element-to-noninteractive-role": [
    "error",
    { tr: ["none", "presentation"] },
  ],
  "jsx-a11y/no-noninteractive-element-interactions": [
    "error",
    {
      handlers: [
        "onClick",
        "onMouseDown",
        "onMouseUp",
        "onKeyPress",
        "onKeyDown",
        "onKeyUp",
      ],
    },
  ],
  "jsx-a11y/no-noninteractive-element-to-interactive-role": [
    "error",
    {
      ul: ["listbox", "menu", "menubar", "radiogroup", "tablist", "tree", "treegrid"],
      ol: ["listbox", "menu", "menubar", "radiogroup", "tablist", "tree", "treegrid"],
      li: ["menuitem", "option", "row", "tab", "treeitem"],
      table: ["grid"],
      td: ["gridcell"],
    },
  ],
  "jsx-a11y/no-noninteractive-tabindex": [
    "error",
    { tags: [], roles: ["tabpanel"], allowExpressionValues: true },
  ],
  "jsx-a11y/no-redundant-roles": "error",
  "jsx-a11y/no-static-element-interactions": [
    "error",
    {
      handlers: [
        "onClick",
        "onMouseDown",
        "onMouseUp",
        "onKeyPress",
        "onKeyDown",
        "onKeyUp",
      ],
      allowExpressionValues: true,
    },
  ],
  "jsx-a11y/role-has-required-aria-props": "error",
  "jsx-a11y/role-supports-aria-props": "error",
  "jsx-a11y/scope": "error",
  "jsx-a11y/tabindex-no-positive": "error",

  // SonarJS - code quality & bug detection
  "sonarjs/no-duplicate-string": ["warn", { threshold: 3 }],
  "sonarjs/no-identical-functions": "warn",
  "sonarjs/cognitive-complexity": ["warn", 15],
  "sonarjs/no-collapsible-if": "warn",
  "sonarjs/no-redundant-jump": "error",
  "sonarjs/no-unused-collection": "error",
  "sonarjs/prefer-immediate-return": "warn",
  "sonarjs/no-nested-template-literals": "warn",

  // Domain Architecture Boundaries
  "no-restricted-imports": [
    "error",
    {
      patterns: [
        {
          group: ["@/components/*/*/**"],
          message: "Deep imports into component internals are forbidden. Use the component's barrel file (index.ts) instead.",
        },
      ],
    },
  ],

  // Strict architecture rules (custom plugin)
  "strict-architecture/no-naked-html": "error",
  "strict-architecture/one-interface-per-file": "warn",
  "strict-architecture/max-function-body-statements": ["warn", { max: 15 }],
  "strict-architecture/require-barrel-import": "warn",
  "strict-architecture/no-redundant-dark-overrides": "warn",
  "strict-architecture/no-hardcoded-test-strings": "warn",
};

export default [
  js.configs.recommended,

  // Global ignores
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      ".vite/**",
      "src/components/studio_ui_base/**",
    ],
  },

  // App source (browser + react) — uses tsconfig.app.json for type-aware linting
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        tsconfigRootDir: __dirname,
        project: [path.join(__dirname, "tsconfig.app.json")],
      },
      globals: { ...globals.browser, ...globals.es2021 },
    },
    plugins: sharedPlugins,
    settings: sharedSettings,
    rules: strictTypeScriptRules,
  },

  // Tooling / node configs — uses tsconfig.node.json for type-aware linting
  {
    files: ["vite.config.ts", "vitest.config.ts", "**/*.config.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        tsconfigRootDir: __dirname,
        project: [path.join(__dirname, "tsconfig.node.json")],
      },
      globals: { ...globals.node, ...globals.es2021 },
    },
    plugins: sharedPlugins,
    settings: {
      ...sharedSettings,
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: path.join(__dirname, "tsconfig.node.json"),
        },
      },
    },
    rules: strictTypeScriptRules,
  },

  // Tests — allow pragmatism for mocks and assertions
  {
    files: ["**/*.{test,spec}.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "sonarjs/no-duplicate-string": "off",
      "import/order": "off",
      "no-console": "off",
      "strict-architecture/no-hardcoded-test-strings": "off",

      // Keep these ON - catch real async test bugs
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
    },
  },

  // Catalyst UI components — relax some strict rules (third-party patterns)
  {
    files: ["src/components/catalyst/**/*.{ts,tsx}", "src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
    },
  },
];
