# Git Agent Workflow

Multi-branch agent execution system for parallel, isolated development work.

## Overview

The git agent runner allows AI agents to work in isolated git branches without affecting your working directory. This enables:

- **Parallel Development** - Multiple agents working on different features simultaneously
- **Isolation** - Each agent works in its own git worktree
- **Verification** - Automatic verification before merging
- **Clean History** - Structured commits with task context

## Quick Start

```bash
# Install dependencies (first time only)
npm install

# Run an agent on a task
npm run git:agent tech-lead "implement user registration page"

# List agent branches
npm run git:merge list

# Merge a branch (with verification)
npm run git:merge agent/tech-lead/20240126-implement-user-registr-abc123

# Merge without verification (use with caution)
npm run git:merge agent/tech-lead/... --skip-verify

# Squash merge
npm run git:merge agent/tech-lead/... --squash
```

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Working Directory                    │
│                         (unchanged)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Git Agent Runner                           │
│  1. Validates clean working directory                        │
│  2. Creates isolated worktree in .agent-worktrees/           │
│  3. Creates feature branch: agent/<name>/<timestamp>-<task>  │
│  4. Executes Claude agent in isolation                       │
│  5. Commits changes with structured message                  │
│  6. Cleans up worktree                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Merge Manager                              │
│  1. Lists all agent branches                                 │
│  2. Checks out branch for verification                       │
│  3. Runs: gradle build, tsc, tests                           │
│  4. Merges to master (regular or squash)                     │
│  5. Deletes feature branch                                   │
└─────────────────────────────────────────────────────────────┘
```

## Available Agents

| Agent | Model | Description |
|-------|-------|-------------|
| `tech-lead` | Opus | Senior technical lead for architecture and complex work |
| `feature-dev` | Sonnet | Feature developer for new functionality with TDD |
| `test-writer` | Sonnet | Test specialist for comprehensive behavioral tests |

## Usage Examples

### Tech Lead - Complex Architecture Work

```bash
npm run git:agent tech-lead "refactor the authentication system to use JWT"
npm run git:agent tech-lead "implement multi-tenant row-level security"
npm run git:agent tech-lead "design the CRM module architecture"
```

### Feature Dev - New Features

```bash
npm run git:agent feature-dev "add user registration page"
npm run git:agent feature-dev "implement contact search with filters"
npm run git:agent feature-dev "add CSV export for opportunities"
```

### Test Writer - Test Coverage

```bash
npm run git:agent test-writer "add tests for ContractService"
npm run git:agent test-writer "write E2E tests for login flow"
npm run git:agent test-writer "increase test coverage for API endpoints"
```

## Creating Custom Agents

Create a markdown file in `.claude/agents/<name>.md`:

```markdown
---
name: my-agent
description: Description of what this agent does
tools: Read,Write,Edit,Glob,Grep,Bash
model: sonnet
permissionMode: default
---

# My Agent

Instructions for the agent...
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Agent identifier (matches filename) |
| `description` | Yes | Brief description shown in logs |
| `tools` | No | Comma-separated list of allowed tools |
| `model` | No | `opus`, `sonnet`, or `inherit` |
| `permissionMode` | No | Permission handling mode |

## Branch Naming Convention

```
agent/<agent-name>/<YYYYMMDD-HHMMSS>-<task-slug>-<random>

Examples:
agent/tech-lead/20240126-143052-implement-user-registr-abc123
agent/feature-dev/20240126-150230-add-contact-search-xyz789
```

## Verification Steps

The merge manager runs these checks before merging:

1. **Gradle Build** - Compiles Java code
2. **TypeScript** - Type checks frontend code
3. **Tests** - Runs full test suite

All must pass before merge is allowed (unless `--skip-verify`).

## Parallel Agent Execution

You can run multiple agents simultaneously since each works in its own worktree:

```bash
# Terminal 1
npm run git:agent tech-lead "implement CRM backend"

# Terminal 2
npm run git:agent feature-dev "add registration page"

# Terminal 3
npm run git:agent test-writer "add API endpoint tests"
```

Each creates a separate branch that can be merged independently.

## Troubleshooting

### "Working directory has uncommitted changes"

Commit or stash your changes before running an agent:

```bash
git stash
npm run git:agent tech-lead "my task"
git stash pop
```

### "Agent not found"

Ensure the agent definition exists in `.claude/agents/<name>.md`.

### Worktree cleanup

If a worktree is left behind (e.g., from a crash):

```bash
git worktree list
git worktree remove --force .agent-worktrees/<name>
git worktree prune
```

## Integration with Other Agents (Cursor, etc.)

When coordinating with other AI agent systems:

1. **Assign isolated tasks** - Give each system non-overlapping work
2. **Use separate branches** - Each system works on different features
3. **Merge sequentially** - Merge one branch at a time to avoid conflicts
4. **Document boundaries** - Create a `PHASE_X_COMPLETE.md` when done

See the main TODO.md for task parallelization guidelines.
