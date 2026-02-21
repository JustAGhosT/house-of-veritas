# Changelog

All notable changes to the House of Veritas platform are documented here.

## [0.4.0] - 2026-02-21

### Added

- Azure Document Intelligence (OCR) Terraform module (`modules/cognitive/`)
- Azure DNS module for automated `nexamesh.ai` record management (`modules/dns/`)
- `asset-uploads` blob container for asset photo storage
- `.env.local` as single source of truth for local secrets
- Comprehensive deployment guide with all integration steps
- Infrastructure architecture documentation
- Local development guide with Docker Compose setup
- Documentation reorganization into structured `docs/` subdirectories

### Changed

- Domain switched from `houseofveritas.za` to `nexamesh.ai`
- Application Gateway now supports HTTP-only mode (SSL optional via dynamic blocks)
- CI/CD workflows updated to pass `domain_name` and `ssl_certificate_*` variables
- `.gitignore` cleaned up (removed duplicates, added `*.tfvars`, `tfplan`)
- All documentation renamed to numbered kebab-case convention

### Fixed

- `backend.hcl` storage account name typo (`sthouseofveritastfstate` -> `sthoveritastfstate`)
- `main.tf` trailing whitespace formatting issues

## [0.3.0] - 2026-02-20

### Added

- Terraform infrastructure modules (network, storage, security, database, compute, gateway)
- GitHub Actions CI/CD workflows (plan, apply, deploy, destroy, checklist)
- Azure Functions for webhooks and scheduled tasks
- Docker Compose local development environment

## [0.2.0] - 2025-12

### Added

- Next.js application with multi-persona dashboards
- Asset management with full CRUD
- Inventory tracking with barcode scanning
- OCR document scanning
- Marketplace integration

## [0.1.0] - 2025-11

### Added

- Initial project scaffold
- Landing page with feature showcases
- Stubbed API routes
- Authentication system with role-based access
