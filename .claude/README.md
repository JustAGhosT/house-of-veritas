# Claude Agent System

Multi-agent assessment framework with lifecycle hooks, persistent state, and domain-specific rules.

## Architecture

```text
┌──────────────────────────────────────────────────────────┐
│                    LIFECYCLE HOOKS                        │
│  SessionStart → PreToolUse → PostToolUse → Stop          │
│  (env check)    (protect)    (warn)        (build check) │
└──────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
┌──────────────────────┐          ┌──────────────────────┐
│    DOMAIN RULES      │          │     PERMISSIONS      │
│  security.md         │          │    settings.json     │
│  testing.md          │          │  allow/deny lists    │
│  typescript.md       │          │  env variables       │
│  nextjs.md           │          └──────────────────────┘
│  infrastructure.md   │
└──────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│         ORCHESTRATOR            │
│    (00-orchestrator.md)         │
│  Dispatches, collects, ranks   │
└──────────┬──────────────────────┘
           │
    ┌──────┼──────────────────────────────────────────┐
    │      │      │      │      │      │      │       │
    ▼      ▼      ▼      ▼      ▼      ▼      ▼       ▼
┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐
│CI/CD ││Infra ││Test  ││API   ││DB    ││UI    ││Arch  ││Refac │
│  01  ││  02  ││  03  ││  04  ││  05  ││  06  ││  07  ││  08  │
└──────┘└──────┘└──────┘└──────┘└──────┘└──────┘└──────┘└──────┘
    │      │      │      │      │      │      │       │
    ▼      ▼      ▼      ▼      ▼      ▼      ▼       ▼
┌──────────────────────────────────────────────────────────────┐
│              PERSISTENT STATE + REPORTS                       │
│   .claude/state/orchestrator.json   .claude/reports/*.md     │
└──────────────────────────────────────────────────────────────┘
         ▲              ▲
         │              │
    ┌──────┐       ┌──────┐
    │Bugs  │       │Vert. │
    │  09  │       │  10  │
    └──────┘       └──────┘
```

## Components

### Agents (10 + orchestrator)

Specialized assessors that scan specific domains of the codebase.
Each has a role, scope (file patterns), and checklist.

### Commands (17 total)

Executable prompts: 11 assessment commands + 6 operational commands
(healthcheck, fix, discover, deploy, review-pr, security-audit).

### Hooks (5 lifecycle scripts)

Automated safety checks triggered during Claude Code sessions:

- **SessionStart**: Verify environment, install deps, run build check
- **PreToolUse (Write|Edit)**: Block writes to sensitive files
- **PreToolUse (Bash)**: Block destructive commands
- **PostToolUse (Write|Edit)**: Warn about uncommitted changes
- **Stop**: Verify TypeScript and tests still pass

### Rules (5 domain files)

Project-specific coding standards agents follow during fixes.

### State

Persistent orchestrator state that survives across sessions.
Updated by `discover` and `assess-all` commands.

### Permissions

`settings.json` whitelists safe commands and blocks destructive ones.
