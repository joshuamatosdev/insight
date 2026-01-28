#!/usr/bin/env node
/**
 * Migration script to convert inline CSS variable styles to Tailwind classes
 *
 * Converts patterns like:
 *   style={{ marginBottom: 'var(--spacing-4)' }}  →  className="mb-4"
 *   style={{ backgroundColor: 'var(--color-gray-50)' }}  →  className="bg-zinc-50"
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Mapping from CSS properties + values to Tailwind classes
const spacingMap = {
    '0': '0',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '8': '8',
    '10': '10',
    '12': '12',
    '16': '16',
    '20': '20',
    '24': '24',
};

const colorMap = {
    'gray-50': 'zinc-50',
    'gray-100': 'zinc-100',
    'gray-200': 'zinc-200',
    'gray-300': 'zinc-300',
    'gray-400': 'zinc-400',
    'gray-500': 'zinc-500',
    'gray-600': 'zinc-600',
    'gray-700': 'zinc-700',
    'gray-800': 'zinc-800',
    'gray-900': 'zinc-900',
    'gray-950': 'zinc-950',
};

// Property to Tailwind prefix mapping
const propertyPrefixMap = {
    'margin': 'm',
    'marginTop': 'mt',
    'marginBottom': 'mb',
    'marginLeft': 'ml',
    'marginRight': 'mr',
    'padding': 'p',
    'paddingTop': 'pt',
    'paddingBottom': 'pb',
    'paddingLeft': 'pl',
    'paddingRight': 'pr',
    'gap': 'gap',
    'rowGap': 'gap-y',
    'columnGap': 'gap-x',
};

const bgColorPrefixMap = {
    'backgroundColor': 'bg',
    'color': 'text',
    'borderColor': 'border',
};

function convertSpacingValue(property, value) {
    // Extract number from var(--spacing-X)
    const match = value.match(/var\(--spacing-(\d+)\)/);
    if (match) {
        const num = match[1];
        const prefix = propertyPrefixMap[property];
        if (prefix && spacingMap[num]) {
            return `${prefix}-${spacingMap[num]}`;
        }
    }
    return null;
}

function convertColorValue(property, value) {
    // Extract color from var(--color-X)
    const match = value.match(/var\(--color-([a-z]+-\d+)\)/);
    if (match) {
        const color = match[1];
        const prefix = bgColorPrefixMap[property];
        const mappedColor = colorMap[color] || color;
        if (prefix) {
            return `${prefix}-${mappedColor}`;
        }
    }
    return null;
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Pattern to match style={{ property: 'var(--spacing-X)' }}
    // This is a simplified approach - for complex cases manual review is needed

    // Replace simple spacing patterns
    const spacingPatterns = [
        // marginBottom: 'var(--spacing-X)'
        {
            regex: /style=\{\{\s*marginBottom:\s*['"]var\(--spacing-(\d+)\)['"]\s*\}\}/g,
            replacement: (_, num) => `className="mb-${num}"`
        },
        {
            regex: /style=\{\{\s*marginTop:\s*['"]var\(--spacing-(\d+)\)['"]\s*\}\}/g,
            replacement: (_, num) => `className="mt-${num}"`
        },
        {
            regex: /style=\{\{\s*marginLeft:\s*['"]var\(--spacing-(\d+)\)['"]\s*\}\}/g,
            replacement: (_, num) => `className="ml-${num}"`
        },
        {
            regex: /style=\{\{\s*marginRight:\s*['"]var\(--spacing-(\d+)\)['"]\s*\}\}/g,
            replacement: (_, num) => `className="mr-${num}"`
        },
        {
            regex: /style=\{\{\s*padding:\s*['"]var\(--spacing-(\d+)\)['"]\s*\}\}/g,
            replacement: (_, num) => `className="p-${num}"`
        },
        {
            regex: /style=\{\{\s*paddingTop:\s*['"]var\(--spacing-(\d+)\)['"]\s*\}\}/g,
            replacement: (_, num) => `className="pt-${num}"`
        },
        {
            regex: /style=\{\{\s*paddingBottom:\s*['"]var\(--spacing-(\d+)\)['"]\s*\}\}/g,
            replacement: (_, num) => `className="pb-${num}"`
        },
        {
            regex: /style=\{\{\s*gap:\s*['"]var\(--spacing-(\d+)\)['"]\s*\}\}/g,
            replacement: (_, num) => `className="gap-${num}"`
        },
    ];

    for (const pattern of spacingPatterns) {
        if (pattern.regex.test(content)) {
            content = content.replace(pattern.regex, pattern.replacement);
            modified = true;
        }
    }

    // Replace color patterns
    const colorPatterns = [
        {
            regex: /backgroundColor:\s*['"]var\(--color-gray-(\d+)\)['"]/g,
            replacement: (_, num) => `className="bg-zinc-${num}"`
        },
    ];

    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated: ${filePath}`);
    }

    return modified;
}

// Find all TSX files
const files = glob.sync('src/**/*.tsx', {cwd: process.cwd()});
let updatedCount = 0;

console.log(`Found ${files.length} TSX files`);
console.log('');
console.log('Note: This script handles simple patterns. Complex style objects');
console.log('with multiple properties need manual review.');
console.log('');

for (const file of files) {
    if (processFile(file)) {
        updatedCount++;
    }
}

console.log('');
console.log(`Updated ${updatedCount} files`);
console.log('');
console.log('Manual review needed for:');
console.log('- Style objects with multiple properties');
console.log('- Conditional styles');
console.log('- Dynamic values');
