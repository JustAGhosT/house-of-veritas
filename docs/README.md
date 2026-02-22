# Documentation Index

## 01-product/ -- Product and Design

| Document | Description |
| ---------- | ------------- |
| [01-platform-specification.md](01-product/01-platform-specification.md) | Platform vision, personas, core modules, success metrics |
| [02-functional-design.md](01-product/02-functional-design.md) | Functional requirements, workflows, user stories for all 8 modules |
| [03-product-requirements.md](01-product/03-product-requirements.md) | Full PRD with implementation status across all phases |

## 02-architecture/ -- Technical Architecture

| Document | Description |
| ---------- | ------------- |
| [01-technical-design.md](02-architecture/01-technical-design.md) | System architecture, data models, API design, security model |
| [02-naming-convention.md](02-architecture/02-naming-convention.md) | Azure resource naming convention (`{prefix}-{env}-{project}-{type}-{region}`) |
| [03-infrastructure.md](02-architecture/03-infrastructure.md) | Terraform module map, Azure resource inventory, traffic flow, cost estimate |
| [04-api-versioning.md](02-architecture/04-api-versioning.md) | API versioning strategy |
| [05-persistence-strategy-adr.md](02-architecture/05-persistence-strategy-adr.md) | ADR: Persistence strategy, polyglot stores, weighted decision matrices |
| [06-access-control-adr.md](02-architecture/06-access-control-adr.md) | ADR: Access control model — roles, responsibilities, project membership, task visibility |
| [07-ai-integration-adr.md](02-architecture/07-ai-integration-adr.md) | ADR: AI integration strategy — Azure Foundry, suggestion APIs, fallback behavior |
| [08-testing-strategy-adr.md](02-architecture/08-testing-strategy-adr.md) | ADR: Testing strategy — Vitest, Playwright, coverage targets, CI integration |

## 03-deployment/ -- Deployment and Operations

| Document | Description |
| ---------- | ------------- |
| [01-deployment-guide.md](03-deployment/01-deployment-guide.md) | End-to-end Azure deployment: auth, Terraform, DNS, SSL, integrations, secrets |
| [02-local-development.md](03-deployment/02-local-development.md) | Docker Compose setup, prerequisites, local vs production comparison |
| [03-ci-cd-workflows.md](03-deployment/03-ci-cd-workflows.md) | GitHub Actions workflows: plan, apply, deploy, destroy, checklist |
| [04-rollback-procedure.md](03-deployment/04-rollback-procedure.md) | Rollback procedure for Next.js, Functions, Terraform, containers |

## 04-configuration/ -- Application Configuration

| Document | Description |
| ---------- | ------------- |
| [01-docuseal-setup.md](04-configuration/01-docuseal-setup.md) | DocuSeal initial setup, SMTP, branding, templates, webhooks, API |
| [02-baserow-setup.md](04-configuration/02-baserow-setup.md) | Baserow database schema (8 tables), views per user, API configuration |
| [03-azure-functions.md](04-configuration/03-azure-functions.md) | Azure Functions: 8 functions for webhooks, scheduling, backups |
| [04-document-templates.md](04-configuration/04-document-templates.md) | 19 governance document templates with fields and signing workflows |
| [05-persistence-env.md](04-configuration/05-persistence-env.md) | Persistence env vars: PostgreSQL, Redis, MongoDB, Baserow, file uploads |

## 05-project/ -- Project Management

| Document | Description |
| ---------- | ------------- |
| [01-backlog.md](05-project/01-backlog.md) | Implementation backlog with phases 1-7 and task tracking |
| [02-roadmap.md](05-project/02-roadmap.md) | Future enhancements roadmap: mobile, analytics, AI, integrations |
| [03-test-report.md](05-project/03-test-report.md) | Phase 7 testing and UAT report |
| [04-changelog.md](05-project/04-changelog.md) | Version history and release notes |
| [05-contributing.md](05-project/05-contributing.md) | Branch strategy, commit conventions, code style, PR process |
| [ai-integration-opportunities.md](05-project/ai-integration-opportunities.md) | AI suggestion APIs, implemented features, configuration |
| [onboarding-flow.md](05-project/onboarding-flow.md) | User onboarding steps, invite flow, guided tour |
| [employees-vs-users.md](05-project/employees-vs-users.md) | Users (auth) vs Employees (Baserow), Team page consolidation |
