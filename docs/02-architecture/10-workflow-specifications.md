# Workflow Specifications

Comprehensive specification for estate management workflows. **Inngest** handles event-driven, durable, cron-based workflows. **n8n** handles assignment logic, notifications, multi-service orchestration, and business-user rules.

---

## 1. Employee Registry & Onboarding

### New Hire Onboarding

- **Trigger:** POST `/api/employees` emits `employee.created`; POST/PATCH `/api/onboarding/checklist` emits `onboarding.checklist.progressed`
- **Platform:** Inngest + Baserow
- **Actions:** Reference check (`onboarding-reference-check`), IT provisioning (`onboarding-it-provision`), buddy assign, 30/90 feedback
- **Status:** Partially implemented — `employee.created` and `onboarding.checklist.progressed` events; DocuSeal contract flow updates existing employees

### Probation Workflow

- **Trigger:** Cron (monthly) — employees 3 months post `employmentStartDate`
- **Platform:** Inngest
- **Actions:** Notify Hans and employee; schedule reminders for probation review; on completion, mark permanent or trigger extension/termination
- **Status:** Implemented — `probation.reminder` cron

### Exit Workflow

- **Trigger:** Termination/resignation logged in Baserow
- **Platform:** n8n (event-driven)
- **Actions:** Assign asset return checklist, deactivate access, schedule exit interview, trigger payroll/settlement
- **Status:** Spec only — requires `employee.status` or termination table

---

## 2. Daily To-Do's & Task Management

### Daily/Weekly Rota Generation

- **Trigger:** Cron (weekly) or template-based
- **Platform:** n8n
- **Actions:** Auto-generate tasks from template (cleaning, tool inspection, lock-up), assign, notify by preferred channel
- **Status:** Partially implemented — `recurring.tasks.create` Inngest cron

### Missed/Overdue Task Escalation

- **Trigger:** Cron (daily 9am)
- **Platform:** Inngest
- **Actions:** If task not complete by check-in time, escalate to Hans
- **Status:** Implemented — `task.overdue.check`

### Recurring High-Risk Tasks

- **Trigger:** Cron (e.g., weekly safety checks)
- **Platform:** n8n
- **Actions:** Auto-create, require proof-of-completion upload (photos, comments)
- **Status:** Spec only — requires task template with proof upload

---

## 3. Asset Registry & Asset Management

### Asset Check-In/Out

- **Trigger:** PATCH `/api/assets/[id]` with `action: "checkout"` or `"checkin"`
- **Platform:** Inngest + Baserow
- **Actions:** Log in Baserow who has it; enforce late-return lockout; send return reminder by due date
- **Status:** Implemented — `asset-late-return-lockout` cron; PATCH enforces lockout on checkout

### Maintenance/Inspection Scheduling

- **Trigger:** Cron (daily) — assets due for maintenance per schedule or odometer
- **Platform:** n8n/Inngest
- **Actions:** Auto-create maintenance task, notify assignee, escalate to Hans after 48h if not completed
- **Status:** Spec only — requires asset `nextServiceDate` or maintenance schedule table

### Damaged/Missing Asset

- **Trigger:** Incident report with asset reference
- **Platform:** n8n
- **Actions:** Assign to responsible person/maintenance, log cost, update insurance register, notify Hans if unresolved
- **Status:** Spec only — requires incident–asset linkage

---

## 4. Incident Management

### Incident Reporting

- **Trigger:** POST `/api/incidents` (persists to Baserow when configured)
- **Platform:** Inngest + Baserow
- **Actions:** Auto-log to Baserow, notify Hans; victim support path routes to `VICTIM_SUPPORT_CONTACT`
- **Status:** Implemented — `incident.created` event + workflow; victim support path supported

### Investigation Workflow

- **Trigger:** New incident created
- **Platform:** n8n
- **Actions:** Assign to Hans/manager, set investigation deadline, auto-remind if overdue, log outcomes
- **Status:** Spec only — requires incident assignment + deadline fields

### Repeat Incident Escalation

- **Trigger:** Cron (daily 10am) — 3+ similar incidents in 60 days
- **Platform:** Inngest
- **Actions:** Link related incidents in Baserow; notify Hans for policy review
- **Status:** Implemented — `incident-repeat-linkage` cron (requires incidents in Baserow)

---

## 5. Safety & Compliance

### Emergency Drill Reminders

- **Trigger:** Cron (quarterly)
- **Platform:** Inngest
- **Actions:** Auto-create drill event, notify all staff
- **Status:** Implemented — `emergency.drill.reminder`

### Safety Equipment Checks

- **Trigger:** Cron (rotating schedule)
- **Platform:** n8n
- **Actions:** Rotate responsibility, log result in Baserow
- **Status:** Spec only — requires safety equipment table

### Emergency Plan Review

- **Trigger:** Cron (annual)
- **Platform:** Inngest
- **Actions:** Auto-generate "review and sign" DocuSeal workflow
- **Status:** Spec only — requires DocuSeal template

---

## 6. Payroll, Leave, and Expense Management

### Leave Request & Approval

- **Trigger:** POST `/api/leave` (Baserow leave requests table)
- **Platform:** Inngest
- **Actions:** Notify Hans for approval; carry-over/expiry; compulsory audit; negative balance prevention
- **Status:** Implemented — `leave.request.submitted`, `leave.carryover.expiry`, `leave.compulsory.audit`

### Expense Request

- **Trigger:** Employee submits expense
- **Platform:** Inngest
- **Actions:** Notify Hans; on approval mark as completed; 48h reminder for pending; over budget → escalate/double approval
- **Status:** Implemented — `expense.created`, `expense.approval.reminder` (48h pending)

### Payroll Trigger

- **Trigger:** Cron (end of month)
- **Platform:** Inngest
- **Actions:** Summarize time logs/overtime (break duration subtracted), produce payroll report for Hans
- **Status:** Implemented — `payroll.summary`; overtime uses `overtime.calculate` with break duration

---

## 7. Housing & Resident Management

### Resident Agreement Annual Review

- **Trigger:** Cron (annual)
- **Platform:** n8n
- **Actions:** Trigger "re-sign" workflow via DocuSeal
- **Status:** Spec only — requires resident agreement table

### Household Responsibilities

- **Trigger:** Rota template
- **Platform:** n8n
- **Actions:** Assign household chores rota (shared space cleaning, laundry)
- **Status:** Spec only — requires kitchen/household PRD

---

## 8. Document Expiry & Annual Reviews

### Document Expiry

- **Trigger:** Cron (daily 6am)
- **Platform:** Inngest
- **Actions:** Check Baserow expiry table; 60d/30d/7d escalations; create "renew and sign" tasks
- **Status:** Implemented — `document.expiry.check`

### Review Cycles

- **Trigger:** Cron (annual or 3-year)
- **Platform:** n8n
- **Actions:** Trigger review for each core governance doc; assign reviewers; auto-notify if not advanced
- **Status:** Spec only — requires document review table

---

## 9. Vehicle Usage Tracking

### Log Trip

- **Trigger:** Form or WhatsApp
- **Platform:** n8n
- **Actions:** Auto-create Baserow row, link to driver
- **Status:** Spec only — vehicle logging exists; WhatsApp integration needed

### Maintenance/Service Reminder

- **Trigger:** Odometer or date
- **Platform:** Inngest
- **Actions:** "Service due" workflow, notify responsible
- **Status:** Implemented — `vehicle.mileage.check`

### Unauthorized Usage

- **Trigger:** Incident logged
- **Platform:** n8n
- **Actions:** Notify Hans, trigger HOD review
- **Status:** Spec only — requires incident–vehicle linkage

---

## 10. Policy Change & Distribution

### Amend House Rules or Safety Manual

- **Trigger:** Policy change logged
- **Platform:** n8n
- **Actions:** Notify all affected signatories; lock old version; require new DocuSeal e-signature within X days; remind and escalate
- **Status:** Spec only — requires policy version table

---

## Feedback Loop & Advanced Automations

### Feedback Loop Automation

- **Trigger:** After incident closed, contractor completes job, annual review held
- **Platform:** n8n
- **Actions:** Send survey/feedback form via WhatsApp/email to stakeholders
- **Status:** Spec only

### Contractor Performance Tracking

- **Trigger:** After contract job completed
- **Platform:** n8n
- **Actions:** Send review/rating request; log negative events to performance record
- **Status:** Implemented — `contractor.milestone.completed` event

### Succession Plan Drills

- **Trigger:** Cron (quarterly)
- **Platform:** Inngest
- **Actions:** Assign stand-in admin for a day; log handover document usability; update contact lists
- **Status:** Implemented — `succession.drill`

### Micro-Incident Trend Detection

- **Trigger:** Cron (weekly)
- **Platform:** n8n
- **Actions:** Tally minor issues; if pattern (X in 30 days), create action item for Hans
- **Status:** Spec only — requires incident severity/category

### Celebration & Recognition

- **Trigger:** Milestone (e.g., 12 months no incident, task streak)
- **Platform:** n8n
- **Actions:** Congrats message, badge, thank-you note from Hans
- **Status:** Spec only — requires milestone tracking

### Rota Autopilot

- **Trigger:** Leave request or illness
- **Platform:** n8n
- **Actions:** Auto-adjust rota; ping next in care chain
- **Status:** Spec only — requires leave + rota integration

### Annual Policy Health Survey

- **Trigger:** Cron (annual)
- **Platform:** n8n
- **Actions:** WhatsApp/email survey on policy feedback; aggregate and present dashboard
- **Status:** Spec only

### Document & Asset Verification

- **Trigger:** Cron (quarterly)
- **Platform:** n8n
- **Actions:** Random spot check for proof photo; escalate if no response
- **Status:** Spec only

### Early Fraud/Disputes Escalation

- **Trigger:** Transaction/incident flagged as sensitive
- **Platform:** n8n
- **Actions:** Assign additional review; schedule mediation; log events
- **Status:** Spec only — requires flagging logic

### Emergency Protocol Live Test

- **Trigger:** Cron (twice yearly)
- **Platform:** n8n
- **Actions:** Mock fire/flood via SMS; capture responses; report on gaps
- **Status:** Spec only — requires Twilio integration

### Budget Variance Watching

- **Trigger:** Cron (weekly)
- **Platform:** n8n
- **Actions:** Aggregate actuals vs budget; alert if 90% with projected overrun
- **Status:** Spec only — requires budget table

### Cross-Function Coordination

- **Trigger:** Blocked workflow (e.g., renovation awaiting safety sign-off)
- **Platform:** n8n
- **Actions:** Coordinated reminders to all involved; unlock when subtasks complete
- **Status:** Spec only — requires dependency graph

---

## Implementation Summary

| Workflow                        | Platform      | Status                                             |
| ------------------------------- | ------------- | -------------------------------------------------- |
| Probation reminder              | Inngest       | Implemented                                        |
| Task overdue escalation         | Inngest       | Implemented                                        |
| Document expiry                 | Inngest       | Implemented                                        |
| Expense approval reminder (48h) | Inngest       | Implemented                                        |
| Payroll summary                 | Inngest       | Implemented                                        |
| Emergency drill reminder        | Inngest       | Implemented                                        |
| Succession drill                | Inngest       | Implemented                                        |
| Vehicle mileage check           | Inngest       | Implemented                                        |
| Incident created                | Inngest       | Implemented (victim support path)                  |
| Incident repeat linkage         | Inngest       | Implemented                                        |
| Asset checkout/checkin          | API + Baserow | Implemented (lockout enforced)                     |
| Expense created                 | Inngest       | Implemented                                        |
| Kiosk request                   | Inngest       | Implemented                                        |
| Leave balance update            | Inngest       | Implemented                                        |
| Recurring tasks                 | Inngest       | Implemented                                        |
| Overtime calculate              | Inngest       | Implemented                                        |
| Employee created                | Inngest       | Implemented (POST /api/employees)                  |
| Onboarding checklist progressed | Inngest       | Implemented (POST/PATCH /api/onboarding/checklist) |
| New hire onboarding (full flow) | n8n/Inngest   | Partially implemented                              |
| Exit workflow                   | n8n           | Spec only                                          |
| Asset maintenance               | n8n           | Spec only                                          |
| Leave request                   | Inngest       | Implemented                                        |
| Policy change                   | n8n           | Spec only                                          |
| Feedback loop                   | n8n           | Spec only                                          |
| Budget variance                 | n8n           | Spec only                                          |
