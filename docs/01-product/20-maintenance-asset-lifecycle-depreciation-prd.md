# Maintenance/Asset Lifecycle & Depreciation PRD

**Module/Feature Name:** Maintenance/Asset Lifecycle & Depreciation  
**Marketing Name:** VeritasVault Asset 360  
**Readiness:** Draft — flows defined for asset lifecycle, depreciation, service/repair, disposal/insurance, audit/export models

---

## Platform/Mesh Layer(s)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js/React (asset management, lifecycle, and depreciation dashboards) |
| Backend | Baserow (asset registry & scheduling), Azure Functions (alerting & depreciation engine) |
| Storage | Azure Blob (photos, documents, insurance certificates) |

---

## Primary Personas

- **Workshop/Admin**
- **Maintenance/Support**
- **Owner**
- **Auditor/Insurance**

---

## Core Value Proposition

End-to-end tracking for every asset's lifecycle (purchase, assignment, use, service, depreciate, retire), fully audit-linked to maintenance, insurance, and compliance—maximized value, minimized risk.

---

## Priority & License

- **Priority:** P0 — central for estate value, cost control, audit, and risk management
- **License Tier:** Enterprise for all estate assets; optional compliance/insurance add-on; multi-estate integration

---

## Business Outcome/Success Metrics

- Reduce untracked/overdue maintenance by 90%
- Recapture insurance/report value
- Lower asset loss/damage rate
- Complete depreciation and retire records to support audit/tax owner confidence

---

## Integration Points

- Asset Registry
- Maintenance/Issue Tracking
- Financial/Expense Module
- Compliance Vault
- Project/Chore Scheduler
- Insurance APIs
- Analytics System
- Document Locker

---

## TL;DR

Every asset, from purchase to deployment and through to retirement or replacement, is fully tracked with reminders, insurance/export, depreciation, service logs, and value history—enabling complete compliance, cost, and audit reporting.

---

## Problem Statement

Key assets are frequently lost, misused, or undiscoverable due to outdated tracking methods. Maintenance is often overdue, lifecycle events are missed, and depreciation remains invisible—leading to unnecessary risk, hidden costs, ineffective audit response, and weakened planning/capital controls.

---

## Core Challenge

Integrate purchase/ownership, real use/maintenance, depreciation, and end-of-life workflows and events—tying in audit, auto-alerting, financial reporting, and compliance checks in a seamless, audit-friendly system.

---

## Current State

Organizations rely on ad hoc spreadsheets or local/manual records. This results in asset loss/damage, overdue repairs, lapses in insurance/registration, and difficult or incomplete tax/audit reporting.

---

## Why Now?

Estate assets are major capital investments where compliance, tax, and owner value now depend on comprehensive, real-time tracking. Modern digital infrastructure (e.g., mesh-native, mobile, serverless) finally enables complete and cost-effective automation of these requirements.

---

## Goals & Objectives

### Business Goals

- Maximize asset uptime and useful life
- Eliminate loss and overdue insurance events
- Fully withstand audit/compliance reviews
- Empower owners with complete reporting and export capability
- Enable complete asset depreciation and accounting

### User Goals

- Instantly know each asset's status and upcoming events
- Easy upload of documents, proof, and photos
- Seamless audit/export functionality
- Automated reminders for service, compliance, and insurance
- Up-to-date insurance and certification records

### Non-Goals (Out of Scope)

- Deep RPA sensor integration (v1 only)
- Direct vendor/market resale integration at MVP
- Predictive service or ML-driven alerts (roadmap phase 2+)
- Biometric user tie-in

---

## Measurable Objectives

| Metric | Baseline | Target | Timeline |
|--------|----------|--------|----------|
| Lost/aged assets | N/A | Zero | 12 months |
| Maintenance on-time % | <40% | 95%+ | 9 months |
| Compliance document tracked | N/A | 100% | 6 months |
| Depreciation/report for tax | <10% | 100% | Annually |

---

## Stakeholders

| Role | Responsibility |
|------|----------------|
| Admin | Tracks asset inventory, manages scheduling, validates asset events |
| Owner | Audits, authorizes retirement/disposal/export, monitors trends |
| Maintenance/Support | Delivers services, closes work orders, reports incidents |
| Insurance/Auditor | Reviews compliance, certs/insurance, and supports audit cycles |

---

## User Personas & Stories

### Primary Personas

- **Asset-Owner/Admin:** Motivated by full control, accountability, and audit-readiness; pain points in loss, overdue events, incomplete reports.
- **Maintenance Staff:** Needs efficient schedule/alerting, quick proof upload, minimal paperwork.
- **Owner:** Requires clean audits, complete tax/insurance data, lifecycle cost management.
- **Auditor/Insurance Lead:** Concerned with compliance, proof, and event timelines.

### User Stories

1. **Admin:** As an admin, I need to add, assign, and maintain records for assets, including insurance/proof, and retire assets when due, so nothing is missed and all assets are accounted for.
2. **Maintenance Staff:** As maintenance staff, I need to receive scheduled reminders, report completed services with proof, and flag urgent issues, so upkeep is always transparent and documented.
3. **Owner:** As an owner, I want to export asset data for depreciation and insurance, see audit/compliance trends, and trigger retirements/replacements.
4. **Auditor/Insurer:** As an auditor or insurer, I want to access full asset/event logs with documents to verify compliance and risk status.

---

## Use Cases & Core Flows

### Primary Use Cases

- **Lifecycle Management:** Add, assign, track, service, retire, and replace assets
- **Depreciation Tracking:** Automatically compute, report, and export depreciation data
- **Audit Trail:** Export full event and status history for compliance and audit
- **Document Vault:** Manage photos, proof of service, certificates, insurance docs
- **Compliance/Insurance:** Monitor policy renewals, incident links, and certification trends

### User Flow Diagram

**Roles & Flow:**

- **Admin:** Add → Assign → Schedule → Service → Alert/Depreciate → Retire
- **Maintenance:** Service → Complete → Proof Upload → Audit Trail
- **Owner:** Notify → Audit/Export → Retire/Replace

```text
[New Asset] → [Assign] → [Schedule] → [Service] → [Depreciate] → [Retire/Replace]
```

### Edge Cases

- **Lost asset:** Triggers incident/alert, disables schedule, requires admin validation.
- **Late service/overdue:** Escalate alert, log to compliance, require staff note.
- **Duplicate asset:** Notify admin, prevent assignment.
- **Accidental retire:** Require two-step/final confirmation.
- **Doc/photo lost:** Alert, log event, allow admin upload.
- **Compliance fail:** Freeze status, alert owner/audit, block export.
- **Unverifiable retire:** Flag for auditor review.

---

## Functional Requirements

- Asset add/assign/tag
- Event/service scheduling/notification
- Maintenance/repair logging and overdue alerts
- Depreciation calculator and export/reporting
- Insurance/compliance/document management (upload, expiration, proof)
- Audit/export capabilities for owner/admin
- Role-based and batch import
- Emergency overwrite and incident linking

---

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Mobile scan and edit support | Yes |
| Camera proof/upload integration | Yes |
| Accessibility | ARIA compliance |
| Status response | Sub-2s |
| Secure log retention | 7+ years |
| Service close time on event trigger | <6h |
| Audit trail | Complete; rapid compliance export |

---

## Mesh Layer Mapping

| Layer | Component/Responsibility |
|-------|---------------------------|
| Frontend | Asset management interface (add, assign, service logs, depreciation views, retire/export) |
| Backend | Asset registry and event DB (Baserow), depreciation engine (Azure Functions), alerting, scheduling, audit/event trace |
| Storage | Azure Blob for photos, receipts, certification archives, export logs |

---

## APIs & Integrations

### Required APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/asset | POST/GET | Create and fetch asset data |
| /api/assign | PATCH | Assign/transfer asset ownership |
| /api/service | POST/GET | Service event logs |
| /api/maintenance | POST | Schedule and record maintenance |
| /api/depreciate | POST/GET | Asset depreciation calculation and retrieval |
| /api/report/export | POST | Generate and export compliance, tax, and audit reports |
| /api/audit | GET | Audit event log access |
| /api/doc | POST/GET | Upload/fetch insurance, certification, and media proofs |

### External Dependencies

- Baserow asset registry
- Maintenance service partner API (for incidents/overdue)
- Azure Blob upload APIs (for photos/docs)
- Insurance/compliance APIs
- Depreciation/tax calculation models for export
- Project/task system for cross-linking

---

## Data Models

| Entity | Key Fields |
|--------|------------|
| Asset | ID, serial, type, assigned user, docs/photos/cert, schedule, service/event, depreciation, start/retire/replace dates, status |
| Service | AssetID, time/desc, status, proof, overdue flag |
| Depreciation | AssetID, curve/model, value, start/end, event/close |
| Audit | AssetID, action, executor, timestamp, doc, retire/export flag |
| Insurance | AssetID, provider, certificate/date, renewal flag, claim/event logs |

---

## User Experience & Entry Points

### Onboarding Flow

- Admin bulk import/add assets
- Assign assets, set schedules, and document insurance/certs
- Owner setup for audit/export, maintenance team invites
- Mobile camera onboarding for quick asset proof (QR/barcode/photo)

### Primary UX Flows

- **Admin:** Add/import → Assign → Schedule → Service → Audit/Export
- **Maintenance:** View service schedule → Log service/closure with proof
- **Owner:** Export asset/depreciation data → Review trends/audit activity
- **Auditor:** Download/extract event logs, verify compliance

---

## Accessibility Requirements

- Full ARIA compliance for scan/edit
- Camera alternatives for proof/doc upload
- Color and accessible text for depreciation curves
- Accessible error messages and batch feedback

---

## Success Metrics

### Leading Indicators

- Rate of new asset add/assignment/service tracking
- Number of overdue/alert triggers actioned
- Document proof upload coverage
- Scheduled depreciation calculations logged
- Owner audit/export actions
- Batch import completion success

### Lagging Indicators

- Asset loss/disposal/voucher rates
- Insurance/claim fulfillment
- Depreciation curve trend alignment
- Audit pass/fail rates
- Owner actions on report/audit

### Measurement Plan

- All events/services/actions logged and tracked in analytics
- Audit and export/download activity monitored
- Owner reviews and reporting frequency collected
- Compliance document/proof download tracked
- Trends and event triggers reviewed monthly

---

## Timeline & Milestones

| Phase | Scope | Target Date | Dependencies |
|-------|-------|-------------|--------------|
| Phase 1 | Asset add → Schedule → Assign → Service | Q3 | Baserow, Blob |
| Phase 2 | Depreciation calc/report/export | Q4 | Azure Functions |
| Phase 3 | Audit/insurance/export, doc archive | Q1 2027 | Maintenance partner, APIs |
| Enhancement | Mobile-first & camera, bulk workflows | Q2 2027 | Frontend, UX testing |

*Dates are relative to document version Feb 2025.*

---

## Known Constraints & Dependencies

### Technical Constraints

- High upload/scan speed for mobile/photo
- Fault-tolerant external insurance/integration APIs
- Real-time or batch audit/export handling
- Flexible depreciation models per asset type/country
- Secure and rapid document/archive access

### Business Constraints

- Timely depreciation/insurance export for reporting deadlines
- Owner permissions and report rights
- Integration timelines with partners/services
- Offboarding/export for audit recovery

### Dependencies

- Asset registry data source (Baserow)
- Maintenance and incident management systems
- Insurance calculation/renewal APIs
- Documentation/cert storage compatible with export
- Owner/auditor roles for export authority

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Overdue/late maintenance | High | Medium | Auto-alerting, escalation, incident creation |
| Asset loss/disposal event unlogged | High | Low | Mandatory event log, admin override required |
| Insurance/dep/doc upload fails | Medium | Medium | Admin backup process, retry queue |
| Audit/export delay | Medium | Medium | Batch processing, pre-scheduled exports |

---

## Open Questions

1. **Automated depreciation curve at MVP?** (Owner: Product, Timeline: Pre-Phase 2, Impact: Accuracy/workload)
2. **External insurance/vendor API support?** (Owner: Eng/Partnerships, Timeline: Q4, Impact: Export/compliance)
3. **Owner batch audit/export by asset/event/service?** (Owner: UX Lead, Timeline: Q2, Impact: Audit readiness)
4. **Exposure/risk trigger integration for incidents?** (Owner: Compliance, Timeline: Q3, Impact: Liability response)

---

## Appendix

### Research & Data

- Asset/service/event log review, insurance/depreciation pilot assessments, compliance trend reports, partner interviews.

### Design Mockups

- Asset add/schedule screen, depreciation curve view, export/audit/mobile templates, document/photo upload wireframes.

### Technical Feasibility

- Assessment of scalable asset/event registry, Blob/document/photo upload, depreciation/insurance export prototypes, batch administrative event scripts, incident escalation mechanisms.

### Competitive Analysis

- Market review shows most asset tracking platforms are fragmented—often covering only core inventory without unified lifecycle, depreciation, insurance, audit, or event logging. Asset 360's mesh-native approach unifies all facets, maximizing audit-value, minimizing loss/risk, and ensuring modern estate compliance.
