# House of Veritas — Digital Governance Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-black?logo=nextdotjs" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/Azure-Ready-0078D4?logo=microsoftazure" alt="Azure Ready">
</p>

A comprehensive estate and asset management platform for private households and small estates, featuring secure document signing, operational tracking, inventory management, and AI-powered automation.

---

## 🌟 Features

### Core Functionality
- **Multi-persona Dashboard** — Role-based access for Owner, Workshop, Garden, and Household staff
- **Task Management** — Assign, track, and complete tasks across departments
- **Document Management** — Digital document storage with DocuSeal integration
- **Time & Attendance** — Clock in/out with biometric support
- **Expense Tracking** — Submit and approve expenses with receipt capture

### Asset Management
- **Full CRUD Operations** — Create, view, edit, delete assets with rich metadata
- **Photo Gallery** — Upload and manage asset photos (Azure Blob Storage ready)
- **Condition Tracking** — Monitor asset health: Excellent → Needs Repair
- **Sale Management** — Mark assets for sale, track sale status
- **Maintenance History** — Log repairs and service records

### Inventory System
- **Stock Level Tracking** — Min/max/reorder points with visual indicators
- **Low Stock Alerts** — Automatic notifications when stock is critical
- **Consumption Logging** — Track who used what and why
- **Shopping List Generation** — Auto-generate orders from low stock items
- **OCR Invoice Import** — Scan invoices to auto-add inventory items

### Barcode/QR Scanning
- **Real-time Scanner** — Camera-based scanning using device camera
- **Supported Formats** — QR Code, EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39
- **Label Printing** — Generate and print barcode labels for items
- **Batch Scanning** — Stock counts, batch consume, batch restock modes
- **Quick Lookup** — Scan to instantly find item details

### Marketplace Integration
- **Multi-platform Listing** — Gumtree, Facebook Marketplace, OLX, BidOrBuy
- **AI-generated Descriptions** — Smart listing copy generation
- **Views & Inquiries Tracking** — Monitor listing performance
- **Potential Revenue Dashboard** — See total value of items for sale

### OCR Document Scanner
- **Invoice Processing** — Extract line items, totals, vendor info
- **Receipt Scanning** — Capture expense receipts automatically
- **Handwritten Notes** — Process material requests from field notes
- **Auto-import to Inventory** — One-click import of scanned items

### Additional Features
- **PWA Support** — Install as mobile app, works offline
- **Real-time Updates** — SSE-based live notifications
- **Predictive Maintenance** — AI-powered maintenance scheduling
- **Report Generation** — PDF exports for all reports
- **Audit Logging** — Complete activity trail
- **Multi-language Ready** — i18n infrastructure in place

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Yarn package manager
- MongoDB (optional for dev)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/house-of-veritas.git
cd house-of-veritas

# Install dependencies
yarn install

# Start development server
yarn dev
```

### Environment Variables

Create `.env.local` with:

```env
# Required for AI features
EMERGENT_LLM_KEY=sk-emergent-xxxxx

# Optional: Azure Document Intelligence (OCR)
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_DOCUMENT_INTELLIGENCE_KEY=your-key

# Optional: Azure Blob Storage (file uploads)
AZURE_STORAGE_CONNECTION_STRING=your-connection-string
AZURE_STORAGE_CONTAINER=house-of-veritas
```

### Default Login Credentials

| User | Email | Password | Role |
|------|-------|----------|------|
| Hans | hans@houseofv.com | hans123 | Administrator |
| Charl | charl@houseofv.com | charl123 | Workshop |
| Lucky | lucky@houseofv.com | lucky123 | Garden |
| Irma | irma@houseofv.com | irma123 | Household |

---

## 📁 Project Structure

```
/app
├── app/                        # Next.js App Router
│   ├── api/                    # API Routes
│   │   ├── assets/enhanced/    # Asset management
│   │   ├── inventory/          # Inventory tracking
│   │   ├── ocr/                # OCR processing
│   │   ├── marketplace/        # Marketplace listings
│   │   ├── files/              # File uploads
│   │   └── ...
│   ├── dashboard/              # Dashboard pages
│   │   ├── hans/               # Admin dashboard
│   │   │   ├── assets/         # Asset management
│   │   │   ├── inventory/      # Inventory page
│   │   │   ├── ocr/            # OCR scanner
│   │   │   ├── marketplace/    # Marketplace
│   │   │   └── ...
│   │   ├── charl/              # Workshop dashboard
│   │   ├── lucky/              # Garden dashboard
│   │   └── irma/               # Household dashboard
│   └── login/                  # Authentication
├── components/                 # React components
│   ├── ui/                     # Shadcn/UI components
│   ├── barcode-scanner.tsx     # Barcode scanning
│   ├── barcode-label-generator.tsx  # Label printing
│   ├── batch-scanner.tsx       # Batch operations
│   ├── dashboard-layout.tsx    # Main layout
│   └── ...
├── lib/                        # Utilities
│   ├── auth-context.tsx        # Authentication
│   ├── services/               # API services
│   └── hooks/                  # Custom hooks
├── docs/                       # Documentation
│   ├── 02-azure-deployment-guide.md
│   └── ...
├── terraform/                  # Azure IaC
└── memory/                     # Project docs
    └── PRD.md                  # Product requirements
```

---

## 🔧 API Reference

### Assets
- `GET /api/assets/enhanced` — List all assets with filters
- `POST /api/assets/enhanced` — Create new asset
- `PUT /api/assets/enhanced` — Update asset
- `DELETE /api/assets/enhanced?id=xxx` — Delete asset

### Inventory
- `GET /api/inventory` — List inventory with filters
- `GET /api/inventory?barcode=xxx` — Lookup by barcode
- `POST /api/inventory` — Consume or restock
- `PUT /api/inventory` — Import from OCR or generate shopping list

### OCR
- `POST /api/ocr` — Process document (multipart/form-data)
- `GET /api/ocr` — List recent scans

### Marketplace
- `GET /api/marketplace` — List all listings
- `POST /api/marketplace` — Create or auto-publish listing

### Files
- `GET /api/files` — Get upload configuration
- `POST /api/files` — Upload file
- `DELETE /api/files?id=xxx` — Delete file

---

## 🛠 Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| UI Components | Shadcn/UI |
| Charts | Recharts |
| Barcode Scanning | html5-qrcode |
| PDF Generation | jspdf |
| Real-time | Server-Sent Events |
| AI Integration | Emergent LLM Key |
| Cloud | Azure (planned) |

---

## 📋 Roadmap

### Completed ✅
- [x] Multi-persona authentication system
- [x] Task and document management
- [x] Time tracking and expenses
- [x] Asset management with CRUD
- [x] Inventory tracking with alerts
- [x] OCR document scanning
- [x] Marketplace integration
- [x] Barcode/QR scanning
- [x] Label printing
- [x] Batch scanning operations
- [x] Grid/3D visual theme

### In Progress 🚧
- [ ] Azure deployment (Terraform ready)
- [ ] Real marketplace API integrations
- [ ] Azure Blob Storage integration

### Planned 📅
- [ ] Native mobile apps (React Native)
- [ ] Vehicle GPS tracking
- [ ] Advanced AI analytics
- [ ] Online store integration (Cashbuild)

---

## 🚢 Deployment

### Azure Deployment

See [docs/02-azure-deployment-guide.md](docs/02-azure-deployment-guide.md) for complete instructions including:

1. Service Principal creation (PowerShell & Bash)
2. GitHub secrets configuration
3. Terraform backend setup
4. Infrastructure deployment
5. SSL certificate generation
6. Application configuration

### Quick Deploy Commands

```bash
# Navigate to Terraform
cd terraform/environments/production

# Initialize
terraform init -backend-config="backend.hcl"

# Plan
terraform plan -var-file="terraform.tfvars" -out=tfplan

# Apply
terraform apply tfplan
```

---

## 📄 License

Proprietary — House of Veritas © 2026

---

## 🤝 Support

For support, contact the House of Veritas IT team or raise an issue in this repository.

---

<p align="center">
  <strong>House of Veritas</strong> — Digital Governance Platform
</p>
