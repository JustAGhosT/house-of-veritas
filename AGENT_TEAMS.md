# Agent Teams

Team-based organization of the HouseOfVeritas agent system.

## Team Structure

### Platform Team
Agents responsible for the core platform infrastructure.

| Agent | Focus | Command |
|-------|-------|---------|
| 01 - CI/CD | GitHub Actions, pipelines, secrets | `assess-cicd` |
| 02 - Infrastructure | Terraform, Azure, security | `assess-infrastructure` |

### Application Team
Agents responsible for the application layer.

| Agent | Focus | Command |
|-------|-------|---------|
| 04 - API/Functions | Routes, Azure Functions | `assess-api` |
| 05 - Database | Data layer, storage, models | `assess-database` |
| 06 - UI Layer | Components, accessibility, UX | `assess-ui` |

### Quality Team
Agents responsible for code quality and testing.

| Agent | Focus | Command |
|-------|-------|---------|
| 03 - Testing | Coverage, quality, frameworks | `assess-testing` |
| 08 - Refactoring | SOLID, DRY, code smells | `assess-refactoring` |
| 09 - Bugs & Features | Bug detection, feature gaps | `assess-bugs` |

### Architecture Team
Agents responsible for system-wide concerns.

| Agent | Focus | Command |
|-------|-------|---------|
| 07 - Architecture | System design, patterns, scalability | `assess-architecture` |
| 10 - Vertical Features | Cross-stack feature completeness | `assess-vertical` |

### Orchestrator

| Agent | Focus | Command |
|-------|-------|---------|
| 00 - Orchestrator | Dispatches all agents, synthesizes | `assess-all` |

## Execution Model

1. **Individual assessment:** Run a single agent's command for focused analysis
2. **Team assessment:** Run all agents in a team for domain-specific audit
3. **Full assessment:** Run orchestrator to dispatch all 10 agents and synthesize
4. **Fix mode:** Read a report and fix identified issues

## State Tracking

Orchestrator state persists in `.claude/state/orchestrator.json` across sessions.
Template at `.claude/state/orchestrator.json.template`.
