/**
 * Tailwind Plus UI Blocks Download Script
 * 
 * This script downloads all React JSX components from Tailwind CSS Plus
 * 
 * Prerequisites:
 * 1. Node.js installed
 * 2. npm install puppeteer
 * 
 * Usage:
 * 1. Run: node download-components.cjs
 * 2. When prompted, login in the browser window that opens
 * 3. The script will automatically download all components after login
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Helper function to replace deprecated waitForTimeout
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Random delay between 5-12 seconds to avoid rate limiting
const randomDelay = () => sleep(5000 + Math.random() * 7000);

// Check if file already exists (for resume capability)
function fileExists(filePath) {
    return fs.existsSync(filePath);
}

// All component URLs to download
const COMPONENT_URLS = [
    // Marketing - Sections
    'https://tailwindcss.com/plus/ui-blocks/marketing/sections/heroes',
    'https://tailwindcss.com/plus/ui-blocks/marketing/sections/feature-sections',
    'https://tailwindcss.com/plus/ui-blocks/marketing/sections/cta-sections',
    'https://tailwindcss.com/plus/ui-blocks/marketing/sections/bento-grids',
    'https://tailwindcss.com/plus/ui-blocks/marketing/sections/pricing',
    'https://tailwindcss.com/plus/ui-blocks/marketing/sections/header',
    'https://tailwindcss.com/plus/ui-blocks/marketing/sections/newsletter-sections',
    'https://tailwindcss.com/plus/ui-blocks/marketing/sections/stats-sections',
    'https://tailwindcss.com/plus/ui-blocks/marketing/sections/testimonials',
    'https://tailwindcss.com/plus/ui-blocks/marketing/sections/blog-sections',
    'https://tailwindcss.com/plus/ui-blocks/marketing/sections/contact-sections',
    'https://tailwindcss.com/plus/ui-blocks/marketing/sections/team-sections',
    'https://tailwindcss.com/plus/ui-blocks/marketing/sections/content-sections',
    'https://tailwindcss.com/plus/ui-blocks/marketing/sections/logo-clouds',
    'https://tailwindcss.com/plus/ui-blocks/marketing/sections/faq-sections',
    'https://tailwindcss.com/plus/ui-blocks/marketing/sections/footers',

    // Marketing - Elements
    'https://tailwindcss.com/plus/ui-blocks/marketing/elements/headers',
    'https://tailwindcss.com/plus/ui-blocks/marketing/elements/flyout-menus',
    'https://tailwindcss.com/plus/ui-blocks/marketing/elements/banners',

    // Marketing - Feedback
    'https://tailwindcss.com/plus/ui-blocks/marketing/feedback/404-pages',

    // Marketing - Page Examples
    'https://tailwindcss.com/plus/ui-blocks/marketing/page-examples/landing-pages',
    'https://tailwindcss.com/plus/ui-blocks/marketing/page-examples/pricing-pages',
    'https://tailwindcss.com/plus/ui-blocks/marketing/page-examples/about-pages',

    // Application UI - Application Shells
    'https://tailwindcss.com/plus/ui-blocks/application-ui/application-shells/stacked',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/application-shells/sidebar',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/application-shells/multi-column',

    // Application UI - Headings
    'https://tailwindcss.com/plus/ui-blocks/application-ui/headings/page-headings',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/headings/card-headings',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/headings/section-headings',

    // Application UI - Data Display
    'https://tailwindcss.com/plus/ui-blocks/application-ui/data-display/description-lists',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/data-display/stats',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/data-display/calendars',

    // Application UI - Lists
    'https://tailwindcss.com/plus/ui-blocks/application-ui/lists/stacked-lists',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/lists/tables',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/lists/grid-lists',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/lists/feeds',

    // Application UI - Forms
    'https://tailwindcss.com/plus/ui-blocks/application-ui/forms/form-layouts',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/forms/input-groups',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/forms/select-menus',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/forms/sign-in-forms',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/forms/textareas',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/forms/radio-groups',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/forms/checkboxes',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/forms/toggles',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/forms/action-panels',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/forms/comboboxes',

    // Application UI - Feedback
    'https://tailwindcss.com/plus/ui-blocks/application-ui/feedback/alerts',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/feedback/empty-states',

    // Application UI - Navigation
    'https://tailwindcss.com/plus/ui-blocks/application-ui/navigation/navbars',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/navigation/pagination',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/navigation/tabs',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/navigation/vertical-navigation',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/navigation/sidebar-navigation',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/navigation/breadcrumbs',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/navigation/progress-bars',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/navigation/command-palettes',

    // Application UI - Overlays
    'https://tailwindcss.com/plus/ui-blocks/application-ui/overlays/modal-dialogs',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/overlays/drawers',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/overlays/notifications',

    // Application UI - Elements
    'https://tailwindcss.com/plus/ui-blocks/application-ui/elements/avatars',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/elements/badges',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/elements/dropdowns',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/elements/buttons',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/elements/button-groups',

    // Application UI - Layout
    'https://tailwindcss.com/plus/ui-blocks/application-ui/layout/containers',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/layout/cards',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/layout/list-containers',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/layout/media-objects',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/layout/dividers',

    // Application UI - Page Examples
    'https://tailwindcss.com/plus/ui-blocks/application-ui/page-examples/home-screens',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/page-examples/detail-screens',
    'https://tailwindcss.com/plus/ui-blocks/application-ui/page-examples/settings-screens',

    // Ecommerce - Components
    'https://tailwindcss.com/plus/ui-blocks/ecommerce/components/product-overviews',
    'https://tailwindcss.com/plus/ui-blocks/ecommerce/components/product-lists',
    'https://tailwindcss.com/plus/ui-blocks/ecommerce/components/category-previews',
    'https://tailwindcss.com/plus/ui-blocks/ecommerce/components/shopping-carts',
    'https://tailwindcss.com/plus/ui-blocks/ecommerce/components/category-filters',
    'https://tailwindcss.com/plus/ui-blocks/ecommerce/components/product-quickviews',
    'https://tailwindcss.com/plus/ui-blocks/ecommerce/components/product-features',
    'https://tailwindcss.com/plus/ui-blocks/ecommerce/components/store-navigation',
    'https://tailwindcss.com/plus/ui-blocks/ecommerce/components/promo-sections',
    'https://tailwindcss.com/plus/ui-blocks/ecommerce/components/checkout-forms',
    'https://tailwindcss.com/plus/ui-blocks/ecommerce/components/reviews',
    'https://tailwindcss.com/plus/ui-blocks/ecommerce/components/order-summaries',
    'https://tailwindcss.com/plus/ui-blocks/ecommerce/components/order-history',
    'https://tailwindcss.com/plus/ui-blocks/ecommerce/components/incentives',

    // Ecommerce - Page Examples
    'https://tailwindcss.com/plus/ui-blocks/ecommerce/page-examples/storefront-pages',
    'https://tailwindcss.com/plus/ui-blocks/ecommerce/page-examples/product-pages',
    'https://tailwindcss.com/plus/ui-blocks/ecommerce/page-examples/category-pages',
    'https://tailwindcss.com/plus/ui-blocks/ecommerce/page-examples/shopping-cart-pages',
    'https://tailwindcss.com/plus/ui-blocks/ecommerce/page-examples/checkout-pages',
    'https://tailwindcss.com/plus/ui-blocks/ecommerce/page-examples/order-detail-pages',
    'https://tailwindcss.com/plus/ui-blocks/ecommerce/page-examples/order-history-pages',
];

const BASE_DIR = __dirname;

function getFilePath(url) {
    const urlPath = url.split('/plus/ui-blocks/')[1];
    const parts = urlPath.split('/');
    const fileName = parts[parts.length - 1] + '.jsx';
    const dirPath = parts.slice(0, -1).join('/');
    return path.join(BASE_DIR, dirPath, fileName);
}

function ensureDirectoryExists(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function toPascalCase(str) {
    return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

async function extractComponentsFromPage(page, url) {
    // Check what type of page this is by looking at the DOM
    const pageType = await page.evaluate(() => {
        // Look for "Get the code" buttons/links
        const getCodeButtons = Array.from(document.querySelectorAll('a, button'))
            .filter(el => el.textContent.toLowerCase().includes('get the code'));

        // Look for inline "Code" tabs
        const codeTabs = Array.from(document.querySelectorAll('button'))
            .filter(b => b.textContent.trim() === 'Code');

        if (getCodeButtons.length > 0) {
            return 'get-the-code';
        } else if (codeTabs.length > 0) {
            return 'inline-code';
        }
        return 'unknown';
    });

    console.log(`      Page type detected: ${pageType}`);

    if (pageType === 'get-the-code') {
        return await extractGetTheCodeComponents(page);
    } else {
        return await extractInlineComponents(page);
    }
}

async function extractGetTheCodeComponents(page) {
    const components = [];

    // Get all "Get the code" buttons info
    const buttonInfo = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a, button'));
        const getCodeLinks = links.filter(el =>
            el.textContent.toLowerCase().includes('get the code')
        );

        return getCodeLinks.map((el, i) => {
            // Try to find the component title nearby
            let title = `Component ${i + 1}`;
            let parent = el.parentElement;
            for (let j = 0; j < 10; j++) {
                if (!parent) break;
                const h2 = parent.querySelector('h2, h3');
                if (h2 && h2.textContent.trim()) {
                    title = h2.textContent.trim();
                    break;
                }
                parent = parent.parentElement;
            }
            return { index: i, title, isLink: el.tagName === 'A', href: el.href || null };
        });
    });

    console.log(`      Found ${buttonInfo.length} "Get the code" buttons`);

    for (let i = 0; i < buttonInfo.length; i++) {
        const info = buttonInfo[i];
        try {
            console.log(`      Extracting: ${info.title}`);

            // Click the button
            await page.evaluate((idx) => {
                const links = Array.from(document.querySelectorAll('a, button'));
                const target = links.filter(el =>
                    el.textContent.toLowerCase().includes('get the code')
                )[idx];
                if (target) target.click();
            }, i);

            await sleep(3000); // Wait for modal/drawer to open

            // Select React format if there's a dropdown
            await page.evaluate(async () => {
                const sleep = (ms) => new Promise(r => setTimeout(r, ms));
                const selects = document.querySelectorAll('select');
                for (const select of selects) {
                    const reactOption = Array.from(select.options).find(o => o.text === 'React');
                    if (reactOption && select.value !== reactOption.value) {
                        select.value = reactOption.value;
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                        await sleep(500);
                    }
                }
            });

            await sleep(1000);

            // Extract the code
            const code = await page.evaluate(() => {
                const pre = document.querySelector('pre');
                if (pre) return pre.textContent;
                const codeEl = document.querySelector('code');
                if (codeEl) return codeEl.textContent;
                return null;
            });

            if (code && code.length > 50) {
                components.push({
                    title: info.title,
                    code: code
                });
                console.log(`      ✓ Got code (${code.length} chars)`);
            } else {
                console.log(`      ✗ No code found or too short`);
            }

            // Close modal - try Escape, then look for close button
            await page.keyboard.press('Escape');
            await sleep(1000);

            // Also try clicking outside or close button
            await page.evaluate(() => {
                const closeBtn = document.querySelector('[aria-label="Close"], button:has(svg[class*="x"]), .close-button');
                if (closeBtn) closeBtn.click();
            });
            await sleep(500);

        } catch (e) {
            console.log(`      Error extracting ${info.title}: ${e.message}`);
        }
    }

    return components;
}

async function extractInlineComponents(page) {
    // Click all "Code" tabs and ensure React is selected
    await page.evaluate(async () => {
        const sleep = (ms) => new Promise(r => setTimeout(r, ms));

        // Click all Code buttons
        const codeButtons = Array.from(document.querySelectorAll('button'))
            .filter(b => b.textContent.trim() === 'Code');

        for (const btn of codeButtons) {
            if (btn.getAttribute('aria-selected') !== 'true') {
                btn.click();
                await sleep(300);
            }
        }

        // Ensure React is selected in all dropdowns
        const selects = document.querySelectorAll('select');
        for (const select of selects) {
            const reactOption = Array.from(select.options).find(o => o.text === 'React');
            if (reactOption && select.value !== reactOption.value) {
                select.value = reactOption.value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                await sleep(300);
            }
        }

        // Click v4.1 if v3.4 is currently selected
        const versionButtons = Array.from(document.querySelectorAll('button'))
            .filter(b => b.textContent.includes('v3.4'));

        for (const btn of versionButtons) {
            btn.click();
            await sleep(300);
            const v41Option = Array.from(document.querySelectorAll('li, button, a'))
                .find(el => el.textContent.trim() === 'v4.1');
            if (v41Option) {
                v41Option.click();
                await sleep(300);
            }
        }
    });

    await sleep(1000);

    // Extract all component codes with titles
    const components = await page.evaluate(() => {
        const results = [];
        const preElements = document.querySelectorAll('pre');

        preElements.forEach((pre, index) => {
            // Try to find the title by looking for h2 above this pre element
            let title = `Component ${index + 1}`;
            let parent = pre.parentElement;

            // Walk up and back to find h2
            for (let i = 0; i < 10; i++) {
                if (!parent) break;
                const h2 = parent.querySelector('h2');
                if (h2) {
                    title = h2.textContent.trim();
                    break;
                }
                parent = parent.parentElement;
            }

            results.push({
                title: title,
                code: pre.textContent
            });
        });

        return results;
    });

    return components;
}

function formatComponentFile(components, pageTitle, url) {
    let content = `// Tailwind Plus UI Blocks - ${pageTitle}\n`;
    content += `// Source: ${url}\n`;
    content += `// Format: React JSX (v4.1)\n`;
    content += `// Downloaded automatically\n\n`;

    components.forEach((comp, index) => {
        content += `// =============================================================================\n`;
        content += `// ${index + 1}. ${comp.title}\n`;
        content += `// =============================================================================\n`;
        content += comp.code + '\n\n';
    });

    return content;
}

async function main() {
    console.log('🚀 Starting Tailwind Plus UI Blocks Downloader...\n');

    // Launch browser with visible window for login
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1400, height: 900 }
    });

    const page = await browser.newPage();

    // Navigate to first URL to trigger login
    console.log('📝 Opening Tailwind Plus - please log in if prompted...');
    await page.goto(COMPONENT_URLS[0], { waitUntil: 'networkidle2' });

    // Wait for user to login (check for Code button which indicates logged in)
    console.log('⏳ Waiting for login...');
    try {
        await page.waitForFunction(() => {
            return Array.from(document.querySelectorAll('button')).some(b => b.textContent.trim() === 'Code');
        }, { timeout: 120000 }); // 2 minute timeout
        console.log('✅ Login detected!\n');
    } catch (e) {
        console.log('⚠️ Login timeout - continuing anyway...\n');
    }

    // Download each component page
    let downloadedCount = 0;
    let totalComponents = 0;

    for (let i = 0; i < COMPONENT_URLS.length; i++) {
        const url = COMPONENT_URLS[i];
        const filePath = getFilePath(url);

        // Skip if file already exists (resume capability)
        if (fileExists(filePath)) {
            console.log(`⏭️  Skipping (already exists): ${url.split('/ui-blocks/')[1]}`);
            downloadedCount++;
            continue;
        }

        try {
            console.log(`📥 [${i + 1}/${COMPONENT_URLS.length}] Downloading: ${url.split('/ui-blocks/')[1]}`);

            // Add delay between requests to avoid Cloudflare
            if (i > 0) {
                console.log(`   ⏳ Waiting to avoid rate limit...`);
                await randomDelay();
            }

            await page.goto(url, { waitUntil: 'networkidle2' });
            await sleep(4000); // Wait for page to fully render

            // Scroll to load all components
            await page.evaluate(async () => {
                const sleep = (ms) => new Promise(r => setTimeout(r, ms));
                let totalHeight = 0;
                const distance = 500;
                while (totalHeight < document.body.scrollHeight) {
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    await sleep(100);
                }
                window.scrollTo(0, 0); // Scroll back to top
            });

            await sleep(1000);

            // Extract components
            const components = await extractComponentsFromPage(page, url);

            if (components.length > 0) {
                ensureDirectoryExists(filePath);

                const pageTitle = url.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const content = formatComponentFile(components, pageTitle, url);

                fs.writeFileSync(filePath, content, 'utf-8');

                console.log(`   ✅ Saved ${components.length} components to ${path.basename(filePath)}`);
                totalComponents += components.length;
                downloadedCount++;
            } else {
                console.log(`   ⚠️ No components found`);
            }

        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }

    console.log(`\n🎉 Download complete!`);
    console.log(`   📁 Pages processed: ${downloadedCount}/${COMPONENT_URLS.length}`);
    console.log(`   🧩 Total components: ${totalComponents}`);

    await browser.close();
}

main().catch(console.error);
