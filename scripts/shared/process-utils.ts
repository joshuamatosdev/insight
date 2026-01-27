/**
 * Safe process execution utilities
 * Uses spawn/execFile to prevent shell injection attacks
 */

import { spawn, type ChildProcess, type SpawnOptions } from 'node:child_process';
import { type Result, ok, err } from './types.js';
import { type CommandOutput } from './types.js';
import { TimeoutError, extractErrorMessage } from './errors.js';

/**
 * Options for command execution
 */
export interface ExecOptions {
  /** Working directory (undefined means current directory) */
  readonly cwd?: string | undefined;
  /** Timeout in milliseconds (default: 60000) */
  readonly timeoutMs?: number | undefined;
  /** Environment variables to add */
  readonly env?: Readonly<Record<string, string>> | undefined;
  /** Whether to capture output (default: true) */
  readonly captureOutput?: boolean | undefined;
}

/**
 * Default timeout for command execution (60 seconds)
 */
const DEFAULT_TIMEOUT_MS = 60_000;

/**
 * Maximum buffer size for stdout/stderr (10MB)
 */
const MAX_BUFFER_SIZE = 10 * 1024 * 1024;

/**
 * Execute a command without shell interpolation
 * Uses spawn with no shell to prevent command injection
 *
 * @param command - Command to execute (e.g., 'git')
 * @param args - Arguments array (e.g., ['status', '--porcelain'])
 * @param options - Execution options
 * @returns Result with CommandOutput on success, Error on failure
 */
export async function execCommand(
  command: string,
  args: readonly string[],
  options: ExecOptions = {}
): Promise<Result<CommandOutput, Error>> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return new Promise((resolve) => {
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    let stdoutSize = 0;
    let stderrSize = 0;
    let timedOut = false;

    const spawnOptions: SpawnOptions = {
      cwd: options.cwd,
      env: options.env !== undefined
        ? { ...process.env, ...options.env }
        : process.env,
      // SECURITY: No shell to prevent injection
      shell: false,
      // Handle Windows paths with spaces
      windowsVerbatimArguments: true,
    };

    let child: ChildProcess;

    try {
      child = spawn(command, [...args], spawnOptions);
    } catch (error: unknown) {
      resolve(err(new Error(`Failed to spawn process: ${extractErrorMessage(error)}`)));
      return;
    }

    const timeoutId = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      // Force kill after 5 seconds if SIGTERM doesn't work
      setTimeout(() => {
        if (child.killed === false) {
          child.kill('SIGKILL');
        }
      }, 5000);
    }, timeoutMs);

    if (child.stdout !== null) {
      child.stdout.on('data', (chunk: Buffer) => {
        if (stdoutSize < MAX_BUFFER_SIZE) {
          stdoutChunks.push(chunk);
          stdoutSize += chunk.length;
        }
      });
    }

    if (child.stderr !== null) {
      child.stderr.on('data', (chunk: Buffer) => {
        if (stderrSize < MAX_BUFFER_SIZE) {
          stderrChunks.push(chunk);
          stderrSize += chunk.length;
        }
      });
    }

    child.on('error', (error: Error) => {
      clearTimeout(timeoutId);
      resolve(err(new Error(`Process error: ${error.message}`)));
    });

    child.on('close', (code: number | null) => {
      clearTimeout(timeoutId);

      if (timedOut) {
        resolve(err(new TimeoutError(`${command} ${args.join(' ')}`, timeoutMs)));
        return;
      }

      const stdout = Buffer.concat(stdoutChunks).toString('utf8');
      const stderr = Buffer.concat(stderrChunks).toString('utf8');
      const exitCode = code ?? 1;

      resolve(ok({ stdout, stderr, exitCode }));
    });
  });
}

/**
 * Execute a command and assert exit code is 0
 * Throws on non-zero exit or errors
 *
 * @param command - Command to execute
 * @param args - Arguments array
 * @param options - Execution options
 * @returns stdout on success
 * @throws Error on non-zero exit or execution failure
 */
export async function execCommandStrict(
  command: string,
  args: readonly string[],
  options: ExecOptions = {}
): Promise<string> {
  const result = await execCommand(command, args, options);

  if (result.success === false) {
    throw result.error;
  }

  if (result.data.exitCode !== 0) {
    const errorOutput = result.data.stderr.trim() !== ''
      ? result.data.stderr
      : result.data.stdout;
    throw new Error(
      `Command failed with exit code ${result.data.exitCode}: ${command} ${args.join(' ')}\n${errorOutput}`
    );
  }

  return result.data.stdout;
}

/**
 * Execute a command and return whether it succeeded (exit code 0)
 *
 * @param command - Command to execute
 * @param args - Arguments array
 * @param options - Execution options
 * @returns true if exit code is 0, false otherwise
 */
export async function execCommandSucceeds(
  command: string,
  args: readonly string[],
  options: ExecOptions = {}
): Promise<boolean> {
  const result = await execCommand(command, args, options);
  return result.success === true && result.data.exitCode === 0;
}

/**
 * Normalize line endings to Unix style (LF)
 * Handles Windows CRLF output
 */
export function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, '\n');
}

/**
 * Split command output into lines, handling Windows line endings
 */
export function splitLines(output: string): readonly string[] {
  return normalizeLineEndings(output.trim()).split('\n').filter(line => line !== '');
}

/**
 * Quote a path for display (not for shell execution)
 */
export function quotePath(filePath: string): string {
  if (filePath.includes(' ')) {
    return `"${filePath}"`;
  }
  return filePath;
}
