/**
 * eslint-plugin-strict-architecture
 *
 * Custom ESLint plugin for enforcing extreme architectural constraints.
 * This transforms your linter into an architectural "judge".
 *
 * Rules:
 *   - one-interface-per-file: Only one interface/enum per file, must be in /types
 *   - no-naked-html: No raw HTML elements (div, span, main, etc.) - use components
 *   - max-function-body-statements: Limits executable statements in functions
 *   - require-barrel-import: Prevents deep imports into modules
 *
 * Usage in eslint.config.js:
 *   import strictArchPlugin from './eslint-plugin-strict-architecture.js';
 *   plugins: { 'strict-architecture': strictArchPlugin }
 */

const plugin = {
  meta: {
    name: 'eslint-plugin-strict-architecture',
    version: '1.0.0',
  },

  rules: {
    /**
     * one-interface-per-file
     *
     * Enforces:
     *   1. Only one interface OR enum per file
     *   2. Interfaces/enums must reside in a /types/ directory
     */
    'one-interface-per-file': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce one interface/enum per file in /types directory',
          category: 'Architecture',
          recommended: true,
        },
        messages: {
          multipleEntities: 'Strict Rule: Only one interface or enum allowed per file. Found {{ count }}.',
          wrongLocation: 'Strict Rule: Interfaces and enums must reside in a /types/ directory.',
        },
        schema: [],
      },

      create(context) {
        return {
          Program(node) {
            const fileName = context.filename ?? context.getFilename();

            // Skip index.ts files (barrel exports)
            if (fileName.endsWith('index.ts')) {
              return;
            }

            // Skip non-TypeScript files
            if (!fileName.endsWith('.ts') && !fileName.endsWith('.tsx')) {
              return;
            }

            // Count exported interfaces and enums
            const interfaces = [];
            const enums = [];
            const typeAliases = [];

            for (const statement of node.body) {
              if (statement.type === 'ExportNamedDeclaration' && statement.declaration) {
                if (statement.declaration.type === 'TSInterfaceDeclaration') {
                  interfaces.push(statement.declaration);
                } else if (statement.declaration.type === 'TSEnumDeclaration') {
                  enums.push(statement.declaration);
                } else if (statement.declaration.type === 'TSTypeAliasDeclaration') {
                  typeAliases.push(statement.declaration);
                }
              }

              if (statement.type === 'TSInterfaceDeclaration') {
                interfaces.push(statement);
              }
              if (statement.type === 'TSEnumDeclaration') {
                enums.push(statement);
              }
            }

            const totalEntities = interfaces.length + enums.length + typeAliases.length;
            const isInTypesDir = fileName.includes('/types/') || fileName.includes('\\types\\') || fileName.includes('.types.');

            // Rule 1: Only one entity per file
            if (totalEntities > 1) {
              context.report({
                node,
                messageId: 'multipleEntities',
                data: { count: totalEntities },
              });
            }

            // Rule 2: Entities must be in /types/ directory
            if (totalEntities > 0 && !isInTypesDir) {
              if (!fileName.endsWith('.d.ts')) {
                context.report({
                  node,
                  messageId: 'wrongLocation',
                });
              }
            }
          },
        };
      },
    },

    /**
     * no-naked-html
     *
     * Enforces component-driven development:
     * - No raw HTML elements (div, span, main, section, article, etc.)
     * - All UI must use semantic component wrappers
     * - Tailwind classes should only exist inside component definitions
     */
    'no-naked-html': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Forbid raw HTML elements - use component wrappers instead',
          category: 'Architecture',
          recommended: true,
        },
        messages: {
          nakedHtml: 'Raw HTML element <{{ element }}> is forbidden. Use a component wrapper instead (e.g., <Card>, <Flex>, <Stack>, <Section>).',
          nakedHtmlWithClass: 'Raw HTML element <{{ element }}> with className is forbidden. Tailwind should only exist inside component definitions.',
        },
        schema: [
          {
            type: 'object',
            properties: {
              forbiddenElements: {
                type: 'array',
                items: { type: 'string' },
              },
              allowedInComponents: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            additionalProperties: false,
          },
        ],
      },

      create(context) {
        const options = context.options[0] ?? {};

        // Elements that should NEVER be used directly in pages/features
        const forbiddenElements = options.forbiddenElements ?? [
          'div', 'span', 'main', 'section', 'article', 'aside', 'header', 'footer', 'nav',
          'ul', 'ol', 'li', 'dl', 'dt', 'dd',
          'figure', 'figcaption',
        ];

        // Directories where raw HTML is allowed (component definitions)
        const allowedDirs = [
          '/components/primitives/',
          '/components/layout/',
          '/components/ui/',
          '/components/catalyst/',
          '\\components\\primitives\\',
          '\\components\\layout\\',
          '\\components\\ui\\',
          '\\components\\catalyst\\',
        ];

        return {
          JSXOpeningElement(node) {
            const fileName = context.filename ?? context.getFilename();

            // Allow raw HTML in component definition directories
            const isInComponentDir = allowedDirs.some(dir => fileName.includes(dir));
            if (isInComponentDir) {
              return;
            }

            const elementName = node.name;
            if (elementName.type !== 'JSXIdentifier') {
              return;
            }

            const tagName = elementName.name;

            // Check if it's a forbidden element
            if (forbiddenElements.includes(tagName)) {
              // Check if it has className (using Tailwind)
              const hasClassName = node.attributes.some(
                attr => attr.type === 'JSXAttribute' &&
                        attr.name &&
                        attr.name.name === 'className'
              );

              if (hasClassName) {
                context.report({
                  node,
                  messageId: 'nakedHtmlWithClass',
                  data: { element: tagName },
                });
              } else {
                context.report({
                  node,
                  messageId: 'nakedHtml',
                  data: { element: tagName },
                });
              }
            }
          },
        };
      },
    },

    /**
     * max-function-body-statements
     *
     * Stricter than max-lines-per-function.
     * Counts actual executable statements, not lines.
     */
    'max-function-body-statements': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Limit the number of statements in a function body',
          category: 'Architecture',
          recommended: true,
        },
        messages: {
          tooManyStatements: 'Function has {{ count }} statements. Maximum allowed is {{ max }}.',
        },
        schema: [
          {
            type: 'object',
            properties: {
              max: { type: 'number', minimum: 1 },
            },
            additionalProperties: false,
          },
        ],
      },

      create(context) {
        const options = context.options[0] ?? {};
        const max = options.max ?? 10;

        function checkFunction(node) {
          const body = node.body;

          if (body.type !== 'BlockStatement') {
            return;
          }

          const statementCount = body.body.length;

          if (statementCount > max) {
            context.report({
              node,
              messageId: 'tooManyStatements',
              data: { count: statementCount, max },
            });
          }
        }

        return {
          FunctionDeclaration: checkFunction,
          FunctionExpression: checkFunction,
          ArrowFunctionExpression: checkFunction,
        };
      },
    },

    /**
     * require-barrel-import
     *
     * Enforces that imports use barrel (index.ts) files,
     * not deep internal paths.
     */
    'require-barrel-import': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Require imports from barrel files, not internal paths',
          category: 'Architecture',
          recommended: true,
        },
        messages: {
          deepImport: 'Deep import detected. Import from the barrel file instead: import { ... } from "@/{{ path }}"',
        },
        schema: [],
      },

      create(context) {
        return {
          ImportDeclaration(node) {
            const source = node.source.value;

            // Check for deep imports into component internals
            const deepImportPatterns = [
              /components\/domain\/\w+\/\w+/,
              /components\/layout\/\w+\/\w+/,
              /components\/primitives\/\w+\/\w+/,
            ];

            for (const pattern of deepImportPatterns) {
              if (pattern.test(source)) {
                context.report({
                  node,
                  messageId: 'deepImport',
                  data: { path: source.replace(/\/\w+$/, '') },
                });
                break;
              }
            }
          },
        };
      },
    },
  },
};

export default plugin;
