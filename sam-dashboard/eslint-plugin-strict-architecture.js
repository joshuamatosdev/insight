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
 *   - no-redundant-dark-overrides: Prevents dark: classes when semantic tokens handle it
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

            // Skip Catalyst UI components - they use colocated types pattern
            const catalystDirs = [
              '/components/catalyst/',
              '\\components\\catalyst\\',
              '/components/ui/',
              '\\components\\ui\\',
            ];
            const isInCatalystDir = catalystDirs.some(dir => fileName.includes(dir));
            if (isInCatalystDir) {
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

            // Allow direct imports from Catalyst/UI directories (they use compound components)
            if (source.includes('components/catalyst/') || source.includes('components/ui/')) {
              return;
            }

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

    /**
     * no-redundant-dark-overrides
     *
     * Detects redundant dark: Tailwind classes when semantic tokens are used.
     * Semantic tokens (e.g., text-success, bg-danger-bg) already include dark mode
     * support via CSS custom properties, making explicit dark: overrides unnecessary.
     *
     * Examples of violations:
     *   - "text-success dark:text-emerald-400" -> should be just "text-success"
     *   - "bg-danger-bg dark:bg-red-950" -> should be just "bg-danger-bg"
     */
    'no-redundant-dark-overrides': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Disallow redundant dark: classes when semantic tokens handle dark mode',
          category: 'Styling',
          recommended: true,
        },
        fixable: 'code',
        messages: {
          redundantDarkOverride:
            'Redundant dark mode override "{{ darkClass }}" - the semantic token "{{ semanticToken }}" already handles dark mode.',
        },
        schema: [],
      },

      create(context) {
        // Map of semantic tokens to their redundant dark: patterns
        const semanticTokenPatterns = [
          // Text colors - status
          { semantic: /\btext-success\b/, dark: /\bdark:text-emerald-\d+\b/g },
          { semantic: /\btext-danger\b/, dark: /\bdark:text-red-\d+\b/g },
          { semantic: /\btext-warning\b/, dark: /\bdark:text-amber-\d+\b/g },
          { semantic: /\btext-info\b/, dark: /\bdark:text-cyan-\d+\b/g },
          // Text colors - semantic text variants
          { semantic: /\btext-success-text\b/, dark: /\bdark:text-emerald-\d+\b/g },
          { semantic: /\btext-danger-text\b/, dark: /\bdark:text-red-\d+\b/g },
          { semantic: /\btext-warning-text\b/, dark: /\bdark:text-amber-\d+\b/g },
          { semantic: /\btext-info-text\b/, dark: /\bdark:text-cyan-\d+\b/g },
          // Text colors - accent
          { semantic: /\btext-accent\b/, dark: /\bdark:text-cyan-\d+\b/g },
          // Background colors - status
          { semantic: /\bbg-success\b/, dark: /\bdark:bg-emerald-\d+\b/g },
          { semantic: /\bbg-danger\b/, dark: /\bdark:bg-red-\d+\b/g },
          { semantic: /\bbg-warning\b/, dark: /\bdark:bg-amber-\d+\b/g },
          { semantic: /\bbg-info\b/, dark: /\bdark:bg-cyan-\d+\b/g },
          // Background colors - semantic bg variants
          { semantic: /\bbg-success-bg\b/, dark: /\bdark:bg-emerald-\d+(?:\/\d+)?\b/g },
          { semantic: /\bbg-danger-bg\b/, dark: /\bdark:bg-red-\d+(?:\/\d+)?\b/g },
          { semantic: /\bbg-warning-bg\b/, dark: /\bdark:bg-amber-\d+(?:\/\d+)?\b/g },
          { semantic: /\bbg-info-bg\b/, dark: /\bdark:bg-cyan-\d+(?:\/\d+)?\b/g },
          // Background colors - accent
          { semantic: /\bbg-accent\b/, dark: /\bdark:bg-cyan-\d+\b/g },
          { semantic: /\bbg-accent-light\b/, dark: /\bdark:bg-cyan-\d+(?:\/\d+)?\b/g },
          // Surface colors
          { semantic: /\bbg-surface\b/, dark: /\bdark:bg-zinc-\d+\b/g },
          { semantic: /\btext-on-surface\b/, dark: /\bdark:text-zinc-\d+\b/g },
          { semantic: /\btext-on-surface-muted\b/, dark: /\bdark:text-zinc-\d+\b/g },
          // Border colors
          { semantic: /\bborder-success\b/, dark: /\bdark:border-emerald-\d+\b/g },
          { semantic: /\bborder-danger\b/, dark: /\bdark:border-red-\d+\b/g },
          { semantic: /\bborder-warning\b/, dark: /\bdark:border-amber-\d+\b/g },
          { semantic: /\bborder-info\b/, dark: /\bdark:border-cyan-\d+\b/g },
          // Ring colors
          { semantic: /\bring-success\b/, dark: /\bdark:ring-emerald-\d+(?:\/\d+)?\b/g },
          { semantic: /\bring-danger\b/, dark: /\bdark:ring-red-\d+(?:\/\d+)?\b/g },
          { semantic: /\bring-warning\b/, dark: /\bdark:ring-amber-\d+(?:\/\d+)?\b/g },
          { semantic: /\bring-info\b/, dark: /\bdark:ring-cyan-\d+(?:\/\d+)?\b/g },
        ];

        /**
         * Check a className string for redundant dark: overrides
         */
        function checkClassString(classString, node, fixer) {
          const violations = [];

          for (const pattern of semanticTokenPatterns) {
            const semanticMatch = classString.match(pattern.semantic);
            if (semanticMatch !== null) {
              // Reset regex lastIndex
              pattern.dark.lastIndex = 0;
              let darkMatch;
              while ((darkMatch = pattern.dark.exec(classString)) !== null) {
                violations.push({
                  semanticToken: semanticMatch[0],
                  darkClass: darkMatch[0],
                });
              }
            }
          }

          return violations;
        }

        /**
         * Get the string value from a node (handles string literals and template literals)
         */
        function getStringValue(node) {
          if (node.type === 'Literal' && typeof node.value === 'string') {
            return { value: node.value, node };
          }
          if (node.type === 'TemplateLiteral' && node.quasis.length === 1) {
            return { value: node.quasis[0].value.raw, node };
          }
          return null;
        }

        /**
         * Create a fixer that removes the redundant dark: classes
         */
        function createFixer(node, originalValue, violations) {
          return function (fixer) {
            let newValue = originalValue;
            for (const v of violations) {
              // Remove the dark class and any extra whitespace
              newValue = newValue.replace(new RegExp(`\\s*${v.darkClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`), ' ');
            }
            // Clean up multiple spaces
            newValue = newValue.replace(/\s+/g, ' ').trim();

            if (node.type === 'Literal') {
              return fixer.replaceText(node, `'${newValue}'`);
            }
            if (node.type === 'TemplateLiteral') {
              return fixer.replaceText(node, `\`${newValue}\``);
            }
            return null;
          };
        }

        return {
          JSXAttribute(node) {
            // Only check className attributes
            if (node.name.name !== 'className') {
              return;
            }

            const value = node.value;
            if (value === null || value === undefined) {
              return;
            }

            // Handle string literals: className="..."
            if (value.type === 'Literal' && typeof value.value === 'string') {
              const violations = checkClassString(value.value, value);
              for (const v of violations) {
                context.report({
                  node: value,
                  messageId: 'redundantDarkOverride',
                  data: { darkClass: v.darkClass, semanticToken: v.semanticToken },
                  fix: createFixer(value, value.value, [v]),
                });
              }
              return;
            }

            // Handle JSX expressions: className={...}
            if (value.type === 'JSXExpressionContainer') {
              const expr = value.expression;

              // Simple string in expression: className={'...'}
              const strVal = getStringValue(expr);
              if (strVal !== null) {
                const violations = checkClassString(strVal.value, strVal.node);
                for (const v of violations) {
                  context.report({
                    node: strVal.node,
                    messageId: 'redundantDarkOverride',
                    data: { darkClass: v.darkClass, semanticToken: v.semanticToken },
                    fix: createFixer(strVal.node, strVal.value, [v]),
                  });
                }
              }

              // Template literal: className={`...`}
              if (expr.type === 'TemplateLiteral') {
                // Check each quasi (static part)
                for (const quasi of expr.quasis) {
                  const quasiValue = quasi.value.raw;
                  const violations = checkClassString(quasiValue, expr);
                  for (const v of violations) {
                    context.report({
                      node: expr,
                      messageId: 'redundantDarkOverride',
                      data: { darkClass: v.darkClass, semanticToken: v.semanticToken },
                      // Auto-fix is complex for template literals with expressions, skip
                    });
                  }
                }
              }

              // clsx/cn call: className={clsx(...)} or className={cn(...)}
              if (expr.type === 'CallExpression') {
                const callee = expr.callee;
                const isClsxCall =
                  (callee.type === 'Identifier' && (callee.name === 'clsx' || callee.name === 'cn')) ||
                  (callee.type === 'MemberExpression' && callee.property.name === 'clsx');

                if (isClsxCall) {
                  for (const arg of expr.arguments) {
                    const strVal = getStringValue(arg);
                    if (strVal !== null) {
                      const violations = checkClassString(strVal.value, strVal.node);
                      for (const v of violations) {
                        context.report({
                          node: strVal.node,
                          messageId: 'redundantDarkOverride',
                          data: { darkClass: v.darkClass, semanticToken: v.semanticToken },
                          fix: createFixer(strVal.node, strVal.value, [v]),
                        });
                      }
                    }
                  }
                }
              }

              // Ternary: className={condition ? '...' : '...'}
              if (expr.type === 'ConditionalExpression') {
                for (const branch of [expr.consequent, expr.alternate]) {
                  const strVal = getStringValue(branch);
                  if (strVal !== null) {
                    const violations = checkClassString(strVal.value, strVal.node);
                    for (const v of violations) {
                      context.report({
                        node: strVal.node,
                        messageId: 'redundantDarkOverride',
                        data: { darkClass: v.darkClass, semanticToken: v.semanticToken },
                        fix: createFixer(strVal.node, strVal.value, [v]),
                      });
                    }
                  }
                }
              }
            }
          },

          // Also check object properties (for style objects with className keys)
          Property(node) {
            if (node.key.type === 'Identifier' && node.key.name === 'className') {
              const strVal = getStringValue(node.value);
              if (strVal !== null) {
                const violations = checkClassString(strVal.value, strVal.node);
                for (const v of violations) {
                  context.report({
                    node: strVal.node,
                    messageId: 'redundantDarkOverride',
                    data: { darkClass: v.darkClass, semanticToken: v.semanticToken },
                    fix: createFixer(strVal.node, strVal.value, [v]),
                  });
                }
              }
            }

            // Also check object values that contain class strings (like style config objects)
            if (node.value.type === 'Literal' && typeof node.value.value === 'string') {
              const classString = node.value.value;
              // Only check if it looks like a className string (has Tailwind-like classes)
              if (/\b(text|bg|border|ring)-\w+/.test(classString) && /\bdark:/.test(classString)) {
                const violations = checkClassString(classString, node.value);
                for (const v of violations) {
                  context.report({
                    node: node.value,
                    messageId: 'redundantDarkOverride',
                    data: { darkClass: v.darkClass, semanticToken: v.semanticToken },
                    fix: createFixer(node.value, classString, [v]),
                  });
                }
              }
            }
          },
        };
      },
    },
  },
};

export default plugin;
