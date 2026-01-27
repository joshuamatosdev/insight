/**
 * Organize Tailwind UI Blocks into sam-dashboard/src/components/catalyst/blocks
 *
 * This script:
 * 1. Creates a blocks/ subdirectory structure in the catalyst folder
 * 2. Copies all UI block JSX files, renaming to TSX
 * 3. Preserves the category structure (application-ui, marketing, ecommerce)
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = __dirname;
const TARGET_DIR = path.join(__dirname, '..', 'sam-dashboard', 'src', 'components', 'catalyst', 'blocks');

const CATEGORIES = ['application-ui', 'marketing', 'ecommerce'];

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created: ${dir}`);
    }
}

function copyJsxToTsx(srcPath, destPath) {
    let content = fs.readFileSync(srcPath, 'utf-8');

    // Basic JSX to TSX adjustments (add type annotations where obvious)
    // Most UI blocks are examples, so we keep them as-is for reference

    fs.writeFileSync(destPath, content, 'utf-8');
}

function processDirectory(srcDir, destDir) {
    if (!fs.existsSync(srcDir)) {
        console.log(`⚠️  Source not found: ${srcDir}`);
        return 0;
    }

    ensureDir(destDir);

    const items = fs.readdirSync(srcDir);
    let fileCount = 0;

    for (const item of items) {
        const srcPath = path.join(srcDir, item);
        const stat = fs.statSync(srcPath);

        if (stat.isDirectory()) {
            // Recurse into subdirectory
            const subDestDir = path.join(destDir, item);
            fileCount += processDirectory(srcPath, subDestDir);
        } else if (item.endsWith('.jsx')) {
            // Copy and rename to .tsx
            const tsxName = item.replace('.jsx', '.tsx');
            const destPath = path.join(destDir, tsxName);
            copyJsxToTsx(srcPath, destPath);
            fileCount++;
        }
    }

    return fileCount;
}

function generateIndexFile(blocksDir) {
    const indexPath = path.join(blocksDir, 'index.ts');

    let content = `/**
 * Tailwind UI Blocks
 *
 * This directory contains UI block examples from Tailwind Plus.
 * These are reference implementations - copy and adapt as needed.
 *
 * Categories:
 * - application-ui/ - Dashboard, forms, navigation, etc.
 * - marketing/ - Landing pages, heroes, CTAs, etc.
 * - ecommerce/ - Product pages, carts, checkout, etc.
 */

// Re-export categories for easy access
export const BLOCK_CATEGORIES = ['application-ui', 'marketing', 'ecommerce'] as const;
export type BlockCategory = typeof BLOCK_CATEGORIES[number];
`;

    fs.writeFileSync(indexPath, content, 'utf-8');
    console.log(`📝 Created index: ${indexPath}`);
}

function main() {
    console.log('🚀 Organizing Tailwind UI Blocks...\n');
    console.log(`   Source: ${SOURCE_DIR}`);
    console.log(`   Target: ${TARGET_DIR}\n`);

    ensureDir(TARGET_DIR);

    let totalFiles = 0;

    for (const category of CATEGORIES) {
        const srcDir = path.join(SOURCE_DIR, category);
        const destDir = path.join(TARGET_DIR, category);

        console.log(`\n📦 Processing: ${category}`);
        const count = processDirectory(srcDir, destDir);
        console.log(`   ✅ Copied ${count} files`);
        totalFiles += count;
    }

    // Generate index file
    generateIndexFile(TARGET_DIR);

    console.log(`\n🎉 Done! Organized ${totalFiles} UI block files.`);
    console.log(`   Location: ${TARGET_DIR}`);
}

main();
