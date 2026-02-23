# Financial/Expense Management Suite PRD

**Module/Feature Name:** Financial/Expense Management Suite (Cross-Module)  
**Marketing Name:** VeritasVault Finance & Shared Spend Engine  
**Readiness:** Draft — comprehensive flows for expense, shared/project budget, approval and reporting, fraud/split handling, data model/API/UX ready

---

## Platform/Mesh Layer(s)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js/React (expense entry, project dashboards, approval workflows, receipt handling, alerts) |
| Backend | Baserow (expense, budget, approval storage), Azure Functions (real-time reimburse/notify, fraud/flag automation) |
| Storage | Azure Blob (receipts, supporting documents) |
| Mesh Integration | Chore, project, events, renovation, maintenance, notification/analytics, document locker, compliance/incident |

---

## Primary Personas

- **Residents** (submit, approve, reconcile shared and individual expenses)
- **Admin/Owner** (set, manage budgets, reporting and overrides)
- **Project/Module Owners** (project-specific allocations and audits)
- **Auditor** (compliance, detail logs, trend analysis)
- **Treasurer/Accountant** (financial compliance, reporting, export)

---

## Core Value Proposition

Trustworthy, auditable, and real-time tracking of every spend, approval, budget trend, reimbursement, and project/maintenance cost across the estate—designed for fairness, compliance, and resident buy-in.

---

## Priority & License

- **Priority:** P0 – Operationally and risk-critical for mature estate operations and group transparency
- **License Tier:** Enterprise, extensible with accounting/ERP connectors, mobile receipts, API export, multi-property/tenant, multi-currency

---

## Business Outcome/Success Metrics

- Reduction in approval/reconcile lag
- Near-zero occurrence of duplicate/over-budget expenses
- Significant increase in self-service expense logging
- Diminished error rate in expense/approval
- Enhanced audit accuracy and owner trust

---

## Integration Points

- All modules: chore, project, renovation, events, maintenance
- Document Locker
- Compliance/Incident log
- Notification and Analytics suite
- IoT & Asset triggers
- Integration Marketplace/API connectors

---

## TL;DR

A full-featured suite for capturing, splitting, and approving expenses; managing and reporting on budgets (by project, room, or estate); instant mobile scan/upload for receipts, automated escalation and reminders, multi-module integrations, and comprehensive audit logs. Enables both self-service and admin override, with fraud detection, split/dispute management, and traceable financial history.

---

## Problem Statement

Manual, delayed, and non-transparent expense and approval flows create resident discontent, increase risk exposure, and waste resources. There is an absence of proper project and estate budgeting, high administrative workloads, lack of fraud/duplicate detection, and weak reporting/audit trails.

---

## Core Challenge

Deliver robust compliance and approval for project/task/estate/asset spend, while ensuring low-friction, fast, and transparent UX that reduces disputes and covers all modules, resident roles, currencies, and reporting/audit requirements.

---

## Current State

- Expense tracking via spreadsheets
- Late-scanned receipts and delayed reimbursements
- Frequent lost approvals and unclear chargebacks
- Manual and ad hoc project expense splits
- High friction with ownership-level data access and reporting

---

## Why Now?

- Tightening regulatory standards
- Increasing ownership expectations
- Stronger emphasis on fairness and resident participation

---

## Goals & Objectives

- Reduce approval lag by 50%
- Automate >70% of receipts entry and project allocation
- <2% duplicate/dispute rate
- <24h average reimbursement
- Complete audit logs
- Active multi-module synchronization

### Business Goals

- Reduce op-ex and insurance risk
- Strengthen owner/treasurer control
- Streamline audit processes
- Enable transparent cost-sharing and community engagement
- Deliver compliance and reporting value

### User Goals

- Effortless and reliable expense submission/splitting
- Real-time feedback on approvals and status
- Transparent due/outstanding balances
- Instant access to receipts and approvals
- Minimal administrative delays
- Easy historical lookup by project, person, or period

### Non-Goals (Out of Scope)

- Payroll execution (API-out only)
- Automated ERP/export workflows (integration, not native build, at MVP)
- Fines/dunning enforcement (post-MVP)

---

## Measurable Objectives

| Objective | Baseline | Target | Timeline |
|-----------|----------|--------|----------|
| Receipts submitted electronically | <40% | 90% | 3 months |
| Approve/deny cycle time | ~60h | <24h | 6 months |
| Project budget sync (with expenses) | Manual/ad hoc | 80%+ | 3 months |
| Owner/compliance audit satisfaction | <75% | 95%+ | 6 months |

---

## Stakeholders

| Role | Responsibilities |
|------|------------------|
| Residents | Submit, share, and approve expenses; receive status and reconciliation |
| Admin | Manage budgets, approvals, overrides, and audit/reports |
| Owner/Treasurer/Auditor | Set policy, run audits, manage export/analytics |
| Project Lead | Tag, track, and alert on project-related spend |

---

## User Personas & Stories

### Primary Personas

**Resident Spender**

- Wants quick logging and clear split/approval for shared/project/non-routine expenses

**Admin/Owner/Treasurer**

- Needs robust approval, control, and reporting for risk and compliance

**Project Lead**

- Responsible for associating expenses with projects and responding to over/underrun alerts

**Auditor/Compliance**

- Requires transparent, traceable, exportable records for auditing and governance

### User Stories

1. **Resident:** As a resident, I snap/submit a receipt, split/share/assign my expense, know my part due, and see its approval or denial immediately.
2. **Admin/Treasurer:** As an admin/treasurer, I set and monitor all budgets, track overdue expenses, escalate/lock/freeze problematic transactions, and oversee complete logs for audits and exports.
3. **Project Lead:** As a project lead, I tag and link costs to projects, import expenses from related modules, see budget over/under trends, receive alerts, and nudge participants.

---

## Use Cases & Core Flows

### Primary Use Cases

1. **Expense Log:** Auto-categorize/scan receipt (photo/PDF), prompt for split/project, submit for workflow approval; show real-time status/actions.
2. **Admin/Approver Workflow:** Receive instant tasks/reminders, approve/deny/flag expenses, manage the expense log, handle escalations.
3. **Budget/Project Sync:** Auto-sort expenses by project/cost center, alert on thresholds, and trigger notifications.
4. **Audit Trail:** Integrates with tasks/chore/project module, allowing detailed reports and traceable logs.
5. **Fraud/Flag/Dispute:** Automated logic detects duplicates, fraud repeats, missed receipts, and policy breaches.

### User Flow Diagram

```text
[Scan/Add] → [Share/Split] → [Approve/Flag] → [Status/Pay] → [Audit/Export]
     ↑                                                              ↓
[Project/Chore/Module Tagging]                    [Stale/Dispute/Flag → Admin]
```

### Edge Cases

- Handling multi-currency expenses
- Late or missing receipts
- Duplicates/double bookings
- Missed splits/shared costs
- Repeat fraud attempts
- Absence of approver
- Disputes and project budget overruns
- Accidentally denied expenses
- Owner/export failures

---

## Functional Requirements

- Mobile scan/upload/manual add (PDF/photo, supports multi-currency)
- OCR for auto-categorization, project/task/chore tagging
- Split/shared assignment with approval logic
- Real-time notifications for approval/denial/flagging
- Configurable approval ladder logic (with escalation)
- Budget setting, freezing, and live export for owner periods
- Dispute/fraud reporting, duplicate tagging
- Full compliance/audit logging, admin overrides
- Outbound integration with payroll/accounting APIs

---

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Mobile-first UX | OCR processing in under 5 seconds per upload |
| Approval/denial cycle | Within 12 hours on average |
| Security | End-to-end encryption, full event audit log |
| Scalability | Thousands of receipts per year |
| Compliance | Accessibility (ARIA), 7-year retention/export |
| Batch operations | Bulk events/exports supported |

---

## Mesh Layer Mapping

| Layer | Components Involved | Responsibilities |
|-------|---------------------|------------------|
| Frontend | Expense entry, split/share, approval | User interaction, status, export/history |
| Backend | Expense/Budget DB, fraud/approval logic | Logic, workflow, compliance, notifications |
| Storage | Blob/document logs | Receipts, export archives |
| Integration | Chore/project/incident modules | Sync, alerts, compliance vault |

---

## APIs & Integrations

### Required APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/expense/add | POST/GET | Create and retrieve expenses |
| /api/expense/split | POST | Manage shared/split expenses |
| /api/expense/status | GET | Fetch approval/payment status |
| /api/expense/approve | POST | Approval step |
| /api/expense/deny | POST | Denial step |
| /api/expense/fraudflag | POST | Fraud/dispute workflow |
| /api/report/export | GET | Audit and budget exports |
| /api/budget | GET/POST | Get/set budgets |
| /api/notify | POST | Real-time communications |
| API hooks | — | Cross-module integration |

### External Dependencies

- Baserow tables (budget/expense)
- Notification framework
- OCR engine
- Accounting/payroll connectors
- DocuSeal/e-signature
- ERP/marketplace platforms

---

## Data Models

| Model | Fields |
|-------|--------|
| Expense | ID, amount, date, user, payer/approved, split/share mapping, project/module tie, status/log, scanned receipt, notes, fraud/dispute flags |
| Approval | ExpenseID, user, timestamp, status, admin override |
| Budget | Project/estate, amount, spent, threshold, over/under, alerts |
| Audit | ExpenseID, actor, action, timestamp, notes, export link |

---

## User Experience & Entry Points

- Scan/upload, split/share, view status/approval, export/report modules, admin overrides
- Linked from projects (chore, tool, renovation, event)

---

## Onboarding Flow

- Guided demo: Receipt scan, approval
- First budget/threshold set and alert
- Walkthrough reporting and exports
- Project-linked split/tag learning

---

## Primary UX Flows

- **Add expense** → split/assign → approve/deny/flag → status update
- **Fraud/dispute:** scan → flag → admin resolve
- **Project:** expense add/tag → budget update → cost trend reporting

---

## Accessibility Requirements

- ARIA for approval/denial screens
- Mobile camera compatibility
- Readable feedback, consistent alt-text
- Color coding for audit logs and status states

---

## Success Metrics

### Key Metrics

| Metric | Description |
|--------|-------------|
| Approval/reconcile time | Average time per approval cycle |
| Over/under budget trend | Frequency and size of budget variance |
| Flagged/disputed count | Number of disputes/fraud flags |
| Audit trail completeness | % audit-ready periods and logs |
| Admin lift | Effort savings for financial controls |

### Leading Indicators

- Average time from new expense to approval
- Project overruns flagged/analyzed
- Recurring dispute ratios
- OCR and fraud alert scan rates

### Lagging Indicators

- Total cost per capita/unit/project
- Project drift (budget growth/variance)
- Owner satisfaction/retention scores
- Export/audit frequency

### Measurement Plan

- Metrics tracked in internal analytics dashboard
- Weekly/monthly trend reports, audit logs
- Owner/treasurer dashboard and summary
- Regular sampling and automated anomaly detection

---

## Timeline & Milestones

| Phase | Scope | Target Date |
|-------|-------|-------------|
| 1 | Core upload/approval, split/share, status/history | Day 0–60 |
| 2 | Fraud/dispute/flag, budget analytics/export, API-connectors | Day 61–120 |

---

## Known Constraints & Dependencies

### Technical Constraints

- Receipt/image storage scalability
- Approval-queue processing speed at scale
- Audit/fraud logic compute and latency

### Business Constraints

- Payroll/accounting integration readiness
- Staffing for dispute/override
- Onboarding processes for admins and owners
- Budget configuration complexity

### Dependencies

- OCR service robustness/uptime
- Notification infra with defined SLAs
- Cross-module sync/live API endpoints
- Initial admin onboarding and training
- ERP/export API support

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Late/missing approvals | Delayed payments | Auto escalation after defined window |
| Expense spam/fraud | Reporting delay | Smart flagging, frequency limits, audits |
| Multi-currency error | Financial disputes | Forcing manual review for outlier entries |
| Batch export failures | Audit/compliance gap | Manual trigger and owner notification |

---

## Open Questions

| Question | Owner | Target Resolution | Impact |
|----------|-------|-------------------|--------|
| Multi-level approval required for over-budget? | Product | Prior to MVP | Compliance/UX |
| Recurring/auto-pay support in workflow? | Eng/PM | Next sprint plan | User/automation demands |
| Expense visibility: All users vs project-only? | Product | Design review | Transparency vs privacy |
| Payroll/ERP webhook at MVP or post-launch? | Eng/Product | Go-live review | Export/integration timing |

---

## Appendix

### Research & Data

- Analysis of manual vs. automated expense/approval logs
- Estate/project/incident budgeting data
- Integration studies on ERP and PropTech solutions

### Design Mockups

- Mobile scan/upload interface
- Budget/approvals workflows
- Project owner/admin dashboards
- Treasurer/export control panels

### Technical Feasibility

- Expense scan/split/approval/event logging demoed
- OCR, fraud detection, and approval sync in live pilot
- Multi-currency and split features functional via prototype

### Competitive Analysis

Most PropTech or co-living tools support only module-specific spend (rent, supply, single-project) with basic approvals. VeritasVault's suite uniquely offers full estate-wide, multi-currency/project linkage, audit-grade compliance, integrated dispute management, and advanced integration to external systems, establishing a defensible differentiator for group/estate operations at scale.
