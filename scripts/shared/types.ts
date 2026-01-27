/**
 * Shared TypeScript types for git agent runner scripts
 * Follows strict TypeScript patterns from tsconfig.json
 */

/**
 * Discriminated union for safe error handling
 * Use this instead of try/catch for predictable error flow
 */
export type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

/**
 * Creates a successful Result
 */
export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * Creates a failed Result
 */
export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Output from executing a shell command
 */
export interface CommandOutput {
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number;
}

/**
 * Options for running an agent
 */
export interface AgentRunOptions {
  /** Name of the agent (matches .claude/agents/<name>.md) */
  readonly agentName: string;
  /** Task description for the agent to execute */
  readonly task: string;
  /** Optional timeout in milliseconds */
  readonly timeoutMs?: number;
  /** Working directory (defaults to cwd) */
  readonly cwd?: string;
}

/**
 * Result of an agent run
 */
export interface AgentRunResult {
  /** Branch name where work was committed */
  readonly branchName: string;
  /** Path to the worktree used for isolation */
  readonly worktreePath: string;
  /** Commit SHA if work was committed */
  readonly commitSha: string | undefined;
  /** Whether the agent made any changes */
  readonly hasChanges: boolean;
  /** Duration in milliseconds */
  readonly durationMs: number;
}

/**
 * Options for merging an agent branch
 */
export interface MergeOptions {
  /** Branch name to merge */
  readonly branchName: string;
  /** Whether to use squash merge */
  readonly squash: boolean;
  /** Whether to attempt auto-resolution of conflicts */
  readonly autoResolve: boolean;
  /** Skip verification steps (tsc, lint, test) */
  readonly skipVerification: boolean;
}

/**
 * Result of a merge operation
 */
export interface MergeResult {
  /** Whether the merge was successful */
  readonly merged: boolean;
  /** Commit SHA of the merge commit */
  readonly commitSha: string | undefined;
  /** List of files that had conflicts */
  readonly conflictingFiles: readonly string[];
  /** Verification results if run */
  readonly verification: VerificationResult | undefined;
}

/**
 * Result of verification steps
 */
export interface VerificationResult {
  readonly typeCheck: VerificationStepResult;
  readonly lint: VerificationStepResult;
  readonly test: VerificationStepResult;
}

/**
 * Result of a single verification step
 */
export interface VerificationStepResult {
  readonly passed: boolean;
  readonly output: string;
  readonly durationMs: number;
}

/**
 * Parsed agent configuration from frontmatter
 */
export interface AgentConfig {
  readonly name: string;
  readonly description: string;
  readonly tools: readonly string[];
  readonly model: string;
  readonly permissionMode: string;
}

/**
 * Information about an agent branch
 */
export interface AgentBranchInfo {
  readonly branchName: string;
  readonly agentName: string;
  readonly timestamp: Date;
  readonly slug: string;
  readonly commitCount: number;
  readonly lastCommitSha: string;
  readonly lastCommitMessage: string;
}

/**
 * State persisted between runner invocations
 */
export interface RunnerState {
  readonly version: 1;
  readonly activeRuns: readonly ActiveRunInfo[];
}

/**
 * Information about an active or interrupted run
 */
export interface ActiveRunInfo {
  readonly branchName: string;
  readonly worktreePath: string;
  readonly agentName: string;
  readonly task: string;
  readonly startedAt: string;
  readonly pid: number;
}
