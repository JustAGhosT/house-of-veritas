# House of Veritas — Functional Design Document

## Module/Feature Name

House of Veritas Digital Governance Suite

## Marketing Name

House of Veritas Secure Estate Management Platform

## Core Value Proposition

Digitize and automate all estate governance, HR, operational, and compliance processes—ensuring enforceable e-signatures, seamless task and asset tracking, and automated workflows to achieve 100% document compliance and major admin efficiency gains.

## Priority

P0 – Critical

---

## Primary Personas

### Hans (Owner/Administrator)
- **Role:** Complete oversight and control
- **Needs:** Full visibility, minimal manual intervention, quick delegation, rapid audit/data retrieval
- **Dashboard:** All data, approval queues, compliance status, financial tracking

### Charl (Workshop Operator)
- **Role:** Employee/Resident, Mechanic/Handyman
- **Needs:** Clear daily tasks, simple time/expense logging, access to own documents
- **Dashboard:** My tasks, workshop assets, time logs, incident reporting

### Lucky (Gardener/Handyman)
- **Role:** Employee, Grounds Operations
- **Needs:** Mobile-friendly interface, task list, expense submission, vehicle logs
- **Dashboard:** Daily tasks, garden equipment, time tracking, expense requests

### Irma (Resident/Household)
- **Role:** Resident, Household/Childcare
- **Needs:** Simple interface, household tasks only, child-related incident reporting
- **Dashboard:** Household tasks, resident agreement, child-related logs

---

## Eight Core Feature Modules

### 1. Document Management & E-Signatures (DocuSeal Integration)

**Purpose:** Legally enforceable e-signatures with full audit trails

**Key Features:**
- Multi-signatory workflows
- 18 governance documents tracked
- Version control
- BCEA-compliant signatures
- Cryptographic audit trails
- PDF export and archival
- DocuSeal ↔ Baserow integration

**User Stories:**
- As Hans, I want to assign documents for signature and track completion status
- As Charl, I want to sign my employment contract digitally with a clear audit trail

---

### 2. Employee Registry

**Purpose:** Complete HR management with compliance tracking

**Key Features:**
- Employment contracts (linked to DocuSeal)
- Leave management and accruals
- Probation tracking
- HR milestones
- Auto-alerts for reviews
- Contract status dashboard

**Data Fields:**
- Full Name, ID Number, Role
- Employment Start Date
- Contract Reference (DocuSeal link)
- Leave Balance
- Probation Status
- Email, Phone, Photo

---

### 3. Asset Registry

**Purpose:** Track all tools, vehicles, and equipment

**Key Features:**
- Check-in/out workflows
- Maintenance schedules
- Condition tracking
- Valuation management
- Incident association
- Location tracking

**Asset Types:**
- Tools (workshop equipment)
- Vehicles (Toyota Hilux, etc.)
- Equipment (lawnmowers, generators)
- Household items

---

### 4. Tasks & Time Tracking

**Purpose:** Daily operations and BCEA-compliant time management

**Dual-Mode Time Tracking:**

**Mode A: Task-Level Logging**
- Time spent per task
- Completion notes
- Project association
- Summary views by person/project

**Mode B: Clock-In/Out with Overtime**
- Daily attendance tracking
- Automatic overtime calculation (>9hrs/day, >45hrs/week)
- Break duration tracking
- Approval workflow
- BCEA compliance

**Task Management:**
- Daily/recurring assignments
- Priority levels
- Status tracking
- Time estimates vs actuals
- Mobile-friendly forms

---

### 5. Incident Management

**Purpose:** Safety, equipment, and operational incident tracking

**Incident Types:**
- Safety (workshop accidents, injuries)
- Equipment (breakdowns, malfunctions)
- Vehicle (accidents, damage)
- Household (property issues)

**Workflow:**
1. User reports incident (mobile form)
2. Auto-routed to Hans
3. Hans reviews and assigns actions
4. Resolution tracked
5. Patterns analyzed for prevention

**Key Fields:**
- Date/Time, Location
- Reporter, Witnesses
- Description
- Severity (Low/Medium/High)
- Status (Pending/In Progress/Resolved)
- Actions Taken
- Photos

---

### 6. Vehicle Logs

**Purpose:** Usage authorization and compliance tracking

**Key Features:**
- Driver authorization
- Odometer tracking (start/end)
- Distance calculation
- Fuel logging and costs
- Child passenger tracking (compliance)
- Maintenance reminders

**Use Cases:**
- Materials pickup
- School drop-off/pickup
- Hardware store visits
- Garden center trips

---

### 7. Financial Tracking

**Purpose:** Dual-mode expense management with contractor payments

**Mode A: Post-Hoc Expense Logging**
- Log actual expenses after incurred
- 10 categories (Materials, Labor, Fuel, etc.)
- Receipt uploads
- After-the-fact approval

**Mode B: Pre-Approval Workflow**
1. User submits expense request
2. Hans receives notification
3. Approve/Reject with comments
4. User proceeds with purchase
5. Upload receipt on completion
6. Budget auto-updates

**Contractor Milestone Tracking:**
- Total contract amount
- Milestone stages (Deposit, Progress, Completion)
- Payment % per stage
- Progress tracking
- Overrun alerts

**Dashboard Views:**
- Budget vs Actuals by category
- Contractor progress bars
- Approval queue
- Monthly rollups

---

### 8. Calendar & Document Expiry Tracking

**Purpose:** Proactive compliance monitoring

**Multi-Stage Alert System:**
- **Green (60 days):** First notification
- **Yellow (30 days):** Reminder notification
- **Red (7 days):** Urgent alert

**Tracked Documents:**
- Property Charter (3-year cycle)
- House Rules (annual)
- Workshop Safety Manual (annual)
- Employment Contracts (annual review)
- Resident Agreement (annual)
- Vehicle Usage Policy (annual)
- Insurance policies (per renewal date)
- Succession Protocol (3-year cycle)

**Dashboard View:**
- Color-coded urgency
- Quick action buttons
- Filter by type/owner
- Export compliance report

---

## User Experience & Workflows

### Onboarding Flow
1. Hans provisions infrastructure
2. User accounts created
3. Initial document assignments
4. Training session (<1 hour)
5. Go-live monitoring

### Daily Workflows

**Hans' Morning Routine:**
1. Check dashboard overview
2. Review approval queue (expenses, leave)
3. Check document expiry alerts
4. Review incident reports
5. Monitor contractor progress

**Charl's Daily Flow:**
1. View "My Tasks Today"
2. Check out workshop tools
3. Log time spent on tasks
4. Report any incidents
5. Clock out with notes

**Lucky's Mobile Experience:**
1. Open mobile dashboard
2. See prioritized task list
3. Submit expense with photo receipt
4. Log vehicle usage
5. Track time via simple form

---

## Non-Functional Requirements

### Performance
- <2s page load
- 10 concurrent users supported
- 50MB document uploads
- <1s search/query response

### Security
- Role-Based Access Control (RBAC)
- End-to-end encryption
- Full audit logging
- POPIA compliance
- Password policies + 2FA for Hans

### Usability
- Responsive design (desktop/tablet/mobile)
- <3 clicks to core actions
- <1 hour onboarding/training
- WCAG 2.1 AA accessibility

### Reliability
- 99.9% uptime target
- Daily DB backups
- Weekly blob backups
- RPO: 24 hours
- RTO: 4 hours
- Annual DR test

---

## Integration Points

### DocuSeal ↔ Baserow
- Webhook triggers on signature completion
- Auto-update employee/contract records
- Sync document expiry dates

### Baserow ↔ Email/SMS
- Alert notifications
- Reminder escalations
- Approval requests

### Baserow ↔ Azure Blob
- Document storage
- Backup retention
- Receipt/photo uploads

---

## Success Metrics

### Leading Indicators
- % e-signature usage
- Task completion rates (on-time)
- % digital logging vs manual
- User satisfaction scores

### Lagging Indicators
- 100% document compliance
- 0 missed renewals in 6 months
- Hans' admin hours ≤5/week (down from 24/week)
- 99.9%+ uptime

---

## Summary

The House of Veritas Functional Design provides a comprehensive blueprint for eight integrated modules covering document management, HR, operations, compliance, and financial tracking. The platform is designed to be intuitive, mobile-friendly, and fully compliant with South African labor and data protection laws, while dramatically reducing administrative overhead and improving operational transparency.
