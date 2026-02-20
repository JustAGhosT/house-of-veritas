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
   - Email: hans@houseofv.com | Phone: +27692381255
   - Full platform access, approvals, oversight, can view all dashboards
   
2. **Charl** - Workshop Operator - Electrician, Plumber, Tinkerer, Magicman
   - Email: charl@houseofv.com | Phone: +27711488390
   - Tasks, assets, time tracking, vehicle logs
   
3. **Lucky** - Gardener & Handyman - Gardening, Painting, Manual Labour
   - Email: lucky@houseofv.com | Phone: +27794142410
   - Tasks, expenses, vehicle logs, time tracking
   
4. **Irma** - Resident - Babysitting, Cleaning, Food/Cooking
   - Email: irma@houseofv.com | Phone: +27711488390
   - Household tasks, documents, meal planning

### Technology Stack
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, Recharts
- **Backend:** Next.js API Routes with integration services
- **External Services:** DocuSeal (e-signatures), Baserow (operational DB)
- **Database:** PostgreSQL 14 (via Baserow)
- **Infrastructure:** Azure (Terraform-managed)

---

## Implementation Status

### ✅ Phase 1: MVP Landing Page (COMPLETE)
- Landing page with HV branding
- 8 feature module showcases
- Stats section with live data from APIs
- Role-based dashboard previews

### ✅ Phase 2: Infrastructure (COMPLETE)
- Terraform IaC for Azure
- CI/CD GitHub Actions workflows
- Supervisor management for Next.js

### ✅ Phase 3: Core Platform Setup (COMPLETE)
- DocuSeal/Baserow configuration files
- Docker Compose templates
- Environment variable templates

### ✅ Phase 4: Integration & Automation (COMPLETE)
- Azure Functions placeholders
- Webhook handlers
- Document expiry alerts

### ✅ Phase 5: User Experience & Polish (COMPLETE - Feb 20, 2026)
- **Authentication System:**
  - Single login form (email/password)
  - Route protection - authenticated users only
  - Permission-based access (Hans can view all dashboards)
  - Logout functionality with session clearing
  - Password reset via SMS (Twilio ready, **SIMULATED** in dev)

- **Notification System:**
  - Real-time notifications per user
  - Notification bell with unread count
  - Mark as read / Mark all as read
  - Clear notifications
  - Demo notifications seeded

- **Persona-Specific Dashboards:**
  - Unique visual themes with SVG background patterns
  - Interactive charts (Recharts)
  - Role-specific widgets and data

### ✅ Phase 6: Frontend Integration (COMPLETE - Feb 20, 2026)
- **Integration Services Created:**
  - `/app/lib/services/docuseal.ts` - DocuSeal API integration
  - `/app/lib/services/baserow.ts` - Baserow API integration
  
- **API Endpoints Updated:**
  - `GET /api/integration/status` - Check all service connections
  - `GET/POST /api/documents/templates` - Document templates
  - `GET/POST /api/documents/sign` - Signature submissions
  - `GET/POST/PATCH /api/tasks` - Task management with Baserow
  - `GET/POST/PATCH /api/expenses` - Expense tracking
  - `GET /api/assets` - Asset registry
  - `GET/POST /api/time` - Time clock (clock in/out)
  - `GET /api/vehicles` - Vehicle logs
  - `GET /api/employees` - Employee data

- **Features:**
  - Graceful fallback to mock data when services not configured
  - Ready for production deployment with environment variables
  - All APIs return `configured` flag to indicate data source

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/reset-password` - Password reset (SMS/Email)
- `GET /api/auth/users` - Get all users

### Integration
- `GET /api/integration/status` - Service connection status

### Documents (DocuSeal)
- `GET /api/documents/templates` - List document templates
- `GET /api/documents/sign?id=` - Get signature status
- `POST /api/documents/sign` - Create signature request

### Operations (Baserow)
- `GET/POST/PATCH /api/tasks` - Task management
- `GET/POST/PATCH /api/expenses` - Expense tracking
- `GET /api/assets` - Asset registry
- `GET/POST /api/time` - Time clock
- `GET /api/vehicles` - Vehicle logs
- `GET /api/employees` - Employee data

---

## Environment Variables (for Production)

```env
# DocuSeal
DOCUSEAL_API_URL=https://docs.houseofveritas.za/api
DOCUSEAL_API_KEY=your_api_key

# Baserow
BASEROW_API_URL=https://ops.houseofveritas.za/api
BASEROW_API_TOKEN=your_token
BASEROW_DATABASE_ID=your_db_id
BASEROW_TABLE_EMPLOYEES=table_id
BASEROW_TABLE_ASSETS=table_id
BASEROW_TABLE_TASKS=table_id
BASEROW_TABLE_TIME_CLOCK=table_id
BASEROW_TABLE_EXPENSES=table_id
BASEROW_TABLE_VEHICLE_LOGS=table_id

# Twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## Upcoming Tasks

### P1: Phase 7 - Testing & UAT
- End-to-end testing of all user flows
- Performance testing
- Security audit

### P2: Phase 8 - Deployment & Go-Live
- Deploy DocuSeal and Baserow to Azure
- Configure production environment variables
- Execute Terraform deployment
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
- `/app/lib/auth-context.tsx` - Auth provider with route protection
- `/app/lib/notification-context.tsx` - Notification system
- `/app/lib/services/docuseal.ts` - DocuSeal API integration
- `/app/lib/services/baserow.ts` - Baserow API integration
- `/app/components/notification-panel.tsx` - Notification UI
- `/app/components/dashboard-layout.tsx` - Dashboard layout with auth
- `/app/app/login/page.tsx` - Login page
- `/app/app/dashboard/*/page.tsx` - Persona dashboards

### Configuration
- `/app/config/` - DocuSeal, Baserow configs
- `/app/terraform/` - Azure infrastructure
- `/app/.github/workflows/` - CI/CD pipelines
