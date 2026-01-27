/**
 * Typed error classes for git agent runner
 * Provides structured error handling with context and recovery suggestions
 */

/**
 * Error codes for programmatic error handling
 */
export type GitAgentErrorCode =
  | 'GIT_COMMAND_FAILED'
  | 'MERGE_CONFLICT'
  | 'DIRTY_WORKING_DIRECTORY'
  | 'AGENT_CONFIG_INVALID'
  | 'AGENT_NOT_FOUND'
  | 'WORKTREE_ERROR'
  | 'BRANCH_EXISTS'
  | 'VERIFICATION_FAILED'
  | 'TIMEOUT'
  | 'PROCESS_FAILED';

/**
 * Base error class for all git agent runner errors
 * Includes structured context for debugging and recovery suggestions
 */
export class GitAgentError extends Error {
  readonly code: GitAgentErrorCode;
  readonly context: Record<string, unknown>;
  readonly recoveryAction: string | undefined;

  constructor(
    code: GitAgentErrorCode,
    message: string,
    context: Record<string, unknown> = {},
    recoveryAction?: string
  ) {
    super(message);
    this.name = 'GitAgentError';
    this.code = code;
    this.context = context;
    this.recoveryAction = recoveryAction;

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace !== undefined) {
      Error.captureStackTrace(this, GitAgentError);
    }
  }

  /**
   * Format error for display with context
   */
  format(): string {
    const parts = [`[${this.code}] ${this.message}`];

    if (Object.keys(this.context).length > 0) {
      parts.push('Context:');
      for (const [key, value] of Object.entries(this.context)) {
        parts.push(`  ${key}: ${String(value)}`);
      }
    }

    if (this.recoveryAction !== undefined) {
      parts.push(`Recovery: ${this.recoveryAction}`);
    }

    return parts.join('\n');
  }
}

/**
 * Error thrown when a git command fails
 */
export class GitCommandError extends GitAgentError {
  readonly command: string;
  readonly exitCode: number;
  readonly stderr: string;

  constructor(
    command: string,
    exitCode: number,
    stderr: string,
    recoveryAction?: string
  ) {
    super(
      'GIT_COMMAND_FAILED',
      `Git command failed: ${command}`,
      { command, exitCode, stderr },
      recoveryAction
    );
    this.name = 'GitCommandError';
    this.command = command;
    this.exitCode = exitCode;
    this.stderr = stderr;
  }
}

/**
 * Error thrown when a merge has conflicts
 */
export class MergeConflictError extends GitAgentError {
  readonly conflictingFiles: readonly string[];
  readonly branchName: string;

  constructor(branchName: string, conflictingFiles: readonly string[]) {
    super(
      'MERGE_CONFLICT',
      `Merge conflict in ${conflictingFiles.length} file(s)`,
      { branchName, files: conflictingFiles.join(', ') },
      `Resolve conflicts manually with: git checkout ${branchName}`
    );
    this.name = 'MergeConflictError';
    this.conflictingFiles = conflictingFiles;
    this.branchName = branchName;
  }
}

/**
 * Error thrown when working directory has uncommitted changes
 */
export class DirtyWorkingDirectoryError extends GitAgentError {
  constructor(changedFiles: readonly string[]) {
    super(
      'DIRTY_WORKING_DIRECTORY',
      'Working directory has uncommitted changes',
      { files: changedFiles.slice(0, 10).join(', ') },
      'Commit or stash changes before running agent'
    );
    this.name = 'DirtyWorkingDirectoryError';
  }
}

/**
 * Error thrown when agent configuration is invalid
 */
export class AgentConfigError extends GitAgentError {
  readonly agentName: string;
  readonly configPath: string;

  constructor(agentName: string, configPath: string, reason: string) {
    super(
      'AGENT_CONFIG_INVALID',
      `Invalid agent configuration: ${reason}`,
      { agentName, configPath },
      'Check agent definition file for YAML frontmatter'
    );
    this.name = 'AgentConfigError';
    this.agentName = agentName;
    this.configPath = configPath;
  }
}

/**
 * Error thrown when agent definition file is not found
 */
export class AgentNotFoundError extends GitAgentError {
  readonly agentName: string;
  readonly searchPath: string;

  constructor(agentName: string, searchPath: string) {
    super(
      'AGENT_NOT_FOUND',
      `Agent not found: ${agentName}`,
      { agentName, searchPath },
      `Create agent definition at ${searchPath}`
    );
    this.name = 'AgentNotFoundError';
    this.agentName = agentName;
    this.searchPath = searchPath;
  }
}

/**
 * Error thrown when worktree operations fail
 */
export class WorktreeError extends GitAgentError {
  readonly worktreePath: string;

  constructor(worktreePath: string, message: string, recoveryAction?: string) {
    super('WORKTREE_ERROR', message, { worktreePath }, recoveryAction);
    this.name = 'WorktreeError';
    this.worktreePath = worktreePath;
  }
}

/**
 * Error thrown when a branch already exists
 */
export class BranchExistsError extends GitAgentError {
  readonly branchName: string;

  constructor(branchName: string) {
    super(
      'BRANCH_EXISTS',
      `Branch already exists: ${branchName}`,
      { branchName },
      'Use a different branch name or delete the existing branch'
    );
    this.name = 'BranchExistsError';
    this.branchName = branchName;
  }
}

/**
 * Error thrown when verification fails
 */
export class VerificationError extends GitAgentError {
  readonly step: 'typeCheck' | 'lint' | 'test';
  readonly output: string;

  constructor(
    step: 'typeCheck' | 'lint' | 'test',
    output: string,
    branchName: string
  ) {
    const stepNames = {
      typeCheck: 'Type checking',
      lint: 'Linting',
      test: 'Testing',
    };

    super(
      'VERIFICATION_FAILED',
      `${stepNames[step]} failed`,
      { step, branchName },
      `Fix issues on branch ${branchName} and try again`
    );
    this.name = 'VerificationError';
    this.step = step;
    this.output = output;
  }
}

/**
 * Error thrown when a process times out
 */
export class TimeoutError extends GitAgentError {
  readonly timeoutMs: number;

  constructor(operation: string, timeoutMs: number) {
    super(
      'TIMEOUT',
      `Operation timed out after ${timeoutMs}ms: ${operation}`,
      { operation, timeoutMs },
      'Increase timeout or check for hung processes'
    );
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Extracts error message from unknown error type
 * Use in catch blocks with useUnknownInCatchVariables
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}

/**
 * Type guard for GitAgentError
 */
export function isGitAgentError(error: unknown): error is GitAgentError {
  return error instanceof GitAgentError;
}
