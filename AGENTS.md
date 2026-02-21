# HouseOfVeritas Agent System

Multi-agent assessment framework with lifecycle hooks, persistent state, and domain-specific rules.

## Quick Start

### Run a Single Assessment
```
Read .claude/commands/assess-cicd.md and follow the instructions
```

### Run Full Team Assessment
```
Read .claude/commands/assess-all.md and follow the instructions
```

### Quick Health Check
```
Read .claude/commands/healthcheck.md and follow the instructions
```

### Fix Top Issues
```
Read .claude/commands/fix.md and follow the instructions
```

## Available Commands

### Assessment Commands
| Command | Description |
|---------|-------------|
| `assess-all` | Run all 10 agents, synthesize into prioritized report |
| `assess-cicd` | Audit CI/CD pipelines and deployment workflows |
| `assess-infrastructure` | Audit Terraform and Azure resources |
| `assess-testing` | Evaluate test coverage and quality |
| `assess-api` | Audit API routes and Azure Functions |
| `assess-database` | Audit data layer and storage |
| `assess-ui` | Audit frontend components and UX |
| `assess-architecture` | Evaluate system design and patterns |
| `assess-refactoring` | Find SOLID/DRY violations and code smells |
| `assess-bugs` | Find bugs, feature gaps, enhancements |
| `assess-vertical` | Trace features across the full stack |

### Operational Commands
| Command | Description |
|---------|-------------|
| `healthcheck` | Quick project health snapshot (types, lint, tests, git) |
| `fix` | Fix highest-priority issues from latest assessment |
| `discover` | Scan codebase, update orchestrator state with metrics |
| `deploy` | Pre-deployment verification checklist |
| `review-pr` | Review a PR against project standards |
| `security-audit` | Focused security scan of the codebase |

## Directory Structure

```
.claude/
├── agents/               # Agent definitions (role, scope, checklist)
│   ├── 00-orchestrator.md
│   ├── 01-cicd.md
│   ├── 02-infrastructure.md
│   ├── 03-testing.md
│   ├── 04-api-functions.md
│   ├── 05-database.md
│   ├── 06-ui-layer.md
│   ├── 07-architecture.md
│   ├── 08-refactoring.md
│   ├── 09-bugs.md
│   └── 10-vertical-features.md
├── commands/             # Executable prompts
│   ├── assess-*.md       # Assessment commands (11 files)
│   ├── healthcheck.md    # Quick health check
│   ├── fix.md            # Fix top issues
│   ├── discover.md       # Scan and update state
│   ├── deploy.md         # Pre-deploy checklist
│   ├── review-pr.md      # PR review
│   └── security-audit.md # Security scan
├── hooks/                # Lifecycle hooks (shell scripts)
│   ├── session-start.sh      # Verify environment on session start
│   ├── protect-sensitive.sh  # Block writes to .env, .tfvars, creds
│   ├── guard-destructive-bash.sh  # Block force-push, hard reset
│   ├── warn-uncommitted.sh   # Warn when 10+ uncommitted files
│   └── stop-build-check.sh   # Verify build passes before finishing
├── rules/                # Per-domain coding rules
│   ├── security.md       # Auth, secrets, validation rules
│   ├── testing.md        # Test framework and coverage rules
│   ├── typescript.md     # Type safety and code style rules
│   ├── nextjs.md         # Next.js App Router conventions
│   └── infrastructure.md # Terraform and Azure rules
├── state/                # Persistent state (gitignored)
│   ├── orchestrator.json.template  # State template
│   └── orchestrator.json           # Active state (generated)
├── reports/              # Assessment output (gitignored)
│   └── *.md              # Individual + orchestrator reports
├── settings.json         # Permissions, hooks, env config
└── README.md             # Architecture diagram
```

## Root Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project context for Claude/Cursor AI sessions |
| `AGENTS.md` | This file — agent system documentation |
| `AGENT_TEAMS.md` | Team-based agent organization |
| `AGENT_BACKLOG.md` | Prioritized action items from latest assessment |

## How It Works

### Lifecycle Hooks
Hooks run automatically during Claude Code sessions (configured in `settings.json`):

| Hook | Trigger | Action |
|------|---------|--------|
| `session-start.sh` | Session begins | Verify Node.js, run build check, show git status |
| `protect-sensitive.sh` | Before file write | Block writes to `.env.local`, `.tfvars`, creds |
| `guard-destructive-bash.sh` | Before bash command | Block `git push --force`, `terraform destroy` |
| `warn-uncommitted.sh` | After file write | Warn if 10+ uncommitted changes |
| `stop-build-check.sh` | Session ends | Verify TypeScript and tests still pass |

### Permission System
`settings.json` defines allowed and denied commands:
- **Allowed:** npm, git, gh, terraform (read), az (read), docker
- **Denied:** force-push, hard reset, terraform destroy/apply, resource deletion

### Persistent State
The orchestrator tracks metrics and grades across sessions in `.claude/state/orchestrator.json`. Run `discover` to update, `assess-all` for full refresh.

### Domain Rules
Rules in `.claude/rules/` encode project-specific coding standards that agents follow:
- Security rules prevent credential leaks and ensure auth coverage
- Testing rules define test structure, quality standards, and CI integration
- TypeScript rules enforce type safety and consistent patterns
- Next.js rules codify App Router conventions and performance practices
- Infrastructure rules standardize Terraform and Azure configurations
