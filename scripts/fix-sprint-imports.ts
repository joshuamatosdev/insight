/**
 * Fix Sprint DTO imports in test files
 * 
 * Problem: Tests import DTOs as inner classes (SprintService.CreateSprintRequest)
 *          but actual DTOs are in external package (com.samgov.ingestor.dto.CreateSprintRequest)
 * 
 * Usage: npx ts-node scripts/fix-sprint-imports.ts [--dry-run]
 */

import * as fs from 'fs';
import * as path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

// Sprint DTOs that exist externally in dto/ package
const SPRINT_DTOS = [
  'CreateSprintRequest',
  'UpdateSprintRequest', 
  'CreateTaskRequest',
  'UpdateTaskRequest',
  'SprintDto',
  'SprintTaskDto',
  'SprintSummaryDto',
];

// Enums that are in the model, not dto
const MODEL_ENUMS: Record<string, string> = {
  'TaskStatus': 'com.samgov.ingestor.model.SprintTask.TaskStatus',
  'TaskPriority': 'com.samgov.ingestor.model.SprintTask.TaskPriority',
};

// Pattern to match: import com.samgov.ingestor.service.SprintService.XXX;
const SPRINT_IMPORT_PATTERN = /import\s+com\.samgov\.ingestor\.service\.SprintService\.(\w+);/g;

interface FileChange {
  file: string;
  oldImports: string[];
  newImports: string[];
}

function findJavaFiles(dir: string): string[] {
  const results: string[] = [];
  
  function walk(currentDir: string): void {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'build') {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.java')) {
        results.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return results;
}

function processFile(filePath: string): FileChange | null {
  const content = fs.readFileSync(filePath, 'utf-8');
  const matches = content.matchAll(SPRINT_IMPORT_PATTERN);
  
  const oldImports: string[] = [];
  const newImports: string[] = [];
  let newContent = content;
  
  for (const match of matches) {
    const dtoName = match[1];
    if (dtoName === undefined) continue;
    
    const oldImport = match[0];
    oldImports.push(oldImport);
    
    // Check if this DTO exists in the external dto package
    if (SPRINT_DTOS.includes(dtoName)) {
      const newImport = `import com.samgov.ingestor.dto.${dtoName};`;
      newImports.push(newImport);
      newContent = newContent.replace(oldImport, newImport);
    } else if (dtoName in MODEL_ENUMS) {
      // For enums like TaskStatus that are in the model
      const enumPath = MODEL_ENUMS[dtoName];
      if (enumPath !== undefined) {
        const newImport = `import ${enumPath};`;
        newImports.push(newImport);
        newContent = newContent.replace(oldImport, newImport);
      }
    } else {
      // Unknown - leave as is and warn
      console.warn(`  Warning: Unknown DTO/enum: ${dtoName}`);
    }
  }
  
  if (oldImports.length === 0) {
    return null;
  }
  
  if (!DRY_RUN) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
  }
  
  return {
    file: filePath,
    oldImports,
    newImports,
  };
}

function main(): void {
  console.log('='.repeat(60));
  console.log('Sprint DTO Import Fixer');
  console.log('='.repeat(60));
  
  if (DRY_RUN) {
    console.log('\n[DRY RUN MODE - No files will be modified]\n');
  }
  
  const testDir = path.join(process.cwd(), 'src', 'test', 'java');
  
  if (!fs.existsSync(testDir)) {
    console.error(`Error: Test directory not found: ${testDir}`);
    console.error('Run this script from the project root directory.');
    process.exit(1);
  }
  
  console.log(`Scanning: ${testDir}\n`);
  
  const javaFiles = findJavaFiles(testDir);
  console.log(`Found ${javaFiles.length} Java files\n`);
  
  const changes: FileChange[] = [];
  
  for (const file of javaFiles) {
    const change = processFile(file);
    if (change !== null) {
      changes.push(change);
    }
  }
  
  if (changes.length === 0) {
    console.log('No Sprint import issues found.');
    return;
  }
  
  console.log(`\nFiles ${DRY_RUN ? 'to be ' : ''}modified: ${changes.length}\n`);
  console.log('-'.repeat(60));
  
  for (const change of changes) {
    const relativePath = path.relative(process.cwd(), change.file);
    console.log(`\nFile: ${relativePath}`);
    
    for (let i = 0; i < change.oldImports.length; i++) {
      const oldImp = change.oldImports[i];
      const newImp = change.newImports[i];
      if (oldImp !== undefined && newImp !== undefined) {
        console.log(`  - ${oldImp}`);
        console.log(`  + ${newImp}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (DRY_RUN) {
    console.log('\n[DRY RUN] No files were modified.');
    console.log('Run without --dry-run to apply changes.');
  } else {
    console.log(`\nSuccessfully updated ${changes.length} files.`);
    console.log('\nNext steps:');
    console.log('  1. Run: ./gradlew compileTestJava');
    console.log('  2. Fix any remaining issues manually');
  }
}

main();
