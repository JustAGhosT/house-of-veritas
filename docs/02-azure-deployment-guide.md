# House of Veritas — Azure Infrastructure Deployment Guide

## Module/Feature Name

Azure IaC Deployment for DocuSeal & Baserow

## Marketing Name

House of Veritas Cloud Foundation

## Platform/Mesh Layer(s)

Azure Cloud: Infrastructure Layer (network, compute, storage, database, security)

## Core Value Proposition

A secure, automated, and maintainable deployment pipeline for House of Veritas digital operations, enabling compliant document signing and operational management via open-source platforms on Azure.

## Priority

P0 - Critical

## Business Outcome/Success Metrics

- Zero unplanned downtime within first 30 days after go-live
- <R1,000/month operating cost (Azure)
- 100% audit trail coverage for signed governance documents
- All users able to access, sign, and manage assigned documents/tasks

## TL;DR

We're deploying DocuSeal and Baserow—open-source platforms for secure document signing and operational tracking—on Azure, using Terraform for fully automated, repeatable, and auditable infrastructure provisioning, with CI/CD managed by GitHub Actions.

---

## Infrastructure Architecture

### Three-Tier Architecture

1. **Presentation Tier:** Web browsers → Application Gateway (SSL, WAF)
2. **Application Tier:** Azure Container Instances (DocuSeal, Baserow)
3. **Data Tier:** Azure PostgreSQL + Blob Storage (private subnet)

### Network Architecture

- **VNet:** 10.0.0.0/16
  - Gateway Subnet: 10.0.1.0/24
  - Container Subnet: 10.0.2.0/24
  - Database Subnet: 10.0.3.0/24
- **NSGs:** Minimal required traffic, deny by default
- **Application Gateway:** Public IP, SSL, WAF, path-based routing
- **Private Endpoints:** PostgreSQL via Azure Private Link

### Technology Stack

- **IaC:** Terraform 1.5+ with Azure Provider
- **CI/CD:** GitHub Actions
- **Containers:** DocuSeal (Ruby on Rails), Baserow (Django/Python)
- **Database:** Azure PostgreSQL Flexible Server
- **Storage:** Azure Blob Storage (documents, backups)
- **Secrets:** Azure Key Vault
- **Monitoring:** Azure Monitor, Log Analytics

---

## Cost Management

### Monthly Baseline: R950

- Database: R400
- Containers: R300
- Blob Storage: R50
- Application Gateway: R150
- Key Vault/NAT: R50

### Optimization Strategies

- Scale DB/containers only on usage
- Hot/cool/archive lifecycle for storage
- Minimal log retention
- Alert at R800 (>80%)
- Monthly review

---

## Deployment Procedure

### Prerequisites

- Azure subscription
- Azure CLI installed
- Terraform 1.5+
- GitHub account
- Domain name
- SSH key

### Steps

1. **Create Service Principal** for Terraform
2. **Set up GitHub repo** with secrets
3. **Configure Terraform backend** (Azure Blob)
4. **Run Terraform:**
   ```bash
   terraform init
   terraform validate
   terraform plan -out=tfplan
   terraform apply tfplan
   ```
5. **Configure DNS** to point to Application Gateway
6. **Generate SSL certificates** (Let's Encrypt)
7. **Set up applications:**
   - Create admin accounts
   - Configure SMTP
   - Upload document templates
   - Seed Baserow data
8. **Configure webhooks and automation**
9. **Onboard users and go live**

---

## Security & Compliance

### Security Hardening

- All private except gateway
- NSG deny by default
- Managed identities for containers
- Azure Key Vault RBAC
- 12+ char passwords, 90d expiry
- 2FA for Hans
- Session timeout: 8hrs
- CSRF/input validation
- Monthly image updates
- Quarterly security review
- Annual penetration test

### Compliance

- BCEA (Basic Conditions of Employment Act)
- POPIA (Protection of Personal Information Act)
- ECT Act (Electronic Communications and Transactions Act)
- Full audit trails
- Encrypted at rest (AES-256)
- Encrypted in transit (TLS 1.2+)

---

## Disaster Recovery

### RTO/RPO

- **RTO:** 4 hours
- **RPO:** 24 hours

### Backup Strategy

- Daily DB backups (7-day retention)
- Weekly Blob exports (4-week retention)
- Geo-redundant storage
- 14-day soft delete
- Annual DR drill

### Recovery Scenarios

1. Corrupt database → Restore from backup
2. Container failure → Redeploy from image
3. Infrastructure loss → Terraform re-apply
4. Region outage → Manual intervention (documented)

---

## Monitoring & Observability

### Infrastructure Monitoring

- Azure Monitor for all resources
- Alerts for CPU/RAM/storage
- Unhealthy backend detection
- Budget overrun alerts

### Application Monitoring

- Log Analytics (90d retention)
- Optional: Application Insights
- External uptime monitoring (StatusCake/UptimeRobot)

### Dashboards

- Azure Portal custom dashboard
- Key KPIs visible
- Custom Log Analytics queries

---

## Maintenance Procedures

### Daily
- Check alerts/logs
- Verify backups complete

### Weekly
- Review spend, uptime, incidents

### Monthly
- Patch Docker images
- Update Terraform
- Test core flows post-upgrade
- Verify backup exports

### Quarterly
- Rotate secrets
- Clean up old logs/users
- Update SSL certificates
- Run security scan

### Annually
- Full DR test
- Security audit
- Review performance/cost
- Refactor Terraform code

---

## Scaling Strategy

### Vertical Scaling

If DB CPU >80% or query response time >5s:
- Upgrade DB tier
- Increase container resources

### Horizontal Scaling

Needed only if >10 users:
- Multiple container instances
- Load balancing
- Session management

### Triggers

- Alerts for resource constraints
- Quarterly scaling review

---

## CI/CD Pipeline

### GitHub Actions Workflow

1. **PR:** `terraform plan` (comment on PR)
2. **Merge to main:** `terraform apply` (auto-approve)
3. **Rollback:** Git revert → auto-apply previous state
4. **Manual runs:** workflow_dispatch for DR/config changes

### Testing

- Static: `terraform validate`
- Functional: Manual smoke tests (Phase 1)
- Expand in Phase 2

### Notifications

- Email on failure
- Summary on success

---

## Troubleshooting Guide

### Common Issues

1. **Container down:** Check logs, Gateway health, DNS
2. **DB connection:** Verify DB up, NSG rules, connection string
3. **SSL issues:** Check Key Vault expiry, Gateway config
4. **Terraform lock:** Check Blob lease, break if needed
5. **Cost overrun:** Use Cost Management, kill unused resources
6. **Webhooks broken:** Check Function logs, re-register webhook

---

## Summary

This deployment guide provides a complete, production-ready infrastructure setup for House of Veritas on Azure, with automated provisioning, robust security, comprehensive monitoring, and clear operational procedures. The platform is designed to be cost-effective (<R1,000/month), secure, and maintainable with minimal manual intervention.
