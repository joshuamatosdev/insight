#!/usr/bin/env node
/**
 * OpenAPI Type Generation Script
 *
 * This script downloads the OpenAPI spec from the backend server and generates
 * TypeScript types using openapi-typescript.
 *
 * Usage:
 *   node scripts/generate-api-types.js
 *   node scripts/generate-api-types.js --save-spec
 *
 * Options:
 *   --save-spec    Also save the OpenAPI spec to openapi.json
 *   --from-file    Generate from saved openapi.json instead of fetching
 */

import {execSync} from 'child_process';
import {existsSync, writeFileSync} from 'fs';
import {dirname, resolve} from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8080';
const OPENAPI_ENDPOINT = '/v3/api-docs';
const OUTPUT_FILE = 'src/types/api.generated.ts';
const SPEC_FILE = 'openapi.json';

const args = process.argv.slice(2);
const saveSpec = args.includes('--save-spec');
const fromFile = args.includes('--from-file');

async function fetchSpec() {
    const url = `${BACKEND_URL}${OPENAPI_ENDPOINT}`;
    console.log(`Fetching OpenAPI spec from ${url}...`);

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch spec: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

async function generateFromSpec(spec) {
    const tempFile = resolve(rootDir, '.openapi-temp.json');

    try {
        // Write spec to temp file
        writeFileSync(tempFile, JSON.stringify(spec, null, 2));

        // Run openapi-typescript
        console.log(`Generating types to ${OUTPUT_FILE}...`);
        execSync(`npx openapi-typescript ${tempFile} -o ${OUTPUT_FILE}`, {
            cwd: rootDir,
            stdio: 'inherit',
        });

        console.log('Types generated successfully!');
    } finally {
        // Clean up temp file
        try {
            if (existsSync(tempFile)) {
                const {unlinkSync} = await import('fs');
                unlinkSync(tempFile);
            }
        } catch {
            // Ignore cleanup errors
        }
    }
}

async function main() {
    try {
        let spec;

        if (fromFile) {
            const specPath = resolve(rootDir, SPEC_FILE);
            if (!existsSync(specPath)) {
                console.error(`Error: ${SPEC_FILE} not found. Run without --from-file first.`);
                process.exit(1);
            }
            console.log(`Reading spec from ${SPEC_FILE}...`);
            const {readFileSync} = await import('fs');
            spec = JSON.parse(readFileSync(specPath, 'utf-8'));
        } else {
            spec = await fetchSpec();

            if (saveSpec) {
                const specPath = resolve(rootDir, SPEC_FILE);
                writeFileSync(specPath, JSON.stringify(spec, null, 2));
                console.log(`Saved spec to ${SPEC_FILE}`);
            }
        }

        await generateFromSpec(spec);
    } catch (error) {
        console.error('Error:', error.message);
        console.log('');
        console.log('Make sure the backend server is running on', BACKEND_URL);
        console.log('Or use --from-file to generate from a saved spec.');
        process.exit(1);
    }
}

main();
