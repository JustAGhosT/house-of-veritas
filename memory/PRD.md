# House of Veritas - Product Requirements Document

## Overview
House of Veritas is a comprehensive digital governance platform for estate management, combining legally enforceable e-signatures, operational tracking, and compliance automation.

## Original Problem Statement
Transform an existing work management platform codebase into a professional, dashboard-centric governance and estate management platform for an entity called "House of Veritas".

## Core Requirements

### Aesthetic & Design
- Professional, trustworthy, dark theme with clean typography
- Primary blue (#1E40AF) for trust, secondary green (#059669) for operations
- Accent orange for alerts, dark charcoal background with subtle grid pattern

### User Personas (4 Users)
1. **Hans** - Owner/Administrator (Full access)
2. **Charl** - Workshop Operator (Employee tasks, assets, time)
3. **Lucky** - Gardener/Handyman (Tasks, expenses, vehicle logs)
4. **Irma** - Resident/Household (Limited household tasks)

### Key Features (8 Modules)
1. Document Management & E-Signatures (DocuSeal)
2. Financial Tracking (Expenses, Contractors)
3. Time Tracking & Overtime
4. Task Management
5. Asset Registry
6. Incident Reporting
7. Vehicle Logs
8. Compliance & Document Expiry

### Technology Stack
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend (Production):** DocuSeal (Ruby on Rails), Baserow (Django/Python)
- **Database:** PostgreSQL 14
- **Infrastructure:** Azure (Terraform-managed)
- **Cost Target:** <R950/month

---

## Implementation Status

### ✅ Phase 1: MVP Landing Page (COMPLETE)
- Landing page with HV branding and custom logo
- 8 feature module showcases
- Stats section (live data from stubbed APIs)
- Role-based dashboard previews
- 10 stubbed API endpoints

### ✅ Phase 2: Infrastructure (COMPLETE)
- Terraform modules (network, compute, storage, security, gateway)
- GitHub Actions CI/CD workflows
- Azure deployment documentation

### ✅ Phase 3: Platform Configuration (COMPLETE - December 2025)
**Delivered:**
- `/config/docker-compose.yml` - Local development orchestration
- `/config/.env.template` - Environment variables template
- `/config/docuseal/README.md` - DocuSeal setup guide
- `/config/baserow/README.md` - Baserow schema (8 tables with all fields)
- `/config/templates/document-list.md` - 18+ governance documents
- `/config/scripts/` - Data seeding, SSL generation, setup scripts
- `/config/supervisor/nextjs.conf` - Supervisor configuration

### ✅ Phase 4: Integration & Automation (COMPLETE - December 2025)
**Delivered:** 8 Azure Functions for automation

| Function | Trigger | Schedule | Purpose |
|----------|---------|----------|---------|
| DocuSealWebhook | HTTP | On demand | Handle signature events |
| DocumentExpiryAlert | Timer | Daily 6am | Check expiring docs |
| RecurringTasks | Timer | Monday 8am | Create weekly tasks |
| OvertimeCalculator | Timer | Sunday 11pm | Calculate overtime (BCEA) |
| LeaveBalanceUpdate | Timer | Monthly 1st | Update leave balances |
| ExpenseNotification | HTTP | On demand | Notify on expenses |
| BudgetReport | Timer | Monthly 5th | Generate financial report |
| BackupExport | Timer | Sunday midnight | Export to blob storage |

**Location:** `/config/azure-functions/`

### 🔄 Phase 5: User Experience & Polish (NEXT)
**Tasks:**
- Custom dashboards for each persona (Hans, Charl, Lucky, Irma)
- Mobile optimization
- Accessibility (WCAG 2.1 AA)
- Performance optimization

### ⏳ Phase 5: User Experience & Polish
- Custom dashboards for each persona
- Mobile optimization
- Accessibility improvements

### ⏳ Phase 6: Testing & Validation
- Functional testing (all 8 modules)
- Integration testing
- Security testing
- Performance testing

### ⏳ Phase 7: Training & Go-Live
- User training materials
- UAT with all 4 users
- Go-live and stabilization

---

## Database Schema (Baserow - 8 Tables)

1. **Employees** - ID, Name, ID Number, Role, Contract Ref, Leave Balance
2. **Assets** - Asset ID, Type, Condition, Location, Checked Out By
3. **Tasks** - Title, Assigned To, Due Date, Priority, Status, Time Spent
4. **Time Clock Entries** - Employee, Date, Clock In/Out, Overtime
5. **Incidents** - Type, Date, Reporter, Severity, Status, Actions
6. **Vehicle Logs** - Driver, Vehicle, Odometer, Distance, Fuel, Child Passenger
7. **Expenses** - Requester, Type, Category, Amount, Approval Status, Receipt
8. **Document Expiry** - Doc Name, Type, Next Review, Status, DocuSeal Ref

---

## Key API Endpoints (Stubbed)

| Endpoint | Description |
|----------|-------------|
| `/api/stats` | Dashboard statistics |
| `/api/documents` | Governance documents |
| `/api/employees` | Employee records |
| `/api/expenses` | Expense tracking |
| `/api/contractors` | Contractor milestones |
| `/api/tasks` | Task management |
| `/api/assets` | Asset registry |
| `/api/incidents` | Incident reports |
| `/api/vehicles` | Vehicle logs |
| `/api/time` | Time tracking |

---

## File Structure

```
/app
├── .github/
│   ├── workflows/             # CI/CD Workflows
│   │   ├── deployment-checklist.yml  # Infrastructure verification
│   │   ├── deploy.yml                 # Full deployment pipeline
│   │   ├── deploy-functions.yml       # Azure Functions deployment
│   │   ├── terraform-plan.yml         # Terraform plan on PRs
│   │   ├── terraform-apply.yml        # Terraform apply on merge
│   │   └── terraform-destroy.yml      # Infrastructure teardown
│   ├── WORKFLOWS.md           # CI/CD documentation
│   └── SECRETS_TEMPLATE.md    # Required secrets list
├── app/                       # Next.js application
│   ├── api/                   # Stubbed API routes
│   ├── page.tsx               # Landing page
│   └── layout.tsx             # Root layout
├── components/                # React components
├── config/                    # Platform configuration
│   ├── docker-compose.yml
│   ├── .env.template
│   ├── docuseal/
│   ├── baserow/
│   ├── nginx/
│   ├── supervisor/
│   ├── templates/
│   ├── scripts/
│   └── azure-functions/       # 8 Azure Functions (Phase 4)
│       ├── shared/utils.py    # Shared utilities
│       ├── DocuSealWebhook/
│       ├── DocumentExpiryAlert/
│       ├── RecurringTasks/
│       ├── OvertimeCalculator/
│       ├── LeaveBalanceUpdate/
│       ├── ExpenseNotification/
│       ├── BudgetReport/
│       └── BackupExport/
├── docs/                      # Design documents
├── terraform/                 # Infrastructure as Code
├── BACKLOG.md                 # Implementation backlog
└── FUTURE_ENHANCEMENTS.md     # Future roadmap
```

---

## Remaining Work (Priority Order)

### P0 - Critical
1. Production deployment of DocuSeal + Baserow
2. User account creation
3. Webhook integration
4. Azure Functions deployment

### P1 - High
1. Custom dashboards per persona
2. Mobile optimization
3. Full end-to-end testing

### P2 - Medium
1. Payroll integration
2. Biometric time clock
3. Mobile apps

### P3 - Future
1. GPS vehicle tracking
2. Predictive maintenance AI
3. Multi-property support

---

## Notes

- The application is now managed by **supervisor** (`supervisorctl status nextjs`)
- Start command: `supervisorctl start nextjs` (or `yarn build && yarn start` manually)
- Backend is **MOCKED** - real backend will be DocuSeal + Baserow
- Preview URL: https://veritas-governance.preview.emergentagent.com
- Deployment checklist: `python3 /app/config/scripts/deployment-checklist.py`

## CI/CD Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `deployment-checklist.yml` | PR, Push, Daily 6am | Infrastructure verification |
| `deploy.yml` | Manual, Release | Full deployment pipeline |
| `deploy-functions.yml` | Push (scripts), Manual | Azure Functions |
| `terraform-plan.yml` | PR (terraform changes) | Terraform preview |
| `terraform-apply.yml` | Merge to main | Terraform apply |

See `/.github/WORKFLOWS.md` for full documentation.

---

Last Updated: December 2025
