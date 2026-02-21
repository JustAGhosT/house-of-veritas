# CLAUDE.md

Project context for Claude Code / Cursor AI sessions.

## Project

**House of Veritas** — Estate management platform for residential property operations. Built with Next.js 16, deployed to Azure.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend:** Next.js API routes, Azure Functions (Python)
- **Database:** Baserow (operational), PostgreSQL (DocuSeal/Baserow backend), MongoDB (kiosk)
- **Infrastructure:** Terraform (Azure), Docker, GitHub Actions CI/CD
- **Integrations:** DocuSeal (e-signatures), Baserow (data), SendGrid (email), Twilio (SMS)

## Key Commands

```bash
npm ci                    # Install dependencies
npm run dev               # Start dev server (port 3000)
npm run build             # Production build
npm run lint              # ESLint check
npm test                  # Run unit tests (Vitest)
npm run test:e2e          # Run E2E tests (Playwright)
npm run test:coverage     # Coverage report
npx tsc --noEmit          # Type check
```

## Architecture

```
app/                      # Next.js pages and API routes
  api/                    # 44 API endpoints
  dashboard/              # Per-user dashboards (hans, charl, lucky, irma)
  login/, kiosk/          # Public pages
lib/                      # Shared libraries
  auth/                   # JWT, RBAC, rate limiting
  services/               # Baserow, DocuSeal, notifications, marketplace
components/               # React components (89 files)
config/azure-functions/   # 8 Python Azure Functions
terraform/                # IaC (11 modules)
tests/                    # Unit (Vitest) + E2E (Playwright)
.claude/                  # Agent system, hooks, rules, state
```

## Users (Personas)

| ID | Role | Dashboard |
|----|------|-----------|
| hans | admin | Full estate oversight, payroll, reports |
| charl | operator | Workshop, vehicles, time clock |
| lucky | operator | Garden, expenses, inventory |
| irma | resident | Household, meal planning, documents |

## Agent System

See `AGENTS.md` for the multi-agent assessment framework. Key commands:
- Individual: `Read .claude/commands/assess-{domain}.md`
- Full audit: `Read .claude/commands/assess-all.md`
- Reports: `.claude/reports/` (gitignored)

## Rules

- Security: `.claude/rules/security.md`
- Testing: `.claude/rules/testing.md`
- TypeScript: `.claude/rules/typescript.md`
- Next.js: `.claude/rules/nextjs.md`
- Infrastructure: `.claude/rules/infrastructure.md`

## Hooks

Lifecycle hooks in `.claude/hooks/`:
- `session-start.sh` — Verify environment and build state
- `protect-sensitive.sh` — Block writes to .env, .tfvars, credentials
- `guard-destructive-bash.sh` — Block force-push, hard reset, terraform destroy
- `warn-uncommitted.sh` — Warn when 10+ uncommitted files
- `stop-build-check.sh` — Verify TypeScript and tests pass before finishing

## Current State

Run `/assess-all` for latest metrics. See `.claude/reports/orchestrator-summary.md` for prioritized backlog.
