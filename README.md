# House of Veritas - Digital Governance & Estate Management Platform

> A secure, enforceable, and user-friendly governance platform for estate management, document compliance, and operational accountability.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Azure](https://img.shields.io/badge/Azure-Ready-0078D4?logo=microsoftazure)](https://azure.microsoft.com/)
[![BCEA Compliant](https://img.shields.io/badge/BCEA-Compliant-green)](https://www.labour.gov.za/)

### CI/CD Status
![Deployment Checklist](https://img.shields.io/badge/Checklist-Automated-blue)
![Terraform](https://img.shields.io/badge/Terraform-1.5+-purple?logo=terraform)
![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=githubactions)

## 🎯 Overview

House of Veritas is a comprehensive digital governance platform designed for estate management, combining legally enforceable e-signatures, operational tracking, and compliance automation. Built on open-source technologies (DocuSeal + Baserow) and deployed on Azure, it provides enterprise-grade security at a sustainable cost (<R1,000/month).

### Key Features

✅ **18 Governance Documents** - Full digital signing and compliance tracking  
✅ **4 User Roles** - Granular role-based access control  
✅ **8 Feature Modules** - Complete operational coverage  
✅ **BCEA Compliant** - South African labor law adherence  
✅ **99.9% Uptime SLA** - Azure-backed reliability  
✅ **Multi-Stage Alerts** - Proactive compliance monitoring (60d/30d/7d)

---

## 📚 Documentation

Comprehensive design documents are available in the [`/docs`](/docs) directory:

1. **[Platform Specification](/docs/01-platform-specification.md)** - Business requirements, dual-mode tracking, personas
2. **[Azure Deployment Guide](/docs/02-azure-deployment-guide.md)** - Infrastructure, Terraform, CI/CD, cost optimization
3. **[Functional Design](/docs/03-functional-design.md)** - 8 feature modules, workflows, user stories
4. **[Technical Design](/docs/04-technical-design.md)** - Architecture, database schema, APIs, security

### Project Management

- **[Implementation Backlog](/BACKLOG.md)** - Prioritized backlog for full end-to-end implementation (7 phases)
- **[Future Enhancements](/FUTURE_ENHANCEMENTS.md)** - Strategic roadmap for platform evolution and upgrades

---

## 🏗️ Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────┐
│  Presentation Tier                              │
│  ┌─────────────────────────────────────────┐   │
│  │  Application Gateway (SSL, WAF)         │   │
│  │  - docs.houseofveritas.za               │   │
│  │  - ops.houseofveritas.za                │   │
│  └─────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│  Application Tier (Private Subnet)              │
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │  DocuSeal        │  │  Baserow         │   │
│  │  (Signatures)    │  │  (Operations)    │   │
│  └──────────────────┘  └──────────────────┘   │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│  Data Tier (Private Subnet)                     │
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │  PostgreSQL 14   │  │  Blob Storage    │   │
│  │  (Managed)       │  │  (Documents)     │   │
│  └──────────────────┘  └──────────────────┘   │
└──────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend (Production):** DocuSeal (Ruby on Rails), Baserow (Django/Python)
- **Database:** Azure PostgreSQL Flexible Server
- **Storage:** Azure Blob Storage
- **Infrastructure:** Terraform, Azure Container Instances
- **CI/CD:** GitHub Actions
- **Monitoring:** Azure Monitor, Log Analytics

---

## 👥 User Personas

### Hans (Owner/Administrator)
- **Role:** Complete oversight and control
- **Features:** Full dashboard, approval workflows, financial tracking, compliance monitoring
- **Color Theme:** Deep Blue (#1e40af)

### Charl (Workshop Operator)
- **Role:** Employee/Resident, Mechanic
- **Features:** Task management, asset tracking, time logging, incident reporting
- **Color Theme:** Green (#16a34a)

### Lucky (Gardener/Handyman)
- **Role:** Grounds operations
- **Features:** Daily tasks, expense submission, vehicle logs, time tracking
- **Color Theme:** Emerald (#10b981)

### Irma (Resident/Household)
- **Role:** Household management
- **Features:** Household tasks, resident agreement, child-related incident reporting
- **Color Theme:** Orange (#ea580c)

---

## 🚀 Eight Core Modules

### 1. Document Management & E-Signatures
- DocuSeal integration for BCEA-compliant digital signatures
- 18 governance documents tracked
- Multi-signatory workflows
- Cryptographic audit trails
- Version control and archival

### 2. Financial Tracking
- **Dual-mode:** Post-hoc logging + pre-approval workflow
- Contractor milestone payments (Deposit → Progress → Completion)
- Budget vs Actuals dashboards
- 10 expense categories (Materials, Labor, Fuel, etc.)
- Receipt upload and management

### 3. Time Tracking & Overtime
- **Dual-mode:** Task-level logging + clock-in/out
- BCEA-compliant overtime calculation (>9hrs/day, >45hrs/week)
- Approval workflows
- Mobile-friendly time entry
- Analytics and reporting

### 4. Task Management
- Daily and recurring task assignments
- Priority levels (Low/Medium/High)
- Status tracking (Not Started/In Progress/Completed)
- Time logging per task
- Project association

### 5. Asset Registry
- Tools, vehicles, equipment, household items
- Check-in/out workflows
- Maintenance scheduling
- Condition tracking
- Valuation management

### 6. Incident Reporting
- Safety, equipment, vehicle, household incidents
- Severity levels (Low/Medium/High)
- Automated routing to Hans
- Witness documentation
- Resolution tracking

### 7. Vehicle Logs
- Driver authorization
- Odometer tracking (distance calculation)
- Fuel logging and cost tracking
- Child passenger compliance
- Maintenance reminders

### 8. Compliance & Document Expiry
- Multi-stage alert system (60d/30d/7d)
- Color-coded urgency (🟢 Green → 🟡 Yellow → 🔴 Red)
- Configurable alert schedules
- Auto-escalation
- Quick-action renewal buttons

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and Yarn
- Git
- (For production) Azure subscription, Terraform 1.5+

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd house-of-veritas
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Run development server:**
   ```bash
   yarn dev
   ```

4. **Open browser:**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
yarn build
yarn start
```

---

## 📁 Project Structure

```
house-of-veritas/
├── app/
│   ├── api/                    # Next.js API routes (stubbed backend)
│   │   ├── stats/
│   │   ├── documents/
│   │   ├── employees/
│   │   ├── expenses/
│   │   ├── contractors/
│   │   ├── tasks/
│   │   ├── assets/
│   │   ├── incidents/
│   │   ├── vehicles/
│   │   └── time/
│   ├── layout.tsx              # Root layout with fonts
│   ├── page.tsx                # Main landing page
│   └── globals.css             # Global styles
├── components/
│   ├── navbar.tsx              # Navigation with HV logo
│   ├── hero.tsx                # Hero section
│   ├── stats-section.tsx       # 4-stat display (live data)
│   ├── feature-modules.tsx     # 8 module showcase
│   ├── dashboard-preview.tsx   # Hans' admin dashboard
│   ├── role-dashboards.tsx     # 4 user persona cards
│   ├── compliance-section.tsx  # Trust & compliance indicators
│   ├── grid-pattern.tsx        # Background grid overlay
│   ├── footer.tsx              # Footer with links
│   ├── final-cta.tsx           # Bottom CTA section
│   └── ui/                     # shadcn/ui components
├── config/                     # Platform configuration
│   ├── docker-compose.yml      # Local development orchestration
│   ├── .env.template           # Environment variables template
│   ├── docuseal/               # DocuSeal setup documentation
│   ├── baserow/                # Baserow setup & schema docs
│   ├── nginx/                  # Reverse proxy configuration
│   ├── templates/              # Document template list (18+)
│   └── scripts/                # Setup & automation scripts
├── docs/
│   ├── 01-platform-specification.md
│   ├── 02-azure-deployment-guide.md
│   ├── 03-functional-design.md
│   └── 04-technical-design.md
├── terraform/                  # Infrastructure as Code (Azure)
│   ├── modules/                # Reusable Terraform modules
│   ├── environments/           # Environment configurations
│   └── DEPLOYMENT.md           # Deployment guide
├── hooks/                      # Custom React hooks
├── lib/                        # Utility functions
├── public/                     # Static assets
├── styles/                     # Additional styles
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind configuration
├── next.config.mjs             # Next.js configuration
└── README.md                   # This file
```

---

## 🔐 Security & Compliance

### Security Features
- **Network Isolation:** Private VNet, NSG rules, no public database access
- **Encryption:** AES-256 at rest, TLS 1.2+ in transit
- **Authentication:** JWT tokens, bcrypt password hashing, 2FA for admin
- **Authorization:** Role-based access control (RBAC)
- **Audit Trails:** Complete logging of all actions
- **Secret Management:** Azure Key Vault for all credentials

### Compliance Standards
- **BCEA** - Basic Conditions of Employment Act (South Africa)
- **POPIA** - Protection of Personal Information Act (South Africa)
- **ECT Act** - Electronic Communications and Transactions Act (South Africa)
- **WCAG 2.1 AA** - Web accessibility standards

---

## 💰 Cost Structure

### Production Infrastructure (Azure)

| Service | Monthly Cost |
|---------|--------------|
| PostgreSQL Flexible Server | R400 |
| Container Instances (2x) | R300 |
| Blob Storage | R50 |
| Application Gateway | R150 |
| Key Vault + NAT Gateway | R50 |
| **Total** | **R950/month** |

**Annual:** Domain name R150/year

### Cost Optimization
- Hot/cool/archive lifecycle for storage
- Right-sized container resources
- 90-day log retention
- Monthly spending review
- Budget alerts at >80%

---

## 📊 Data Models

### Core Tables (Baserow)

1. **Employees** - HR records, contracts, leave balances
2. **Assets** - Tools, vehicles, equipment tracking
3. **Tasks** - Daily operations, time logging
4. **Time Clock Entries** - Clock-in/out, overtime calculation
5. **Incidents** - Safety and operational incident reports
6. **Vehicle Logs** - Usage authorization, fuel tracking
7. **Expenses** - Financial tracking, contractor milestones
8. **Document Expiry** - Compliance alert tracking

See [Technical Design Document](/docs/04-technical-design.md) for complete schema definitions.

---

## 🚢 Deployment

### Azure Deployment (Production)

1. **Prerequisites:**
   - Azure subscription
   - Terraform installed
   - GitHub account
   - Domain name

2. **Deploy Infrastructure:**
   ```bash
   cd terraform
   terraform init
   terraform plan -out=tfplan
   terraform apply tfplan
   ```

3. **Configure DNS:**
   - Point `docs.houseofveritas.za` to Application Gateway
   - Point `ops.houseofveritas.za` to Application Gateway

4. **Set up SSL:**
   - Generate Let's Encrypt certificates
   - Upload to Azure Key Vault
   - Configure in Application Gateway

5. **Deploy Applications:**
   - DocuSeal container
   - Baserow container
   - Configure webhooks and automation

See [Azure Deployment Guide](/docs/02-azure-deployment-guide.md) for detailed instructions.

---

## 🧪 Testing

### Stubbed Backend APIs

The current implementation includes 10 fully functional API endpoints with realistic mock data:

```bash
# Test API endpoints
curl http://localhost:3000/api/stats
curl http://localhost:3000/api/documents
curl http://localhost:3000/api/employees
curl http://localhost:3000/api/contractors
curl http://localhost:3000/api/tasks
curl http://localhost:3000/api/expenses
curl http://localhost:3000/api/assets
curl http://localhost:3000/api/incidents
curl http://localhost:3000/api/vehicles
curl http://localhost:3000/api/time
```

All endpoints return JSON data aligned with the technical specifications.

---

## 📈 Success Metrics

### Leading Indicators
- ✅ E-signature usage rate
- ✅ Task completion rate (on-time)
- ✅ Digital logging vs manual
- ✅ User satisfaction scores

### Lagging Indicators
- 🎯 100% document compliance
- 🎯 0 missed renewals in 6 months
- 🎯 Hans' admin hours ≤5/week (down from 24/week)
- 🎯 99.9%+ uptime

---

## 🛣️ Roadmap

### Phase 1: MVP ✅ Complete
- ✅ Landing page with feature showcase
- ✅ Stubbed backend APIs
- ✅ Professional design system
- ✅ Role-based dashboard previews
- ✅ Comprehensive documentation

### Phase 2: Infrastructure ✅ Complete
- ✅ Terraform modules (network, compute, storage, security, gateway)
- ✅ GitHub Actions CI/CD workflows
- ✅ Azure deployment documentation

### Phase 3: Platform Configuration ✅ Complete
- ✅ Docker Compose for local development
- ✅ DocuSeal configuration & setup guide
- ✅ Baserow schema & setup guide (8 tables)
- ✅ Data seeding scripts (employees, assets, documents)
- ✅ Azure Functions for webhooks & automation
- ✅ Document template list (18+ governance documents)

### Phase 4: Production Deployment (Next)
- Deploy DocuSeal + Baserow on Azure
- User account creation (4 users)
- Data migration from seeding scripts
- UAT and training
- Webhook registration

### Phase 5: Enhancements (3-6 months)
- Mobile apps (React Native)
- Biometric time clock
- Advanced analytics
- Reporting suite

### Phase 6: Scale (6-12 months)
- Multi-property support
- Payroll integration
- GPS vehicle tracking
- Predictive maintenance (AI)

---

## 🤝 Contributing

This is a private project for House of Veritas. For questions or suggestions, please contact the project administrator.

---

## 📄 License

This project is proprietary software for House of Veritas estate management.

---

## 👨‍💼 Primary Stakeholders

- **Hans Jurgens Smit** - Owner/Executor/Administrator
- **Charl** - Workshop Operator
- **Lucky** - Gardener/Handyman
- **Irma** - Resident/Household Manager

---

## 🆘 Support

For technical support or questions:
- 📧 Email: admin@houseofveritas.za
- 📚 Documentation: `/docs` directory
- 🐛 Issues: Contact administrator

---

## 🎉 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Radix UI](https://www.radix-ui.com/) - Accessible components
- [DocuSeal](https://www.docuseal.co/) - E-signature platform
- [Baserow](https://baserow.io/) - Open-source database
- [Azure](https://azure.microsoft.com/) - Cloud infrastructure
- [Terraform](https://www.terraform.io/) - Infrastructure as Code

---

## 📝 Version History

- **v1.2.0** (2025-12) - Phase 3 complete: DocuSeal/Baserow configuration, scripts, automation
- **v1.1.0** (2025-01-23) - Phase 2 complete: Terraform infrastructure, CI/CD
- **v1.0.0** (2025-01-23) - Initial release with landing page and stubbed backend
- **v0.1.0** (2025-01-20) - Project initialization and design documents

---

<p align="center">
  <strong>House of Veritas</strong> - Governance Made Simple. Operations Made Transparent.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Built%20with-❤️-red" alt="Built with love">
  <img src="https://img.shields.io/badge/Status-Active-success" alt="Status">
  <img src="https://img.shields.io/badge/Azure-Ready-0078D4" alt="Azure Ready">
</p>
