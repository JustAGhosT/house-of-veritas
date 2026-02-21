# Assess Database Layer

Read the agent definition at `.claude/agents/05-database.md` and execute a thorough assessment of the data layer.

## Instructions
1. Read `.claude/agents/05-database.md` for the full checklist
2. Scan `lib/services/baserow.ts`, `lib/services/docuseal.ts`, `lib/users.ts`
3. Review `terraform/modules/database/` and `terraform/modules/storage/`
4. Check `config/azure-functions/backup-manager/` for backup strategy
5. Evaluate data models, CRUD completeness, error handling, and integrity
6. Write your findings to `.claude/reports/database-report.md`
7. Return a brief summary of data layer gaps

Focus on: data model completeness, integration reliability, backup strategy, and security.
