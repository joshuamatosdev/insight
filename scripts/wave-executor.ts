#!/usr/bin/env node
/**
 * Wave Executor
 * 
 * Executes all agents in a wave in parallel using git worktrees.
 * 
 * Usage:
 *   npm run wave:run 1         # Run all Wave 1 Claude agents
 *   npm run wave:run 2         # Run all Wave 2 Claude agents
 *   npm run wave:status 1      # Check status of Wave 1 branches
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  type Result,
  ok,
  err,
  execCommand,
  getRepoRoot,
  listAgentBranches,
} from './shared/index.js';
import { extractErrorMessage } from './shared/errors.js';

/**
 * Wave definitions with Claude Code agent tasks
 */
const WAVES: Record<number, WaveDefinition> = {
  1: {
    name: 'Foundation',
    agents: [
      { agent: 'wave1-registration', task: 'implement complete registration flow with email verification' },
      { agent: 'wave1-openapi', task: 'setup OpenAPI type generation from Spring Boot to TypeScript' },
      { agent: 'wave1-password-reset', task: 'implement password reset flow with email tokens' },
      { agent: 'wave1-rbac-core', task: 'implement core RBAC system with roles and permissions' },
    ],
  },
  2: {
    name: 'Core Features',
    agents: [
      { agent: 'wave2-rbac-ui', task: 'create RBAC admin UI for roles and permissions management' },
      { agent: 'wave2-alerts', task: 'implement opportunity alerts system with configurable rules' },
      { agent: 'wave2-notifications', task: 'create in-app notification system with bell icon' },
      { agent: 'wave2-audit-log', task: 'implement audit trail system for all entity changes' },
      { agent: 'wave2-user-prefs', task: 'create user preferences system for theme and settings' },
    ],
  },
  3: {
    name: 'Advanced Features',
    agents: [
      { agent: 'wave3-sso-oauth', task: 'implement OAuth2 login with Google and Microsoft' },
      { agent: 'wave3-mfa', task: 'implement TOTP multi-factor authentication' },
      { agent: 'wave3-tenant-admin', task: 'create tenant admin portal for settings and branding' },
      { agent: 'wave3-search-enhance', task: 'integrate Elasticsearch for advanced search' },
      { agent: 'wave3-export-enhance', task: 'implement PDF export and scheduled exports' },
      { agent: 'wave3-dashboard-enhance', task: 'add new dashboard widgets and charts' },
    ],
  },
  4: {
    name: 'Financial & Analytics',
    agents: [
      { agent: 'wave4-billing', task: 'implement Stripe subscription billing' },
      { agent: 'wave4-usage-tracking', task: 'implement usage tracking for metered billing' },
      { agent: 'wave4-report-builder', task: 'create custom report builder with drag-and-drop' },
      { agent: 'wave4-analytics-core', task: 'build analytics engine with data aggregation' },
    ],
  },
  5: {
    name: 'Polish & Accessibility',
    agents: [
      { agent: 'wave5-perf-optimize', task: 'optimize performance with caching and lazy loading' },
      { agent: 'wave5-security-audit', task: 'implement security hardening measures' },
      { agent: 'wave5-api-docs', task: 'enhance API documentation with examples' },
      { agent: 'wave5-error-handling', task: 'implement global error handling' },
    ],
  },
  6: {
    name: 'Contractor Portal',
    agents: [
      { agent: 'wave6-onboarding-flow', task: 'create multi-step onboarding wizard' },
      { agent: 'wave6-ai-integration', task: 'integrate OpenAI for contract analysis' },
      { agent: 'wave6-portal-dashboard', task: 'create contractor-specific dashboard' },
    ],
  },
};

interface WaveDefinition {
  name: string;
  agents: readonly AgentTask[];
}

interface AgentTask {
  agent: string;
  task: string;
}

/**
 * Parse command line arguments
 */
function parseArgs(args: readonly string[]): Result<{ command: 'run' | 'status' | 'list'; waveNumber: number | undefined }, Error> {
  const command = args.at(0);
  const waveArg = args.at(1);

  if (command === undefined || command === 'list' || command === '') {
    return ok({ command: 'list', waveNumber: undefined });
  }

  if (command === 'status') {
    const waveNumber = waveArg !== undefined ? parseInt(waveArg, 10) : undefined;
    return ok({ command: 'status', waveNumber });
  }

  if (command === 'run') {
    if (waveArg === undefined) {
      return err(new Error('Wave number required. Usage: npm run wave:run <wave-number>'));
    }
    const waveNumber = parseInt(waveArg, 10);
    if (isNaN(waveNumber) || waveNumber < 1 || waveNumber > 6) {
      return err(new Error('Wave number must be 1-6'));
    }
    return ok({ command: 'run', waveNumber });
  }

  // Try to parse as wave number directly
  const waveNumber = parseInt(command, 10);
  if (isNaN(waveNumber) === false && waveNumber >= 1 && waveNumber <= 6) {
    return ok({ command: 'run', waveNumber });
  }

  return err(new Error(`Unknown command: ${command}. Use 'run', 'status', or 'list'.`));
}

/**
 * List all waves and their agents
 */
function listWaves(): void {
  console.log('📋 Wave Definitions\n');

  for (const [waveNum, wave] of Object.entries(WAVES)) {
    console.log(`Wave ${waveNum}: ${wave.name}`);
    console.log('─'.repeat(40));
    for (const agent of wave.agents) {
      console.log(`  • ${agent.agent}`);
      console.log(`    Task: ${agent.task.substring(0, 60)}...`);
    }
    console.log();
  }

  console.log('📌 Usage:');
  console.log('   npm run wave:run 1        # Run Wave 1 agents');
  console.log('   npm run wave:status 1     # Check Wave 1 status');
  console.log('   npm run wave:list         # List all waves');
}

/**
 * Show status of wave branches
 */
async function showWaveStatus(waveNumber: number | undefined, repoRoot: string): Promise<void> {
  const branchesResult = await listAgentBranches(repoRoot);
  
  if (branchesResult.success === false) {
    console.error(`❌ Failed to list branches: ${branchesResult.error.message}`);
    return;
  }

  const branches = branchesResult.data;
  const waveFilter = waveNumber !== undefined ? `wave${waveNumber}` : 'wave';

  console.log(`\n🌿 Agent Branches ${waveNumber !== undefined ? `(Wave ${waveNumber})` : '(All Waves)'}\n`);

  const filteredBranches = branches.filter(b => b.agentName.includes(waveFilter));

  if (filteredBranches.length === 0) {
    console.log('No agent branches found for this wave.');
    console.log('\nStart a wave with: npm run wave:run <wave-number>');
    return;
  }

  console.log('  Branch'.padEnd(55) + 'Commits  Status');
  console.log('  ' + '─'.repeat(75));

  for (const branch of filteredBranches) {
    const commits = String(branch.commitCount).padEnd(8);
    const status = branch.commitCount > 0 ? '✅ Has changes' : '⬜ Empty';
    console.log(`  ${branch.branchName.substring(0, 53).padEnd(53)} ${commits} ${status}`);
  }

  console.log('\n📌 To merge: npm run git:merge <branch-name>');
}

/**
 * Run all agents in a wave
 */
async function runWave(waveNumber: number, repoRoot: string): Promise<void> {
  const wave = WAVES[waveNumber];
  
  if (wave === undefined) {
    console.error(`❌ Wave ${waveNumber} not found`);
    return;
  }

  console.log(`\n🚀 Wave ${waveNumber}: ${wave.name}`);
  console.log('═'.repeat(50));
  console.log(`\nThis wave contains ${wave.agents.length} Claude Code agents.\n`);

  console.log('Agents to run:');
  for (const agent of wave.agents) {
    console.log(`  • ${agent.agent}`);
  }

  console.log('\n📌 Run each agent in a separate terminal:\n');

  for (const agent of wave.agents) {
    console.log(`npm run git:agent ${agent.agent} "${agent.task}"`);
  }

  console.log('\n' + '─'.repeat(50));
  console.log('💡 Tip: Open multiple terminals and run agents in parallel.');
  console.log('💡 Each agent works in an isolated git worktree.\n');

  console.log('After completion, check status with:');
  console.log(`   npm run wave:status ${waveNumber}`);

  console.log('\nMerge completed branches with:');
  console.log('   npm run git:merge:list');
  console.log('   npm run git:merge <branch-name>');
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

  const { command, waveNumber } = parsedArgs.data;

  // Get repo root
  const rootResult = await getRepoRoot();
  if (rootResult.success === false) {
    console.error(`❌ Not in a git repository: ${rootResult.error.message}`);
    process.exit(1);
  }
  const repoRoot = rootResult.data;

  switch (command) {
    case 'list':
      listWaves();
      break;
    case 'status':
      await showWaveStatus(waveNumber, repoRoot);
      break;
    case 'run':
      if (waveNumber !== undefined) {
        await runWave(waveNumber, repoRoot);
      }
      break;
  }
}

// Entry point
const args = process.argv.slice(2);
run(args).catch((error: unknown) => {
  console.error(`\n❌ Unexpected error: ${extractErrorMessage(error)}`);
  process.exit(1);
});
