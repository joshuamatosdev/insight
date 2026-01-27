/**
 * Fix all service DTO imports in test files
 * 
 * Handles:
 * 1. Sprint DTOs moved to external dto/ package
 * 2. Incorrect enum/class names in tests
 * 3. Mapping inner classes to correct locations
 * 
 * Usage: npx ts-node scripts/fix-all-service-imports.ts [--dry-run]
 */

import * as fs from 'fs';
import * as path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

// Mapping of incorrect imports to correct imports
// Format: 'ServiceName.WrongName' -> 'correct.full.path.CorrectName'
const IMPORT_MAPPINGS: Record<string, string> = {
  // Sprint - moved to external dto package
  'SprintService.CreateSprintRequest': 'com.samgov.ingestor.dto.CreateSprintRequest',
  'SprintService.UpdateSprintRequest': 'com.samgov.ingestor.dto.UpdateSprintRequest',
  'SprintService.CreateTaskRequest': 'com.samgov.ingestor.dto.CreateTaskRequest',
  'SprintService.UpdateTaskRequest': 'com.samgov.ingestor.dto.UpdateTaskRequest',
  'SprintService.SprintDto': 'com.samgov.ingestor.dto.SprintDto',
  'SprintService.SprintTaskDto': 'com.samgov.ingestor.dto.SprintTaskDto',
  'SprintService.SprintSummaryDto': 'com.samgov.ingestor.dto.SprintSummaryDto',
  'SprintService.TaskStatus': 'com.samgov.ingestor.model.SprintTask.TaskStatus',
  'SprintService.TaskPriority': 'com.samgov.ingestor.model.SprintTask.TaskPriority',
  
  // Scope - wrong names in tests
  'ScopeService.ScopeChangeRequest': 'com.samgov.ingestor.service.ScopeService.CreateScopeChangeRequest',
  'ScopeService.ScopeChangeStatus': 'com.samgov.ingestor.model.ScopeChange.ChangeStatus',
  'ScopeService.ScopeItemStatus': 'com.samgov.ingestor.model.ScopeItem.ScopeStatus',
  
  // Milestone - wrong names in tests  
  'MilestoneService.MilestoneStatus': 'com.samgov.ingestor.model.Milestone.MilestoneStatus',
  'MilestoneService.MilestoneDependencyDto': 'com.samgov.ingestor.service.MilestoneService.DependencyDto',
  
  // Messaging - DTOs moved to external package with different casing
  'MessagingService.MessageDto': 'com.samgov.ingestor.dto.MessageDTO',
  'MessagingService.MessageThreadDto': 'com.samgov.ingestor.dto.MessageThreadDTO',
  'MessagingService.CreateMessageRequest': 'com.samgov.ingestor.dto.SendMessageRequest',
  
  // FeatureRequest - enums in model (note: FeaturePriority -> FeatureRequestPriority)
  'FeatureRequestService.FeatureRequestStatus': 'com.samgov.ingestor.model.FeatureRequest.FeatureRequestStatus',
  'FeatureRequestService.FeaturePriority': 'com.samgov.ingestor.model.FeatureRequest.FeatureRequestPriority',
};

// Pattern to match: import com.samgov.ingestor.service.XXXService.YYY;
const SERVICE_IMPORT_PATTERN = /import\s+com\.samgov\.ingestor\.service\.(\w+Service)\.(\w+);/g;

interface FileChange {
  file: string;
  changes: Array<{old: string; new: string}>;
  warnings: string[];
}

function findJavaFiles(dir: string): string[] {
  const results: string[] = [];
  
  function walk(currentDir: string): void {
    if (!fs.existsSync(currentDir)) return;
    
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
  const changes: Array<{old: string; new: string}> = [];
  const warnings: string[] = [];
  let newContent = content;
  
  // Find all service imports
  const matches = [...content.matchAll(SERVICE_IMPORT_PATTERN)];
  
  for (const match of matches) {
    const serviceName = match[1];
    const className = match[2];
    if (serviceName === undefined || className === undefined) continue;
    
    const oldImport = match[0];
    const mappingKey = `${serviceName}.${className}`;
    
    if (mappingKey in IMPORT_MAPPINGS) {
      const newPath = IMPORT_MAPPINGS[mappingKey];
      if (newPath !== undefined) {
        const newImport = `import ${newPath};`;
        changes.push({ old: oldImport, new: newImport });
        newContent = newContent.replace(oldImport, newImport);
      }
    } else {
      // Check if it might be a valid inner class (not in our mapping)
      // We'll leave these alone but warn about them
      warnings.push(`Unknown mapping: ${mappingKey}`);
    }
  }
  
  if (changes.length === 0 && warnings.length === 0) {
    return null;
  }
  
  if (!DRY_RUN && changes.length > 0) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
  }
  
  return {
    file: filePath,
    changes,
    warnings,
  };
}

function main(): void {
  console.log('='.repeat(70));
  console.log('Service DTO Import Fixer');
  console.log('='.repeat(70));
  
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
  
  const allChanges: FileChange[] = [];
  const allWarnings: FileChange[] = [];
  
  for (const file of javaFiles) {
    const result = processFile(file);
    if (result !== null) {
      if (result.changes.length > 0) {
        allChanges.push(result);
      }
      if (result.warnings.length > 0) {
        allWarnings.push(result);
      }
    }
  }
  
  // Report changes
  if (allChanges.length > 0) {
    console.log(`\nFiles ${DRY_RUN ? 'to be ' : ''}modified: ${allChanges.length}`);
    console.log('-'.repeat(70));
    
    for (const change of allChanges) {
      const relativePath = path.relative(process.cwd(), change.file);
      console.log(`\nFile: ${relativePath}`);
      
      for (const c of change.changes) {
        console.log(`  - ${c.old}`);
        console.log(`  + ${c.new}`);
      }
    }
  } else {
    console.log('\nNo import changes needed.');
  }
  
  // Report warnings
  if (allWarnings.length > 0) {
    console.log('\n' + '='.repeat(70));
    console.log('WARNINGS - Unknown mappings (may need manual review):');
    console.log('-'.repeat(70));
    
    for (const w of allWarnings) {
      const relativePath = path.relative(process.cwd(), w.file);
      console.log(`\nFile: ${relativePath}`);
      for (const warning of w.warnings) {
        console.log(`  ! ${warning}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(70));
  
  if (DRY_RUN) {
    console.log('\n[DRY RUN] No files were modified.');
    console.log('Run without --dry-run to apply changes.');
  } else if (allChanges.length > 0) {
    console.log(`\nSuccessfully updated ${allChanges.length} files.`);
    console.log('\nNext steps:');
    console.log('  1. Run: ./gradlew compileTestJava');
    console.log('  2. Review any warnings and fix manually');
  }
}

main();
