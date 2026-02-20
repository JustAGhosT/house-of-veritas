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
- **Persona-specific visual themes:**
  - Hans (Blue): Tech/circuit patterns, network nodes, CPU/monitor vectors
  - Charl (Amber/Orange): Workshop/tools patterns, gears, wrenches, mechanical vectors
  - Lucky (Green): Garden/nature patterns, leaves, flowers, trees, grass vectors
  - Irma (Purple/Pink): Home/domestic patterns, hearts, houses, sparkles vectors

### User Personas (4 Users)
1. **Hans** - Owner/Administrator - Tech Lead, Electronics, Leadership
   - Email: hans@houseofv.com
   - Phone: +27692381255
   - Full platform access, approvals, oversight
   
2. **Charl** - Workshop Operator - Electrician, Plumber, Tinkerer, Magicman
   - Email: charl@houseofv.com
   - Phone: +27711488390
   - Tasks, assets, time tracking, vehicle logs
   
3. **Lucky** - Gardener & Handyman - Gardening, Painting, Manual Labour
   - Email: lucky@houseofv.com
   - Phone: +27794142410
   - Tasks, expenses, vehicle logs, time tracking
   
4. **Irma** - Resident - Babysitting, Cleaning, Food/Cooking
   - Email: irma@houseofv.com
   - Phone: +27711488390
   - Household tasks, documents, meal planning

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
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, Recharts
- **Backend (Current):** Next.js API Routes (stubbed)
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
- Terraform IaC for Azure (nl-{env}-hov-{resourcetype}-san naming convention)
- CI/CD GitHub Actions workflows
- Supervisor management for Next.js app

### ✅ Phase 3: Core Platform Setup (COMPLETE)
- DocuSeal configuration files
- Baserow configuration files
- Docker Compose templates
- Environment variable templates

### ✅ Phase 4: Integration & Automation (COMPLETE)
- Azure Functions placeholders for:
  - DocuSeal webhook handling
  - Document expiry alerts
  - Recurring task generation
  - Leave accrual automation

### ✅ Phase 5: User Experience & Polish (COMPLETE - Feb 20, 2026)
- **User Authentication System:**
  - Seeded users with hardcoded passwords (hans123, irma123, charl123, lucky123)
  - Login page with user selection grid
  - Password authentication API
  - Password reset via SMS (Twilio integration ready, simulated in dev)
  
- **Persona-Specific Dashboards with Interactive Charts:**
  - **Hans Dashboard (Blue/Tech theme):**
    - Budget Overview bar chart (6-month trend)
    - Task Status pie chart
    - Employee Performance horizontal bar chart
    - Document Compliance area chart
    - Pending Approvals with approve/reject actions
    - Document Expiry alerts
    - Recent Activity feed
    - System Status panel
    
  - **Charl Dashboard (Amber/Workshop theme):**
    - Live time clock with clock in/out
    - Weekly Task Progress bar chart
    - Skills Distribution pie chart (Electrical, Plumbing, Mechanical)
    - Task list with priority badges
    - Workshop Assets inventory
    - Vehicle Log with current trip
    
  - **Lucky Dashboard (Green/Garden theme):**
    - Live time clock
    - Weekly Hours area chart
    - Task Types pie chart (Gardening, Painting, Labour)
    - Gardening task list
    - Expenses with pending/approved status
    - Expenses trend bar chart
    - Vehicle trip log table
    - Weather widget
    
  - **Irma Dashboard (Purple/Home theme):**
    - Welcome banner with greeting
    - Weekly Task Completion bar chart
    - Task Distribution pie chart (Cleaning, Cooking, Babysitting)
    - Household task list
    - Meal Planning with 3-day schedule
    - My Documents (signed agreements)
    - Weekly Schedule calendar view

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/reset-password` - Password reset (SMS/Email)
- `GET /api/auth/users` - Get all users (without passwords)

### Dashboard Data
- `GET /api/stats` - Platform statistics
- `GET /api/tasks` - Task management
- `GET /api/assets` - Asset registry
- `GET /api/employees` - Employee data
- `GET /api/documents` - Document management
- `GET /api/expenses` - Expense tracking
- `GET /api/time` - Time tracking
- `GET /api/vehicles` - Vehicle logs
- `GET /api/incidents` - Incident reports
- `GET /api/contractors` - Contractor management

---

## Upcoming Tasks (P1)

### Phase 6: Frontend Integration
- Connect dashboards to live DocuSeal and Baserow APIs
- Replace stubbed endpoints with real data
- Implement real-time updates

### Phase 7: Testing & UAT
- End-to-end testing of all user flows
- Performance testing
- Security audit

### Phase 8: Deployment & Go-Live
- Execute Terraform deployment to Azure
- Configure production environment
- Go live checklist

---

## Future Enhancements (Backlog)

- Payroll/Accounting Integration (QuickBooks/Xero)
- Biometric Time Clock Integration
- Native Mobile Apps (React Native/Flutter)
- Vehicle GPS Tracking
- Predictive Maintenance AI

---

## Files Reference

### Core Application
- `/app/lib/users.ts` - User data and authentication
- `/app/app/api/auth/` - Authentication API routes
- `/app/app/login/page.tsx` - Login and password reset UI
- `/app/app/dashboard/hans/page.tsx` - Admin dashboard
- `/app/app/dashboard/charl/page.tsx` - Workshop operator dashboard
- `/app/app/dashboard/lucky/page.tsx` - Gardener dashboard
- `/app/app/dashboard/irma/page.tsx` - Resident dashboard
- `/app/components/dashboard-layout.tsx` - Shared dashboard layout

### Configuration
- `/app/config/` - DocuSeal, Baserow, Supervisor configs
- `/app/terraform/` - Azure infrastructure code
- `/app/.github/workflows/` - CI/CD pipelines

### Documentation
- `/app/BACKLOG.md` - Implementation backlog
- `/app/FUTURE_ENHANCEMENTS.md` - Future features
- `/app/docs/NAMING_CONVENTION.md` - Azure naming standards
