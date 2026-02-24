# House of Veritas -- Digital Governance Platform

A comprehensive estate and asset management platform for private households and small estates, featuring secure document signing, operational tracking, inventory management, and AI-powered automation.

**Domain:** [nexamesh.ai](https://nexamesh.ai) | **Region:** South Africa North | **Status:** Deploying

---

## Features

- **Multi-persona Dashboards** -- Role-based access for Owner, Workshop, Garden, and Household
- **Document Management** -- Digital signing via DocuSeal with full audit trails
- **Asset and Inventory** -- CRUD, photo gallery, barcode scanning, condition tracking
- **Task and Time Tracking** -- Assignment, clock in/out, overtime calculation (BCEA)
- **Expense Management** -- Submit, approve, receipt capture, OCR import
- **Marketplace** -- Multi-platform listing with AI-generated descriptions
- **OCR Scanner** -- Invoice and receipt processing via Azure Document Intelligence
- **Compliance** -- POPIA, BCEA, ECT Act compliant with full audit logging

---

## Tech Stack

| Category  | Technology                         |
| --------- | ---------------------------------- |
| Framework | Next.js 16 (App Router)            |
| Language  | TypeScript 5                       |
| Styling   | Tailwind CSS 4 + Shadcn/UI         |
| Backend   | DocuSeal (Ruby) + Baserow (Django) |
| Database  | Azure PostgreSQL Flexible Server   |
| Storage   | Azure Blob Storage (GRS)           |
| OCR       | Azure Document Intelligence        |
| IaC       | Terraform 1.5+                     |
| CI/CD     | GitHub Actions                     |
| Cloud     | Azure (South Africa North)         |

---

## Quick Start

### Local Development

```bash
yarn install
yarn dev
```

See [Local Development Guide](docs/03-deployment/02-local-development.md) for Docker-based setup with DocuSeal, Baserow, and PostgreSQL.

### Azure Deployment

```powershell
cd terraform\environments\production
terraform init -backend-config="backend.hcl"
terraform plan -var-file="terraform.tfvars" -out=tfplan
terraform apply tfplan
```

See [Deployment Guide](docs/03-deployment/01-deployment-guide.md) for complete instructions.

---

## Project Structure

```
HouseOfVeritas/
├── app/                           Next.js application (pages, API routes)
├── components/                    React components (UI, scanners, layouts)
├── lib/                           Utilities, services, hooks
├── config/                        Docker, Nginx, scripts, Azure Functions
├── terraform/                     Infrastructure as Code
│   ├── environments/production/   Production config
│   └── modules/                   Reusable modules (8 modules)
├── .github/workflows/             CI/CD pipelines
├── .env.local                     Local secrets (gitignored)
└── docs/                          Documentation
    ├── 01-product/                Platform spec, functional design, PRD
    ├── 02-architecture/           Technical design, naming, infrastructure
    ├── 03-deployment/             Deploy guide, local dev, CI/CD
    ├── 04-configuration/          DocuSeal, Baserow, Functions, templates
    └── 05-project/                Backlog, roadmap, changelog, contributing
```

---

## Documentation

| Section                                 | Contents                                                        |
| --------------------------------------- | --------------------------------------------------------------- |
| [Product](docs/01-product/)             | Platform specification, functional design, product requirements |
| [Architecture](docs/02-architecture/)   | Technical design, naming convention, infrastructure map         |
| [Deployment](docs/03-deployment/)       | Azure deployment, local development, CI/CD workflows            |
| [Configuration](docs/04-configuration/) | DocuSeal, Baserow, Azure Functions, document templates          |
| [Project](docs/05-project/)             | Backlog, roadmap, test report, changelog, contributing          |

Full index: [docs/README.md](docs/README.md)

---

## License

Proprietary -- House of Veritas (c) 2026
