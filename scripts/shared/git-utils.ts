/**
 * Git command wrappers with safe execution
 * All functions use execCommand to prevent shell injection
 */

import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { type Result, ok, err, type AgentBranchInfo } from './types.js';
import {
  execCommand,
  execCommandSucceeds,
  splitLines,
} from './process-utils.js';
import {
  GitCommandError,
  MergeConflictError,
  DirtyWorkingDirectoryError,
  WorktreeError,
  BranchExistsError,
} from './errors.js';

/**
 * Get the current branch name
 */
export async function getCurrentBranch(cwd?: string): Promise<Result<string, Error>> {
  const result = await execCommand('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd });

  if (result.success === false) {
    return result;
  }

  if (result.data.exitCode !== 0) {
    return err(new GitCommandError('git rev-parse --abbrev-ref HEAD', result.data.exitCode, result.data.stderr));
  }

  return ok(result.data.stdout.trim());
}

/**
 * Get the root directory of the git repository
 */
export async function getRepoRoot(cwd?: string): Promise<Result<string, Error>> {
  const result = await execCommand('git', ['rev-parse', '--show-toplevel'], { cwd });

  if (result.success === false) {
    return result;
  }

  if (result.data.exitCode !== 0) {
    return err(new GitCommandError('git rev-parse --show-toplevel', result.data.exitCode, result.data.stderr));
  }

  // Normalize path for Windows compatibility
  return ok(path.normalize(result.data.stdout.trim()));
}

/**
 * List all local branches
 */
export async function listBranches(cwd?: string): Promise<Result<readonly string[], Error>> {
  const result = await execCommand('git', ['branch', '--format=%(refname:short)'], { cwd });

  if (result.success === false) {
    return result;
  }

  if (result.data.exitCode !== 0) {
    return err(new GitCommandError('git branch', result.data.exitCode, result.data.stderr));
  }

  return ok(splitLines(result.data.stdout));
}

/**
 * List agent branches (those starting with agent/ or claude/)
 */
export async function listAgentBranches(cwd?: string): Promise<Result<readonly AgentBranchInfo[], Error>> {
  const branchesResult = await listBranches(cwd);
  if (branchesResult.success === false) {
    return branchesResult;
  }

  // Include both agent/ and claude/ prefixes (for wave-based branches)
  const agentBranches = branchesResult.data.filter(
    b => b.startsWith('agent/') || b.startsWith('claude/') || b.startsWith('cursor/')
  );
  const infos: AgentBranchInfo[] = [];

  for (const branchName of agentBranches) {
    const info = await getAgentBranchInfo(branchName, cwd);
    if (info.success === true) {
      infos.push(info.data);
    }
  }

  // Sort by timestamp descending (newest first)
  infos.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return ok(infos);
}

/**
 * Parse agent branch info from branch name and git log
 * Supports formats:
 *   - agent/<agent-name>/<timestamp>-<slug>-<random>
 *   - claude/wave<N>/<feature>/<timestamp>-<slug>-<random>
 *   - cursor/wave<N>/<feature> (Cursor branches without timestamp)
 */
async function getAgentBranchInfo(
  branchName: string,
  cwd?: string
): Promise<Result<AgentBranchInfo, Error>> {
  let agentName: string;
  let timestampStr: string | undefined;
  let slug: string;

  // Try standard agent format: agent/<agent-name>/<timestamp>-<slug>-<random>
  const agentMatch = /^agent\/([^/]+)\/(\d{8}-\d{6})-([^-]+)-([a-z0-9]+)$/.exec(branchName);
  
  // Try wave format: claude/wave<N>/<feature>/<timestamp>-<slug>-<random>
  const waveMatch = /^claude\/wave(\d+)\/([^/]+)\/(\d{8}-\d{6})-([^-]+)-([a-z0-9]+)$/.exec(branchName);
  
  // Try cursor wave format: cursor/wave<N>/<feature> (no timestamp)
  const cursorMatch = /^cursor\/wave(\d+)\/([^/]+)$/.exec(branchName);

  if (agentMatch !== null) {
    agentName = agentMatch[1] ?? '';
    timestampStr = agentMatch[2];
    slug = agentMatch[3] ?? '';
  } else if (waveMatch !== null) {
    const waveNum = waveMatch[1];
    const feature = waveMatch[2];
    agentName = `wave${waveNum}-${feature}`;
    timestampStr = waveMatch[3];
    slug = waveMatch[4] ?? '';
  } else if (cursorMatch !== null) {
    const waveNum = cursorMatch[1];
    const feature = cursorMatch[2];
    agentName = `wave${waveNum}-${feature}`;
    timestampStr = undefined;
    slug = feature ?? '';
  } else {
    return err(new Error(`Invalid agent branch format: ${branchName}`));
  }

  // Parse timestamp if present
  let timestamp = new Date();
  if (timestampStr !== undefined) {
    const year = parseInt(timestampStr.substring(0, 4), 10);
    const month = parseInt(timestampStr.substring(4, 6), 10) - 1;
    const day = parseInt(timestampStr.substring(6, 8), 10);
    const hour = parseInt(timestampStr.substring(9, 11), 10);
    const minute = parseInt(timestampStr.substring(11, 13), 10);
    const second = parseInt(timestampStr.substring(13, 15), 10);
    timestamp = new Date(year, month, day, hour, minute, second);
  }

  // Get commit count and last commit info
  const countResult = await execCommand(
    'git',
    ['rev-list', '--count', `master..${branchName}`],
    { cwd }
  );

  const commitCount = countResult.success === true && countResult.data.exitCode === 0
    ? parseInt(countResult.data.stdout.trim(), 10)
    : 0;

  const logResult = await execCommand(
    'git',
    ['log', '-1', '--format=%H%n%s', branchName],
    { cwd }
  );

  let lastCommitSha = '';
  let lastCommitMessage = '';

  if (logResult.success === true && logResult.data.exitCode === 0) {
    const lines = splitLines(logResult.data.stdout);
    lastCommitSha = lines.at(0) ?? '';
    lastCommitMessage = lines.at(1) ?? '';
  }

  return ok({
    branchName,
    agentName,
    timestamp,
    slug,
    commitCount: isNaN(commitCount) ? 0 : commitCount,
    lastCommitSha,
    lastCommitMessage,
  });
}

/**
 * Check if working directory has uncommitted changes
 */
export async function isWorkingDirectoryClean(cwd?: string): Promise<Result<boolean, Error>> {
  const result = await execCommand('git', ['status', '--porcelain'], { cwd });

  if (result.success === false) {
    return result;
  }

  if (result.data.exitCode !== 0) {
    return err(new GitCommandError('git status --porcelain', result.data.exitCode, result.data.stderr));
  }

  const hasChanges = result.data.stdout.trim() !== '';
  return ok(hasChanges === false);
}

/**
 * Get list of changed files in working directory
 */
export async function getChangedFiles(cwd?: string): Promise<Result<readonly string[], Error>> {
  const result = await execCommand('git', ['status', '--porcelain'], { cwd });

  if (result.success === false) {
    return result;
  }

  if (result.data.exitCode !== 0) {
    return err(new GitCommandError('git status --porcelain', result.data.exitCode, result.data.stderr));
  }

  const files = splitLines(result.data.stdout)
    .map(line => line.substring(3).trim());

  return ok(files);
}

/**
 * Ensure working directory is clean, throw if not
 */
export async function assertCleanWorkingDirectory(cwd?: string): Promise<void> {
  const cleanResult = await isWorkingDirectoryClean(cwd);

  if (cleanResult.success === false) {
    throw cleanResult.error;
  }

  if (cleanResult.data === false) {
    const filesResult = await getChangedFiles(cwd);
    const files = filesResult.success === true ? filesResult.data : [];
    throw new DirtyWorkingDirectoryError(files);
  }
}

/**
 * Check if a branch exists
 */
export async function branchExists(branchName: string, cwd?: string): Promise<boolean> {
  return execCommandSucceeds('git', ['rev-parse', '--verify', branchName], { cwd });
}

/**
 * Create a new branch
 */
export async function createBranch(
  branchName: string,
  startPoint: string = 'HEAD',
  cwd?: string
): Promise<Result<void, Error>> {
  const exists = await branchExists(branchName, cwd);
  if (exists) {
    return err(new BranchExistsError(branchName));
  }

  const result = await execCommand('git', ['branch', branchName, startPoint], { cwd });

  if (result.success === false) {
    return result;
  }

  if (result.data.exitCode !== 0) {
    return err(new GitCommandError(`git branch ${branchName}`, result.data.exitCode, result.data.stderr));
  }

  return ok(undefined);
}

/**
 * Checkout a branch
 */
export async function checkoutBranch(branchName: string, cwd?: string): Promise<Result<void, Error>> {
  const result = await execCommand('git', ['checkout', branchName], { cwd });

  if (result.success === false) {
    return result;
  }

  if (result.data.exitCode !== 0) {
    return err(new GitCommandError(`git checkout ${branchName}`, result.data.exitCode, result.data.stderr));
  }

  return ok(undefined);
}

/**
 * Create a worktree for isolated agent work
 */
export async function createWorktree(
  worktreePath: string,
  branchName: string,
  cwd?: string
): Promise<Result<void, Error>> {
  // Ensure parent directory exists
  const parentDir = path.dirname(worktreePath);

  try {
    await fs.mkdir(parentDir, { recursive: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return err(new WorktreeError(worktreePath, `Failed to create parent directory: ${error.message}`));
    }
    return err(new WorktreeError(worktreePath, 'Failed to create parent directory'));
  }

  const result = await execCommand(
    'git',
    ['worktree', 'add', '-b', branchName, worktreePath],
    { cwd }
  );

  if (result.success === false) {
    return err(new WorktreeError(worktreePath, `Failed to create worktree: ${result.error.message}`));
  }

  if (result.data.exitCode !== 0) {
    return err(new WorktreeError(worktreePath, result.data.stderr));
  }

  return ok(undefined);
}

/**
 * Remove a worktree
 */
export async function removeWorktree(worktreePath: string, cwd?: string): Promise<Result<void, Error>> {
  // First try git worktree remove
  const result = await execCommand(
    'git',
    ['worktree', 'remove', '--force', worktreePath],
    { cwd }
  );

  if (result.success === true && result.data.exitCode === 0) {
    return ok(undefined);
  }

  // Fallback: manually remove directory and prune
  try {
    await fs.rm(worktreePath, { recursive: true, force: true });
  } catch {
    // Ignore removal errors
  }

  await execCommand('git', ['worktree', 'prune'], { cwd });

  return ok(undefined);
}

/**
 * Stage all changes
 */
export async function stageAll(cwd?: string): Promise<Result<void, Error>> {
  const result = await execCommand('git', ['add', '-A'], { cwd });

  if (result.success === false) {
    return result;
  }

  if (result.data.exitCode !== 0) {
    return err(new GitCommandError('git add -A', result.data.exitCode, result.data.stderr));
  }

  return ok(undefined);
}

/**
 * Create a commit
 */
export async function commit(message: string, cwd?: string): Promise<Result<string, Error>> {
  const result = await execCommand('git', ['commit', '-m', message], { cwd });

  if (result.success === false) {
    return result;
  }

  if (result.data.exitCode !== 0) {
    return err(new GitCommandError('git commit', result.data.exitCode, result.data.stderr));
  }

  // Get the commit SHA
  const shaResult = await execCommand('git', ['rev-parse', 'HEAD'], { cwd });
  if (shaResult.success === true && shaResult.data.exitCode === 0) {
    return ok(shaResult.data.stdout.trim());
  }

  return ok('');
}

/**
 * Merge a branch into the current branch
 */
export async function mergeBranch(
  branchName: string,
  squash: boolean = false,
  cwd?: string
): Promise<Result<void, MergeConflictError | Error>> {
  const args = ['merge'];
  if (squash) {
    args.push('--squash');
  }
  args.push('--no-edit', branchName);

  const result = await execCommand('git', args, { cwd });

  if (result.success === false) {
    return result;
  }

  if (result.data.exitCode !== 0) {
    // Check for merge conflicts
    if (result.data.stdout.includes('CONFLICT') || result.data.stderr.includes('CONFLICT')) {
      const conflictsResult = await execCommand(
        'git',
        ['diff', '--name-only', '--diff-filter=U'],
        { cwd }
      );

      const conflictingFiles = conflictsResult.success === true
        ? splitLines(conflictsResult.data.stdout)
        : [];

      return err(new MergeConflictError(branchName, conflictingFiles));
    }

    return err(new GitCommandError(`git merge ${branchName}`, result.data.exitCode, result.data.stderr));
  }

  return ok(undefined);
}

/**
 * Abort an in-progress merge
 */
export async function abortMerge(cwd?: string): Promise<Result<void, Error>> {
  const result = await execCommand('git', ['merge', '--abort'], { cwd });

  if (result.success === false) {
    return result;
  }

  // Ignore exit code - may fail if no merge in progress
  return ok(undefined);
}

/**
 * Delete a branch
 */
export async function deleteBranch(branchName: string, force: boolean = false, cwd?: string): Promise<Result<void, Error>> {
  const flag = force ? '-D' : '-d';
  const result = await execCommand('git', ['branch', flag, branchName], { cwd });

  if (result.success === false) {
    return result;
  }

  if (result.data.exitCode !== 0) {
    return err(new GitCommandError(`git branch ${flag} ${branchName}`, result.data.exitCode, result.data.stderr));
  }

  return ok(undefined);
}

/**
 * Get the default branch name (main or master)
 */
export async function getDefaultBranch(cwd?: string): Promise<Result<string, Error>> {
  // Try to get from git config
  const configResult = await execCommand(
    'git',
    ['config', '--get', 'init.defaultBranch'],
    { cwd }
  );

  if (configResult.success === true && configResult.data.exitCode === 0) {
    const branch = configResult.data.stdout.trim();
    if (branch !== '') {
      return ok(branch);
    }
  }

  // Check if main exists
  if (await branchExists('main', cwd)) {
    return ok('main');
  }

  // Check if master exists
  if (await branchExists('master', cwd)) {
    return ok('master');
  }

  // Default to master (SAMGov uses master)
  return ok('master');
}

/**
 * Sanitize a string for use in branch names
 * Only allows lowercase alphanumeric and hyphens
 */
export function sanitizeBranchName(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

/**
 * Generate a unique agent branch name
 * Supports wave-based naming: wave1-xxx becomes claude/wave1/xxx
 */
export function generateAgentBranchName(agentName: string, taskSlug: string): string {
  const sanitizedAgent = sanitizeBranchName(agentName);
  const sanitizedSlug = sanitizeBranchName(taskSlug).substring(0, 30);

  // Generate timestamp: YYYYMMDD-HHMMSS
  const now = new Date();
  const timestamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    '-',
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('');

  // Generate 6-char random suffix
  const random = Math.random().toString(36).substring(2, 8);

  // Check for wave-based agent naming (e.g., wave1-registration)
  const waveMatch = /^wave(\d+)-(.+)$/.exec(sanitizedAgent);
  if (waveMatch !== null) {
    const waveNumber = waveMatch[1];
    const featureName = waveMatch[2];
    if (waveNumber !== undefined && featureName !== undefined) {
      return `claude/wave${waveNumber}/${featureName}/${timestamp}-${sanitizedSlug}-${random}`;
    }
  }

  return `agent/${sanitizedAgent}/${timestamp}-${sanitizedSlug}-${random}`;
}
