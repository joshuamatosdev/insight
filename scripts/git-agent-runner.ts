#!/usr/bin/env node
/**
 * Git Agent Runner
 *
 * Wraps AI agent execution in isolated git branches:
 * 1. Validates clean working directory
 * 2. Creates worktree for isolation
 * 3. Creates agent branch
 * 4. Executes agent via Claude Code CLI
 * 5. Commits changes with structured message
 * 6. Outputs merge instructions
 *
 * Usage:
 *   npm run git:agent <agent-name> "<task description>"
 *   npm run git:agent tech-lead "refactor the authentication flow"
 */

import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import {
  type AgentConfig,
  type AgentRunResult,
  type Result,
  ok,
  err,
  execCommand,
  splitLines,
  assertCleanWorkingDirectory,
  getRepoRoot,
  getCurrentBranch,
  createWorktree,
  removeWorktree,
  stageAll,
  commit,
  isWorkingDirectoryClean,
  generateAgentBranchName,
  quotePath,
} from './shared/index.js';
import {
  AgentNotFoundError,
  AgentConfigError,
  extractErrorMessage,
  isGitAgentError,
} from './shared/errors.js';

/**
 * Directory for agent worktrees
 */
const WORKTREE_DIR = '.agent-worktrees';

/**
 * Paths to agent definitions (checked in order)
 */
const AGENT_PATHS = [
  '.claude/agents',
  '.github/agents',
];

/**
 * Parse command line arguments
 */
function parseArgs(args: readonly string[]): Result<{ agentName: string; task: string }, Error> {
  const agentName = args.at(0);
  const task = args.at(1);

  if (agentName === undefined || agentName === '') {
    return err(new Error('Usage: npm run git:agent <agent-name> "<task>"'));
  }

  if (task === undefined || task === '') {
    return err(new Error('Task description is required'));
  }

  return ok({ agentName, task });
}

/**
 * Parse YAML frontmatter from markdown file
 */
function parseFrontmatter(content: string): Record<string, string> {
  const result: Record<string, string> = {};

  // Match YAML frontmatter between --- markers
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content);
  if (match === null || match[1] === undefined) {
    return result;
  }

  const yaml = match[1];
  const lines = splitLines(yaml);

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      // Remove quotes if present
      if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      } else if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }

      result[key] = value;
    }
  }

  return result;
}

/**
 * Load agent configuration from markdown file
 * Searches multiple paths: .claude/agents/, .github/agents/
 * Supports both .md and .agent.md extensions
 */
async function loadAgentConfig(
  agentName: string,
  repoRoot: string
): Promise<Result<AgentConfig, Error>> {
  const extensions = ['.md', '.agent.md'];
  const searchedPaths: string[] = [];

  let content: string | undefined;
  let foundPath: string | undefined;

  // Search all paths and extensions
  for (const agentDir of AGENT_PATHS) {
    for (const ext of extensions) {
      const agentPath = path.join(repoRoot, agentDir, `${agentName}${ext}`);
      searchedPaths.push(agentPath);
      try {
        content = await fs.readFile(agentPath, 'utf8');
        foundPath = agentPath;
        break;
      } catch {
        // Continue searching
      }
    }
    if (content !== undefined) {
      break;
    }
  }

  if (content === undefined || foundPath === undefined) {
    return err(new AgentNotFoundError(agentName, searchedPaths.join(', ')));
  }

  const frontmatter = parseFrontmatter(content);

  const name = frontmatter['name'] ?? agentName;
  const description = frontmatter['description'];
  const toolsStr = frontmatter['tools'];
  const model = frontmatter['model'];
  const permissionMode = frontmatter['permissionMode'];

  if (description === undefined) {
    return err(new AgentConfigError(agentName, foundPath, 'Missing "description" in frontmatter'));
  }

  const tools = toolsStr !== undefined
    ? toolsStr.split(',').map(t => t.trim())
    : [];

  return ok({
    name,
    description,
    tools,
    model: model ?? 'inherit',
    permissionMode: permissionMode ?? 'default',
  });
}

/**
 * Create task slug from task description
 */
function createTaskSlug(task: string): string {
  return task
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30);
}

/**
 * Execute the agent in the worktree
 */
async function executeAgent(
  agentName: string,
  task: string,
  worktreePath: string
): Promise<Result<void, Error>> {
  console.log(`\n🤖 Executing agent: ${agentName}`);
  console.log(`📝 Task: ${task}`);
  console.log(`📁 Working in: ${quotePath(worktreePath)}\n`);

  // Execute claude with the agent and task
  // Using 'claude' CLI - assumes it's installed globally or in PATH
  const result = await execCommand(
    'claude',
    ['--agent', agentName, '--print', task],
    {
      cwd: worktreePath,
      timeoutMs: 30 * 60 * 1000, // 30 minutes
    }
  );

  if (result.success === false) {
    return err(result.error);
  }

  // Print agent output
  if (result.data.stdout.trim() !== '') {
    console.log(result.data.stdout);
  }
  if (result.data.stderr.trim() !== '') {
    console.error(result.data.stderr);
  }

  if (result.data.exitCode !== 0) {
    return err(new Error(`Agent exited with code ${result.data.exitCode}`));
  }

  return ok(undefined);
}

/**
 * Commit agent changes with structured message
 */
async function commitAgentChanges(
  agentName: string,
  task: string,
  worktreePath: string
): Promise<Result<string | undefined, Error>> {
  // Check if there are any changes
  const cleanResult = await isWorkingDirectoryClean(worktreePath);
  if (cleanResult.success === false) {
    return cleanResult;
  }

  if (cleanResult.data === true) {
    console.log('\n📭 No changes to commit');
    return ok(undefined);
  }

  // Stage all changes
  const stageResult = await stageAll(worktreePath);
  if (stageResult.success === false) {
    return stageResult;
  }

  // Create commit message
  const taskSlug = createTaskSlug(task);
  const message = `feat(${agentName}): ${taskSlug}\n\nTask: ${task}\n\nAgent: ${agentName}\nGenerated by git-agent-runner\n\nCo-Authored-By: Claude <noreply@anthropic.com>`;

  const commitResult = await commit(message, worktreePath);
  if (commitResult.success === false) {
    return commitResult;
  }

  console.log(`\n✅ Changes committed: ${commitResult.data.substring(0, 8)}`);
  return commitResult;
}

/**
 * Main runner function
 */
async function run(args: readonly string[]): Promise<void> {
  const parsedArgs = parseArgs(args);
  if (parsedArgs.success === false) {
    console.error(`❌ ${parsedArgs.error.message}`);
    process.exit(1);
  }

  const { agentName, task } = parsedArgs.data;
  const startTime = Date.now();

  console.log('🚀 Git Agent Runner\n');
  console.log(`Agent: ${agentName}`);
  console.log(`Task: ${task}`);

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

  // Get current branch to return to later
  const currentBranchResult = await getCurrentBranch(repoRoot);
  if (currentBranchResult.success === false) {
    console.error(`❌ Failed to get current branch: ${currentBranchResult.error.message}`);
    process.exit(1);
  }
  const originalBranch = currentBranchResult.data;

  // Load agent configuration
  const configResult = await loadAgentConfig(agentName, repoRoot);
  if (configResult.success === false) {
    if (isGitAgentError(configResult.error)) {
      console.error(`❌ ${configResult.error.format()}`);
    } else {
      console.error(`❌ ${configResult.error.message}`);
    }
    process.exit(1);
  }
  const agentConfig = configResult.data;
  console.log(`\n📋 Agent: ${agentConfig.description}`);

  // Generate branch name
  const taskSlug = createTaskSlug(task);
  const branchName = generateAgentBranchName(agentName, taskSlug);
  console.log(`\n🌿 Branch: ${branchName}`);

  // Create worktree path
  const worktreePath = path.join(repoRoot, WORKTREE_DIR, agentName);
  console.log(`📂 Worktree: ${quotePath(worktreePath)}`);

  // Create worktree with new branch
  const worktreeResult = await createWorktree(worktreePath, branchName, repoRoot);
  if (worktreeResult.success === false) {
    if (isGitAgentError(worktreeResult.error)) {
      console.error(`❌ ${worktreeResult.error.format()}`);
    } else {
      console.error(`❌ Failed to create worktree: ${worktreeResult.error.message}`);
    }
    process.exit(1);
  }

  let commitSha: string | undefined;

  try {
    // Execute the agent
    const execResult = await executeAgent(agentName, task, worktreePath);
    if (execResult.success === false) {
      console.error(`\n⚠️  Agent execution failed: ${execResult.error.message}`);
      console.log('Changes (if any) are preserved on the branch.');
    }

    // Commit any changes
    const commitResult = await commitAgentChanges(agentName, task, worktreePath);
    if (commitResult.success === true) {
      commitSha = commitResult.data;
    }
  } finally {
    // Always clean up worktree
    console.log('\n🧹 Cleaning up worktree...');
    await removeWorktree(worktreePath, repoRoot);
  }

  const durationMs = Date.now() - startTime;
  const hasChanges = commitSha !== undefined;

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Agent Run Summary');
  console.log('='.repeat(60));
  console.log(`Agent:    ${agentName}`);
  console.log(`Branch:   ${branchName}`);
  console.log(`Changes:  ${hasChanges ? 'Yes' : 'No'}`);
  if (commitSha !== undefined) {
    console.log(`Commit:   ${commitSha.substring(0, 8)}`);
  }
  console.log(`Duration: ${(durationMs / 1000).toFixed(1)}s`);
  console.log('='.repeat(60));

  if (hasChanges) {
    console.log('\n📌 Next steps:');
    console.log(`   1. Review changes: git log ${branchName}`);
    console.log(`   2. Merge to ${originalBranch}: npm run git:merge ${branchName}`);
    console.log(`   3. Or merge manually: git checkout ${originalBranch} && git merge ${branchName}`);
  }

  const result: AgentRunResult = {
    branchName,
    worktreePath,
    commitSha,
    hasChanges,
    durationMs,
  };

  // Output result as JSON for programmatic use
  console.log('\n📤 Result JSON:');
  console.log(JSON.stringify(result, null, 2));
}

// Entry point
const args = process.argv.slice(2);
run(args).catch((error: unknown) => {
  console.error(`\n❌ Unexpected error: ${extractErrorMessage(error)}`);
  process.exit(1);
});
