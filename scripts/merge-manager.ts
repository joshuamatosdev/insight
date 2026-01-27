#!/usr/bin/env node
/**
 * Merge Manager
 *
 * Validates and merges agent branches with verification:
 * 1. Checks out agent branch
 * 2. Runs verification (tsc, lint, test)
 * 3. Merges to main (squash optional)
 * 4. Cleans up branch
 *
 * Commands:
 *   npm run git:merge list              - List all agent branches
 *   npm run git:merge <branch>          - Validate and merge
 *   npm run git:merge <branch> --squash - Squash merge
 *   npm run git:merge <branch> --skip-verify - Skip verification
 */

import * as path from 'node:path';
import {
  type MergeResult,
  type VerificationResult,
  type VerificationStepResult,
  type BackendVerificationResult,
  type FrontendVerificationResult,
  type Result,
  ok,
  execCommand,
  listAgentBranches,
  getRepoRoot,
  getCurrentBranch,
  getDefaultBranch,
  checkoutBranch,
  mergeBranch,
  deleteBranch,
  abortMerge,
  assertCleanWorkingDirectory,
} from './shared/index.js';
import {
  MergeConflictError,
  extractErrorMessage,
  isGitAgentError,
} from './shared/errors.js';

/**
 * Parse command line arguments
 */
interface ParsedArgs {
  readonly command: 'list' | 'merge';
  readonly branchName: string | undefined;
  readonly squash: boolean;
  readonly skipVerify: boolean;
}

function parseArgs(args: readonly string[]): Result<ParsedArgs, Error> {
  const first = args.at(0);

  if (first === undefined || first === '' || first === 'list') {
    return ok({ command: 'list', branchName: undefined, squash: false, skipVerify: false });
  }

  const squash = args.includes('--squash');
  const skipVerify = args.includes('--skip-verify');

  return ok({
    command: 'merge',
    branchName: first,
    squash,
    skipVerify,
  });
}

/**
 * Format duration in human readable form
 */
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Format date in relative form
 */
function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'just now';
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  return `${diffDays}d ago`;
}

/**
 * List all agent branches
 */
async function listCommand(repoRoot: string): Promise<void> {
  console.log('🌿 Agent Branches\n');

  const result = await listAgentBranches(repoRoot);
  if (result.success === false) {
    console.error(`❌ Failed to list branches: ${result.error.message}`);
    return;
  }

  const branches = result.data;
  if (branches.length === 0) {
    console.log('No agent branches found.');
    console.log('\nCreate one with: npm run git:agent <agent-name> "<task>"');
    return;
  }

  console.log(`Found ${branches.length} agent branch(es):\n`);

  // Print table header
  console.log('  Branch'.padEnd(60) + 'Age'.padEnd(12) + 'Commits');
  console.log('  ' + '-'.repeat(80));

  for (const branch of branches) {
    const ageLine = formatRelativeDate(branch.timestamp).padEnd(12);
    const commitLine = String(branch.commitCount);
    console.log(`  ${branch.branchName.padEnd(58)} ${ageLine} ${commitLine}`);

    if (branch.lastCommitMessage !== '') {
      console.log(`    └─ ${branch.lastCommitMessage.substring(0, 70)}`);
    }
  }

  console.log('\n📌 To merge a branch: npm run git:merge <branch-name>');
}

/**
 * Run a verification step
 */
async function runVerificationStep(
  _name: string,
  command: string,
  args: readonly string[],
  cwd: string
): Promise<VerificationStepResult> {
  const startTime = Date.now();
  const result = await execCommand(command, args, { cwd, timeoutMs: 5 * 60 * 1000 });
  const durationMs = Date.now() - startTime;

  if (result.success === false) {
    return {
      passed: false,
      output: result.error.message,
      durationMs,
    };
  }

  const passed = result.data.exitCode === 0;
  const output = result.data.stdout + result.data.stderr;

  return { passed, output, durationMs };
}

/**
 * Detect if running on Windows
 */
const isWindows = process.platform === 'win32';

/**
 * Get the gradle command for the current platform
 */
function getGradleCommand(): string {
  return isWindows ? 'gradlew.bat' : './gradlew';
}

/**
 * Run backend verification (Java/Gradle)
 */
async function runBackendVerification(cwd: string): Promise<BackendVerificationResult> {
  const gradleCmd = getGradleCommand();

  // Backend build (excluding tests for speed)
  process.stdout.write('  Backend Build...   ');
  const build = await runVerificationStep(
    'Gradle Build',
    gradleCmd,
    ['build', '-x', 'test'],
    cwd
  );
  console.log(build.passed ? `✅ (${formatDuration(build.durationMs)})` : '❌');

  // Backend tests
  process.stdout.write('  Backend Tests...   ');
  const test = await runVerificationStep(
    'Gradle Test',
    gradleCmd,
    ['test'],
    cwd
  );
  console.log(test.passed ? `✅ (${formatDuration(test.durationMs)})` : '❌');

  return { build, test };
}

/**
 * Run frontend verification (TypeScript/React)
 */
async function runFrontendVerification(cwd: string): Promise<FrontendVerificationResult> {
  const frontendDir = path.join(cwd, 'sam-dashboard');

  // TypeScript type checking
  process.stdout.write('  Frontend Types...  ');
  const typeCheck = await runVerificationStep(
    'TypeScript',
    'npx',
    ['tsc', '--noEmit'],
    frontendDir
  );
  console.log(typeCheck.passed ? `✅ (${formatDuration(typeCheck.durationMs)})` : '❌');

  // ESLint
  process.stdout.write('  Frontend Lint...   ');
  const lint = await runVerificationStep(
    'ESLint',
    'npm',
    ['run', 'lint'],
    frontendDir
  );
  console.log(lint.passed ? `✅ (${formatDuration(lint.durationMs)})` : '❌');

  // Frontend tests
  process.stdout.write('  Frontend Tests...  ');
  const test = await runVerificationStep(
    'Vitest',
    'npm',
    ['test', '--', '--run'],
    frontendDir
  );
  console.log(test.passed ? `✅ (${formatDuration(test.durationMs)})` : '❌');

  return { typeCheck, lint, test };
}

/**
 * Run all verification steps (backend + frontend)
 */
async function runVerification(cwd: string): Promise<VerificationResult> {
  console.log('\n🔍 Running verification...\n');
  console.log('  Backend (Java/Gradle):');

  const backend = await runBackendVerification(cwd);

  console.log('\n  Frontend (TypeScript/React):');

  const frontend = await runFrontendVerification(cwd);

  return { backend, frontend };
}

/**
 * Merge an agent branch
 */
async function mergeCommand(
  branchName: string,
  squash: boolean,
  skipVerify: boolean,
  repoRoot: string
): Promise<MergeResult> {
  console.log(`\n🔀 Merge Manager\n`);
  console.log(`Branch: ${branchName}`);
  console.log(`Squash: ${squash ? 'Yes' : 'No'}`);
  console.log(`Verify: ${skipVerify ? 'Skipped' : 'Yes'}`);

  // Get default branch
  const defaultBranchResult = await getDefaultBranch(repoRoot);
  if (defaultBranchResult.success === false) {
    console.error(`❌ Failed to determine default branch`);
    return { merged: false, commitSha: undefined, conflictingFiles: [], verification: undefined };
  }
  const defaultBranch = defaultBranchResult.data;

  // Get current branch to restore on failure
  const currentBranchResult = await getCurrentBranch(repoRoot);
  if (currentBranchResult.success === false) {
    console.error(`❌ Failed to get current branch`);
    return { merged: false, commitSha: undefined, conflictingFiles: [], verification: undefined };
  }
  const originalBranch = currentBranchResult.data;

  let verification: VerificationResult | undefined;

  // Checkout the agent branch for verification
  if (skipVerify === false) {
    console.log(`\n📥 Checking out ${branchName}...`);
    const checkoutResult = await checkoutBranch(branchName, repoRoot);
    if (checkoutResult.success === false) {
      console.error(`❌ Failed to checkout branch: ${checkoutResult.error.message}`);
      return { merged: false, commitSha: undefined, conflictingFiles: [], verification: undefined };
    }

    // Run verification
    verification = await runVerification(repoRoot);

    const backendPassed = verification.backend.build.passed &&
      verification.backend.test.passed;

    const frontendPassed = verification.frontend.typeCheck.passed &&
      verification.frontend.lint.passed &&
      verification.frontend.test.passed;

    const allPassed = backendPassed && frontendPassed;

    if (allPassed === false) {
      console.log('\n❌ Verification failed. Fix issues and try again.\n');

      // Show failed step outputs - Backend
      if (verification.backend.build.passed === false) {
        console.log('Backend Build errors:');
        console.log(verification.backend.build.output.substring(0, 2000));
      }
      if (verification.backend.test.passed === false) {
        console.log('\nBackend Test failures:');
        console.log(verification.backend.test.output.substring(0, 2000));
      }

      // Show failed step outputs - Frontend
      if (verification.frontend.typeCheck.passed === false) {
        console.log('\nFrontend TypeScript errors:');
        console.log(verification.frontend.typeCheck.output.substring(0, 2000));
      }
      if (verification.frontend.lint.passed === false) {
        console.log('\nFrontend Lint errors:');
        console.log(verification.frontend.lint.output.substring(0, 2000));
      }
      if (verification.frontend.test.passed === false) {
        console.log('\nFrontend Test failures:');
        console.log(verification.frontend.test.output.substring(0, 2000));
      }

      // Return to original branch
      await checkoutBranch(originalBranch, repoRoot);

      return { merged: false, commitSha: undefined, conflictingFiles: [], verification };
    }

    console.log('\n✅ All verification checks passed!');
  }

  // Checkout default branch for merge
  console.log(`\n📥 Checking out ${defaultBranch}...`);
  const checkoutMainResult = await checkoutBranch(defaultBranch, repoRoot);
  if (checkoutMainResult.success === false) {
    console.error(`❌ Failed to checkout ${defaultBranch}: ${checkoutMainResult.error.message}`);
    await checkoutBranch(originalBranch, repoRoot);
    return { merged: false, commitSha: undefined, conflictingFiles: [], verification };
  }

  // Perform merge
  console.log(`\n🔀 Merging ${branchName}${squash ? ' (squash)' : ''}...`);
  const mergeResult = await mergeBranch(branchName, squash, repoRoot);

  if (mergeResult.success === false) {
    if (mergeResult.error instanceof MergeConflictError) {
      console.error(`\n❌ Merge conflict in ${mergeResult.error.conflictingFiles.length} file(s):`);
      for (const file of mergeResult.error.conflictingFiles.slice(0, 10)) {
        console.log(`   - ${file}`);
      }

      // Abort merge
      await abortMerge(repoRoot);
      await checkoutBranch(originalBranch, repoRoot);

      return {
        merged: false,
        commitSha: undefined,
        conflictingFiles: mergeResult.error.conflictingFiles,
        verification,
      };
    }

    console.error(`❌ Merge failed: ${mergeResult.error.message}`);
    await checkoutBranch(originalBranch, repoRoot);
    return { merged: false, commitSha: undefined, conflictingFiles: [], verification };
  }

  // If squash merge, need to commit
  if (squash) {
    const commitResult = await execCommand(
      'git',
      ['commit', '-m', `feat: merge agent branch ${branchName}\n\nCo-Authored-By: Claude <noreply@anthropic.com>`],
      { cwd: repoRoot }
    );

    if (commitResult.success === false || commitResult.data.exitCode !== 0) {
      console.error('❌ Failed to complete squash merge commit');
      await checkoutBranch(originalBranch, repoRoot);
      return { merged: false, commitSha: undefined, conflictingFiles: [], verification };
    }
  }

  // Get merge commit SHA
  const shaResult = await execCommand('git', ['rev-parse', 'HEAD'], { cwd: repoRoot });
  const commitSha = shaResult.success === true && shaResult.data.exitCode === 0
    ? shaResult.data.stdout.trim()
    : undefined;

  console.log(`\n✅ Successfully merged to ${defaultBranch}`);
  if (commitSha !== undefined) {
    console.log(`   Commit: ${commitSha.substring(0, 8)}`);
  }

  // Delete the agent branch
  console.log(`\n🗑️  Deleting branch ${branchName}...`);
  const deleteResult = await deleteBranch(branchName, true, repoRoot);
  if (deleteResult.success === false) {
    console.log(`   ⚠️  Could not delete branch: ${deleteResult.error.message}`);
  } else {
    console.log('   Branch deleted.');
  }

  return { merged: true, commitSha, conflictingFiles: [], verification };
}

/**
 * Main entry point
 */
async function run(args: readonly string[]): Promise<void> {
  const parsedArgs = parseArgs(args);
  if (parsedArgs.success === false) {
    console.error(`❌ ${parsedArgs.error.message}`);
    process.exit(1);
  }

  // Get repo root
  const rootResult = await getRepoRoot();
  if (rootResult.success === false) {
    console.error(`❌ Not in a git repository: ${rootResult.error.message}`);
    process.exit(1);
  }
  const repoRoot = rootResult.data;

  // Validate clean working directory
  try {
    await assertCleanWorkingDirectory(repoRoot);
  } catch (error: unknown) {
    if (isGitAgentError(error)) {
      console.error(`❌ ${error.format()}`);
    } else {
      console.error(`❌ ${extractErrorMessage(error)}`);
    }
    process.exit(1);
  }

  const { command, branchName, squash, skipVerify } = parsedArgs.data;

  if (command === 'list') {
    await listCommand(repoRoot);
    return;
  }

  if (branchName === undefined) {
    console.error('❌ Branch name is required for merge command');
    process.exit(1);
  }

  const result = await mergeCommand(branchName, squash, skipVerify, repoRoot);

  // Output result as JSON
  console.log('\n📤 Result JSON:');
  console.log(JSON.stringify(result, null, 2));

  if (result.merged === false) {
    process.exit(1);
  }
}

// Entry point
const args = process.argv.slice(2);
run(args).catch((error: unknown) => {
  console.error(`\n❌ Unexpected error: ${extractErrorMessage(error)}`);
  process.exit(1);
});
