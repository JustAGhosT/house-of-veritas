# House of Veritas — Operations Swimlane Process Maps

## Module/Feature Name

Operations Swimlane Process Mapping Suite

## Marketing Name

House of Veritas Operational DNA Process Maps

## Platform/Mesh Layer(s)

- Process Management
- Operations and Governance Workflow Layer
- Integration Layer (Baserow, DocuSeal, System Automation)

## Primary Personas

- **Hans** (Admin/Owner)
- **Employees** (Charl, Lucky, Irma)
- **Residents** (New/Existing)
- **System Integrators** (DocuSeal, Baserow Automation)
- **External Parties** (HR, Legal, Contractors, Insurance, Mechanics, Bank, Insurer)

## Core Value Proposition

Centralizes, visualizes, and standardizes all critical operational processes with clear ownership, compliance triggers, and automated escalation—ensuring robust governance, auditability, and risk mitigation for House of Veritas.

## Priority

**P0 – Critical**

## License Tier

Enterprise

## Readiness

Draft

## Business Outcome/Success Metrics

- ≥95% compliance with critical operational procedures
- Onboarding time <3 days
- ≥99% documented audit trails for incidents and asset transactions
- MTTR for incident closure/escalation <24 hours

## Integration Points

- DocuSeal (contract/e-signature workflows)
- Baserow (data, log, asset database)
- System automations (rota/notification engine)
- External payroll, legal, contracting, insurance, and banking systems

## TL;DR

Operations Swimlane Process Maps provide House of Veritas with detailed, role-specific workflows for every critical function. This ensures each process is actioned, reviewed, escalated, and improved in real time, closing audit gaps and reducing operational drift through automation and strong governance.

---

## Executive Summary

House of Veritas' Operations Swimlane Process Maps encode comprehensive, audit-ready flows for onboarding, daily operations, compliance, finance, incident, and continuity management. These process lanes make ownership and escalation unambiguous, automate reminders and handoffs, and surface exceptions before they create risk. With new layers like automated workflow aging, mini-audits, parallel review, and repeat incident policy triggers, the operation insulates itself against single-point failures, drift, and overreliance on memory or manual tracking. Every handoff, approval, and compliance point is actionable, visible, and subject to recurring review.

---

## Onboarding (Employee and Resident)

**Swimlanes:** Hans/Admin, New Hire/Resident, System (DocuSeal, Baserow), External HR/Lawyer

### Process Flow

1. Offer/contract issued by Hans/Admin
2. Document signing via DocuSeal; legal/HR consult if required
3. System entry in Baserow: capture baseline data
4. Onboarding checklist includes:
   - Asset handover (keys, access cards)
   - Safety orientation
   - House rules review
   - Proof upload (IDs, references)
5. Admin review, feedback, or corrections loopback if issues
6. Confirmation, notifications sent, onboarding closeout and audit log entry

### Triggers & Handoffs

- Automated notifications at each transition
- **Fail paths:** unsigned docs, missing uploads, checklist incompleteness trigger red flags or HR/legal hold

### Expanded Workflows

- **Reference/Background Verification:** System-initiated on candidate entry; auto-triggers background/reference check with external parties. Includes status tracking dashboard and automated reminders for delayed responses. _Escalation:_ Missed/failed verification triggers admin and HR/legal hold, onboarding paused.
- **IT/Account Provisioning:** System-initiated on checklist progression; system creates IT/workshop accounts and notifies IT for equipment setup. If onboarding fails, accounts/equipment access auto-revoked.
- **Buddy/Mentor Assignment:** System-initiated; assigns a current staff mentor, notified by automated task. System tracks duration (configurable, e.g. 14 or 30 days) and issues reminders until marked as complete or expired. _Escalation:_ If not completed within period, supervisor alerted for direct follow-up.
- **Scheduled Anonymous Feedback (30/90 Days):** System-scheduled; prompts new joiner at day 30 and 90 for confidential feedback via digital form. Results tracked, aggregated, and surfaced to Hans/admin for onboarding improvement. _Missed Feedback:_ System escalates unsubmitted surveys to admin for personal outreach.

---

## Daily Operations & Task Management

**Swimlanes:** Admin/Hans, Employees/Residents, System/Automation

### Process Flow

1. Rota auto-assignment by System or Hans at day start
2. Task acceptance by team (Charl, Lucky, Irma)
3. Task updates and completion entered into Baserow/system; proof uploads for certain tasks
4. Missed/late tasks trigger escalation (notification + admin review)
5. Confirmation and daily closure by Admin, generating audit reports

### Expanded Workflows

- **Task Handover on Absence:** System/user-initiated; upon leave/sick mark, tasks auto-reassigned or next responsible party gets urgent notification. _Audit Log:_ Maintains record of handover—ensures nothing is orphaned.
- **Rolling/Rotating Assignment:** System-enforced; tracks past assignments and rotates critical tasks to balance load; prevents overburdening same individuals. _Escalation:_ If system detects assignment isn't accepted, triggers alternative routing.
- **Task Failure Propagation:** System-initiated; if a critical task is missed, any downstream/dependent workflows are auto-paused or blocked (e.g., asset checkout denied if safety check not done). Admins are notified and issue must be resolved before resumption.

---

## Kitchen & Hygiene Workflows

**Swimlanes:** Irma (Resident), Charl/Lucky (Employee), System, Hans/Admin, External (Cleaner/Contractor)

### Flows

- **Daily cleaning:** Resident/employee performs checklist, logs completion and proof
- **Deep cleaning:** System schedules, external cleaner involvement, post-clean audit
- **Stock/shopping:** List generated by System, approved by Hans, procurement by assigned party
- **Incident or compliance escalation:** Out-of-bounds event triggers admin/external review
- **Routine audits:** Admin or external review at set intervals
- **Rotation enforcement:** System assigns turns, escalates failures
- **Proof upload:** Required at end of each critical flow

### Expanded Workflows

- **Cross-Contamination Hazard Reporting:** User-initiated, system-flagged; reports flagged for health/safety (e.g., allergy exposure, expired food used), auto-escalated to admin and tagged for priority action.
- **Personal Locker/Food Space Audit:** System/user-initiated; regularly scheduled audits; system notifies for unclean/unauthorized storage. Events logged; repeat issues escalate to admin.
- **Scheduled (Forced) Deep Clean:** System-scheduled; deep clean is mandatory at set intervals (e.g., every 14 days); if not manually confirmed by deadline, system assigns urgent task and escalates to admin.

---

## Asset Management

**Swimlanes:** Hans (Admin), Employee (Asset Recipient), System (Baserow), External/Contractor

### Process

1. Asset check-out/in logged and confirmed by both Admin & recipient (digital signoff via DocuSeal)
2. Routine inspections triggered by System; exceptions recorded
3. Maintenance scheduling: reminders and work orders generated by System; external contractor assigned as needed
4. Loss/damage: incident report, valuation check, insurance notification if applicable
5. Periodic audits; valuation and insurance events logged

### Expanded Workflows

- **Scheduled Mini-Audits/Cycle Counts:** System-initiated; regular "mini audits" for subsets of assets, spreading inspection effort and catching losses early. Results logged, missing/damaged items flagged for follow-up.
- **Asset Disposal/Retirement Workflow:** System/admin-initiated; end-of-life triggers require documentation, witness signoff, and automatic update of insurance/asset register.
- **Late Asset Return Escalation and Lockout:** System-enforced; overdue assets trigger auto-notifications, with auto-lockout from further checkouts until resolution. Repeated issues escalate to Hans with potential for wider access restrictions.

---

## Incident Management (All Types)

**Swimlanes:** Any reporter, Hans/Admin, Responsible Employee/Resident, System, External/Arbiter

### Process

1. Incident logged by any party (system/web form)
2. Automated notification and assignment by System
3. Investigation and evidence upload by responsible parties
4. Resolution documented and closed by Admin
5. **Repeats/arbitration:** If incident recurs, triggers policy review or external arbitration; loopback for documentation

### Expanded Workflows

- **Root Cause/Repeat Incident Linkage:** System-driven; links repeat/similar incidents (e.g., 3 in 60 days) and automatically escalates for formal policy review or intervention.
- **Scheduled Hazard Walks:** System/admin-initiated; assigns regular proactive safety walks to detect/prevent incidents; completion and findings tracked.
- **Victim Support/Escalation Path:** User/HR-initiated; sensitive cases (e.g. harassment) trigger optional direct route to external/arbiter review, by-passing normal admin channel when confidentiality is required.

---

## Leave, Payroll, Expense & Financial Workflows

**Swimlanes:** Employee/Resident, Hans (Approver/Admin), System (Payroll/Log/Baserow/Notification), External (Bank, Contractor, Insurer)

### Overview

This section captures all critical flows for financial controls including Leave, Payroll, Expense, Loan/Advance, Reimbursement, Petty Cash, Scheduled Payments/Contractor Payments, Monthly Audit Review, Budget Amendment, and Insurance Claim Workflows. Embedded are process triggers, approvals, notifications, escalations/exception handling, and system automation.

### Expanded Workflows

- **Leave Carry-over/Expiry Alerts:** System-initiated; automated reminder for approaching expiry; "use it or lose it" logic enforced with alerts to user and Hans.
- **Compulsory Leave Compliance/Audit:** System/admin-initiated; checks for annual leave taken, flags sick leave patterns; audit reports for compliance and potential misuse.
- **Multi-level/Threshold Expense Approval:** System-driven; expense claims routed to higher authority/secondary approver when over threshold or if special category detected.
- **Negative Leave Balance Prevention:** System-enforced; attempts to request overdrawn leave are automatically blocked or flagged; admin notified if override is attempted.

### Core Flows & Participants

| Workflow                       | Triggers                        | Approvers            | System Involved                  | External                  |
| ------------------------------ | ------------------------------- | -------------------- | -------------------------------- | ------------------------- |
| Leave Request                  | Employee/resident submission    | Hans                 | Baserow, Notifications           | —                         |
| Payroll Processing             | System calendar event           | Hans (final), System | Payroll API, Baserow             | Bank                      |
| Expense/Reimbursement Claim    | Expense incurred & claim upload | Hans                 | Baserow, Notification            | —                         |
| Loan/Advance Request           | Employee/resident request       | Hans                 | Baserow, Notification, Scheduler | Bank                      |
| Petty Cash Request/Logging     | Expense or cash shortfall       | Hans                 | Baserow, Notification            | —                         |
| Scheduled/Contractor Payment   | Contractual milestone/date      | Hans or Auto         | Baserow, Notifications           | Contractor/Bank           |
| Monthly Financial Audit Review | Month close / scheduled event   | Hans                 | Baserow, Notification            | External Auditor (if any) |
| Budget Amendment               | Budget need detected/requested  | Hans                 | Baserow/DocuSeal (signoff)       | —                         |
| Insurance Claim                | Insurable incident              | Hans, System         | Baserow, Notification            | Insurance Portal          |

### Swimlane Actions: Key Elements per Workflow

- **Triggers:** Via dashboard/form submission, scheduled system events, incoming incident, or system-detected anomaly.
- **Approvals:** Hans is primary approver; system identifies conflicts, duplicates, and exceptions. Approvals logged and require e-signature in case of budget/insurance workflows.
- **Notifications:** Automated notification to all relevant parties at each transition and status change.
- **System Automation:** Task routing, due date escalation, payment file prep (payroll, loans), audit trail, and automated reminders for scheduled repayments/critical deadlines.
- **Exceptional/Fail Paths:** Overdue approval or repayment triggers escalation workflow, e.g. repeated non-payment flags for additional admin intervention, system restricts further requests until resolved. Exception logging for under/overpayments, insurance denials, or unauthorized expense types.

---

## Loan/Advance Request Workflow

**Swimlane:** Employee/Resident → Hans/Admin → System (Baserow, Notification, Scheduler) → Bank (external)

1. **Initiation:** Employee or resident submits a loan/advance request via the digital form (specifying purpose, amount, and target repayment schedule).
2. **Automated validation:** System checks for outstanding or overdue loans/advances; enforces limit rules (preset or dynamic).
3. **Admin review:** Hans receives notification, reviews purpose/justification and available history, and either approves or rejects (with comment).
4. **Approval:** On approval, system schedules repayment events and notifies recipient (terms are captured, DocuSeal e-signature if required).
5. **Disbursement:** Payment file sent to bank interface for transfer if applicable. Transaction logged in Baserow.
6. **Repayment monitoring:** System tracks repayment schedule; auto-notifies both borrower and Hans of upcoming/failed repayments.
7. **Escalation/Fails:** Overdue repayments trigger:
   - Automated dunning notification (1st–3rd notice)
   - Hans/Admin required intervention (flagged in dashboard)
   - Potential restriction of new requests until resolved
   - Final unpaid cases: system flags for exceptional deduction/fine, external review, or legal hold
8. **Audit & Closure:** When fully repaid, workflow closes and status/audit entries updated.

**Exception/fail paths:** Overlimit requests, unapproved purposes, open prior loan, or policy breaches result in system or Hans-triggered rejection (with full comment logging).

---

## Reimbursement Claim Workflow

1. Initiation by employee/resident → system-supported proof upload (e.g. receipt)
2. Notification to Hans for approval
3. System flags duplicates/overlaps, blocks unauthorized/payments outside category
4. On approval, schedule reimbursement for payroll/bank or petty cash out
5. If rejected or incomplete, system sends feedback and flags for corrective action

---

## Petty Cash Workflow

1. Initiated by authorized user when small cash purchase/shortfall occurs
2. Input into system, notification to Hans
3. Hans reviews and approves (auto-checks for policy limits)
4. Cash issued and transaction logged; receipts uploaded
5. Policy violation/overuse triggers system block and admin notification

---

## Scheduled Contractor Payment Workflow

1. **Trigger:** Contract milestone, calendar event, or invoice upload by user
2. System cross-checks contract fulfillment status with Baserow log
3. Hans approves payment or queries for issues
4. Transaction sent to bank/contractor, confirmation logged
5. Delay, dispute, or failed contract triggers admin intervention and system flags exception

---

## Monthly Audit Review

1. Automatically scheduled at end of each month
2. System compiles all transactions, open items, overdue claims, loan status
3. Report sent to Hans; unresolved issues require admin resolution
4. Option for external auditor input (external swimlane)
5. Log of findings and corrective measures stored

---

## Budget Amendment Workflow

1. Triggered by request (employee/resident or Hans) or system detection of budget breach
2. Hans reviews, and approves/denies; justification captured
3. If approved, system updates budget and logs version/DocuSeal signature
4. Overspend or repeated amendments trigger admin/board review

---

## Insurance Claim Workflow

1. Triggered by asset loss/damage or incident log in system
2. Hans notified and reviews report; system guides through insurer claim form and document uploads
3. Claim filed via external portal; status updates tracked in Baserow
4. Settlement or denial outcomes logged; system notifies all parties

---

## Additional Notes

- **Fines and deductions:** Handling of policy fines/deductions is planned for future workflow expansion.
- **Donations:** Out-of-scope for initial build; workflows for managing donations are planned but not launched.
- **Future enhancements:** Improved exception tracking, analytics, and anomaly detection are future priorities.

---

## Safety & Workshop Protocols

**Swimlanes:** Hans/Admin, System, Employee/Resident

### Expanded Workflows

- **Automated Drill Scheduling and Tracking:** System-initiated; timed drills scheduled based on compliance requirements; registers and tracks participation.
- **PPE/Equipment Issue & Expiry Tracking:** System-enforced; logs issuance and return of PPE/gear, sends expiry/maintenance reminders and blocks access when overdue.
- **Tool Calibration Reminders:** System-triggered; alerts and logs periodic or usage/hour-based recalibration needs per tool.

---

## Policy & Document Review

**Swimlanes:** Hans/Admin, Document Owners, System

### Expanded Workflows

- **Version Diffusion Block:** System-enforced; superseded documents are locked from use; only current versions are accessible. Attempt to use old version triggers warning and admin alert.
- **Aging Document Notification:** Automated; policy/documents not reviewed in X period (e.g., 12 months) are surfaced for mandatory review and flagged.
- **Multi-party Parallel Review:** System-supported; review invites are sent in parallel; progress and consensus tracked for prompt convergence, not serial dependencies.

---

## Vehicle Use & Maintenance

**Swimlanes:** Driver/Employee, Hans/Admin, System, External (Mechanic/Insurer)

### Expanded Workflows

- **Unauthorized Destination Detection:** Future/optional system-initiated (upon GPS implementation); patterns or locations outside approved list flagged for review.
- **Per-use Cleaning/Servicing Checklist:** System-enforced; each return triggers mandatory cleaning/condition checks; incomplete checklists block subsequent assignment.
- **Automated Compliance & Expiry Review:** System-driven; tracks and flags approaching expiry for licensing, roadworthy, or insurance—auto-restricts use until compliant.

---

## Succession, Emergency & Continuity

**Swimlanes:** Hans/Admin, System, Designated Successor

### Expanded Workflows

- **Quarterly Contact/Info Audit:** System-scheduled; every quarter, system auto-prompts confirmation/update of all critical emergency contacts, phone numbers, and credentials—not just the plan doc.
- **Live Succession/Role Transfer Test:** System/admin-initiated; scheduled dry-run where successor receives active transition protocol and uses credentials/data for a defined "test" window.
- **Pre-mortem Scenario Review:** System-triggered; periodic "what if" reviews force team to walkthrough fallback role/access scenarios; unresolved gaps escalated to Hans.

---

## Meta/Continuous Improvement for All Workflows

- **Automated Workflow Aging Alerts:** System-initiated; workflows not traversed or updated within set period are flagged for review, eliminating "dead" processes.
- **Recurring Improvement Log Prompts:** System-scheduled; prompts all users for regular feedback ("Which workflow slowed you down this month?"); results logged for Hans/admin review.
- **Feedback Recap and Pain Point Highlight:** System-administered; aggregates recurring issues, feeding into quarterly improvement or sprint sessions.

---

## Continuous Improvement Commentary

Ensuring this level of detail and automation in workflows closes several critical gaps:

- **Auditability:** Every flow and exception (including missed onboarding or asset return, sensitive incidents, or overdue financials) is traceable and reviewable.
- **Compliance:** Scheduled reviews, rotation of responsibility, and auto-escalations prevent unintentional lapses and surface repeated process failures early.
- **Operational Drift:** System-driven workflow aging and audit routines surface outdated or unused processes, ensuring all protocols remain live and relevant.
- **Risk Mitigation:** Proactive and enforced reviews (asset audits, document version blocking, live succession tests) reduce the likelihood and impact of low-frequency, high-impact failures.
- **Culture and Improvement:** Automated feedback loops and recurring improvements institutionalize a culture of learning and accountability, preventing process stagnation and supporting organizational resilience.

This comprehensive approach future-proofs governance and day-to-day operations at House of Veritas, ensuring not just compliance but continuous adaptation and excellence.

---

## Goals & Objectives

### Business Goals

- Centralize operational process knowledge and accountability
- Ensure ≥95% adherence to critical procedures across all swimlanes, including financial and loan/credit flows
- Reduce compliance breaches and unlogged exceptions by 80%
- Enhance continuity and reduce single point-of-failure risk

### User Goals

- Reduce onboarding friction and increase confidence in roles
- Provide clarity on task/financial commitment expectations, escalation paths, and completion criteria
- Limit manual follow-up by leveraging automation and reminders

### Non-Goals (Out of Scope)

- No replacement of core HR/payroll or full accounting/financial software
- Fines/deduction, donation, and advanced financial anomaly workflows planned for future, not in initial scope

---

## Measurable Objectives

| Metric                                    | Baseline | Target          | Timeline |
| ----------------------------------------- | -------- | --------------- | -------- |
| Financial/Audit exception resolution time | 72 hrs   | <24 hrs         | Q2 2024  |
| % of overdue loan/advance cases escalated | —        | 100% within 48h | Q2 2024  |
| Workflow coverage for finance controls    | 0        | 100%            | Q2 2024  |

---

## Stakeholders

Expanded External: add Bank, Insurance, Auditor to External Parties as per above.

---

## User Personas & Stories

### Additional Stories

- **As an employee or resident**, I want to request a loan/advance for legitimate expenses, get timely response and clear repayment terms so that I can manage urgent needs responsibly.  
  _Acceptance:_ System validates eligibility, Hans approval, clear notifications, repayment tracked.

- **As Hans**, I want to be notified of any overdue financial obligations or escalated exceptions so risk is managed and audit trails are maintained.

---

## Use Cases & Core Flows

### Expanded Use Cases

- Leave/expense submission, reimbursement, loan/advance, and scheduled payment workflows with audit and notification layers
- Risk and overdue escalation for any financial workflow (loan default, failed payroll, unauthorized reimbursement)
- Periodic reconciliation and monthly review for all operational financial flows
- Petty cash issue/reconciliation and budget amendments documented and auditable

### Edge Cases

- Loan/advance over branch of policy/limit (blocked by system, flagged for Hans)
- Repeated/overdue repayments: triggers auto-escalation, restricts further requests, potential exception/fine for persistent offenders
- Payroll/contractor overpayment or duplicate payout detected (blocked, admin review)
- Expense type not permitted under policy (system flags, Hans reviews)
- Insurance claim incomplete/denied (admin notified, loopback/corrective action)

---

## Functional Requirements

- System must support submission, validation, approval workflow, notifications, and exception path for: leave, expenses, loan/advance, petty cash, reimbursement, scheduled payments, budget amendments, and insurance claims
- Automation for repayment event scheduling and overdue escalation in loan/advance flows
- Periodic (monthly) reconciliation reports and workflow for resolution of all open/overdue financial cases
- Exception path tracking (block/request restriction, escalation to Hans/Admin)
- Audit trail and evidence capture for every transaction
- System role-mapping: Employee/Resident (initiator), Hans/Admin (approver/arbiter), System (validation/automation), External (bank/contractor/insurer as recipient/investigator)

---

## Non-Functional Requirements

Unchanged, but support for expanded transaction and workflow load.

---

## Mesh Layer Mapping

Expanded system integration for:

- Payment file generation (bank)
- Claims and contracts (insurer, contractor)
- Escalation notification for overdue/exception financial events

---

## APIs & Integrations

Now covers:

- **Bank API** – outbound payments for payroll, reimbursements, loans/advances, scheduled contractor payments
- **Insurance portal API** – claim initiation, status tracking

---

## User Experience & Entry Points

- Unified dashboard displays active and pending payments, loans/advances, reimbursements, and budget items
- Exception/overdue notifications highlighted with immediate action prompts

---

## Success Metrics

Augmented with:

- Overdue escalation compliance for loans/advances/payments (≥98% responded within 48h)
- Monthly audit/reconciliation signed off by Hans/Admin
- Zero unauthorized financial disbursements

---

## Timeline & Milestones

Integrated milestones for:

- Financial workflows UAT (Jul 2024)
- Overdue/exception flow activation (Jul 2024)
- Monthly reconciliation go-live (Aug 2024)

---

## Known Constraints & Dependencies

- Requires reliable bank API for real-time payment status
- Exception management limited by system integration with external finance/accounting tools

---

## Risks & Mitigations

| Risk                                  | Impact | Probability | Mitigation                        |
| ------------------------------------- | ------ | ----------- | --------------------------------- |
| Financial workflow configuration gaps | High   | Medium      | Pre-launch test, admin super-user |
| Overdue escalations missed            | High   | Low         | Automated alerts, periodic checks |

---

## Open Questions

| Question                                                       | Owner            | Target Date | Impact if Unresolved                 |
| -------------------------------------------------------------- | ---------------- | ----------- | ------------------------------------ |
| What are permissible purposes/limits for loans/advances?       | Hans             | May 2024    | Policy gaps, uncontrolled risk       |
| Who authorizes exceptions or overrides in financial workflows? | Hans/Admin Board | May 2024    | Audit ambiguity, compliance concerns |
| What is the final process approval authority?                  | Hans             | May 2024    | Process ambiguity                    |
| Payroll/calendar API compatibility?                            | IT               | May 2024    | Incomplete automation                |
| Required document retention periods?                           | Legal            | June 2024   | Compliance gaps                      |

---

## Appendix

Update to reflect research on financial controls, external payment integration, and loan/advance policy models.
