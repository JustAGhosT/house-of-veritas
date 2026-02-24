# House of Veritas - CI/CD Workflows

This document describes the GitHub Actions workflows for continuous integration and deployment.

## Workflows Overview

| Workflow                   | Trigger                            | Purpose                     |
| -------------------------- | ---------------------------------- | --------------------------- |
| `deployment-checklist.yml` | PR, Push, Schedule (daily), Manual | Infrastructure verification |
| `deploy-on-merge.yml`      | Push to main (app changes)         | **Auto-deploy web app**     |
| `terraform-apply.yml`      | Push to main (terraform changes)   | Terraform apply (infra only when needed) |
| `deploy-functions.yml`     | Push to main (function code)       | Azure Functions deployment  |
| `terraform-plan.yml`       | PR to main (terraform changes)     | Terraform plan preview      |
| `deploy.yml`               | Manual, Release                    | Full deployment pipeline    |

---

## 1. Deployment Checklist Workflow

**File:** `.github/workflows/deployment-checklist.yml`

### Triggers

- **Pull Request**: Runs on every PR to `main`
- **Push**: Runs on every push to `main`
- **Schedule**: Daily at 6am UTC (catches infrastructure drift)
- **Manual**: Can be triggered via Actions tab

### Jobs

1. **deployment-checklist**: Runs the Python checklist script
2. **validate-config**: Validates configuration files (docker-compose, Python, shell scripts)
3. **build-test**: Builds Next.js app and runs tests
4. **summary**: Generates pipeline summary

### Features

- Comments PR with checklist results
- Creates GitHub Issue on infrastructure drift (scheduled runs)
- Fails PR if critical issues detected
- Uploads checklist report as artifact

### Manual Trigger Options

- `verbose`: Enable detailed output (default: true)

---

## 2. Deploy on Merge (Auto-Deploy)

**File:** `.github/workflows/deploy-on-merge.yml`

Runs automatically after a PR is merged to `main` when app code changes.

### Triggers

- **Push to main**: Only when paths under `app/`, `components/`, `lib/`, `hooks/`, `public/`, `styles/`, or config files (`next.config.mjs`, `package.json`, etc.) change.

### Jobs

1. **build**: Lint, test, build Next.js app
2. **deploy-webapp**: Deploy to Azure App Service, verify health

### Infra and Functions

- **Infrastructure**: Deployed only when `terraform/**` changes (see `terraform-apply.yml`)
- **Azure Functions**: Deployed only when `config/azure-functions/**` changes (see `deploy-functions.yml`)

---

## 3. Full Deployment Pipeline

**File:** `.github/workflows/deploy.yml`

### Triggers

- **Manual**: Via Actions tab with options
- **Release**: On published releases

### Jobs

1. **pre-deploy-validation**: Runs checklist before deployment
2. **build**: Builds Next.js application
3. **deploy-infrastructure**: Applies Terraform changes
4. **deploy-docuseal**: Verifies/restarts DocuSeal container
5. **deploy-baserow**: Verifies/restarts Baserow container
6. **seed-data**: Seeds initial data (optional)
7. **post-deploy-verification**: Final checklist
8. **deployment-summary**: Generates deployment report

### Manual Trigger Options

| Option                  | Description                    | Default      |
| ----------------------- | ------------------------------ | ------------ |
| `environment`           | Target environment             | `production` |
| `skip_checklist`        | Skip pre-deployment validation | `false`      |
| `deploy_infrastructure` | Deploy Terraform changes       | `true`       |
| `seed_data`             | Run data seeding script        | `false`      |

---

## 4. Azure Functions Deployment

**File:** `.github/workflows/deploy-functions.yml`

### Triggers

- **Push**: When Azure Function scripts change
- **Manual**: Via Actions tab

### Deployed Functions

| Function            | Type          | Schedule      |
| ------------------- | ------------- | ------------- |
| DocuSealWebhook     | HTTP Trigger  | On demand     |
| DocumentExpiryAlert | Timer Trigger | Daily 6am UTC |

---

## Required GitHub Secrets

Add these secrets in **Settings → Secrets and variables → Actions**:

### Azure Authentication

```text
AZURE_CREDENTIALS          # Service principal JSON (includes subscriptionId)
```

### Terraform State

```text
TF_STATE_RESOURCE_GROUP    # Resource group for state storage
TF_STATE_STORAGE_ACCOUNT   # Storage account name
TF_STATE_CONTAINER         # Container name (e.g., "tfstate")
TF_STATE_KEY               # State file key (e.g., "houseofveritas.tfstate")
```

### Application Secrets

```text
DB_ADMIN_PASSWORD          # PostgreSQL admin password
SMTP_USERNAME              # SMTP username (e.g., "apikey" for SendGrid)
SMTP_PASSWORD              # SMTP password/API key
SSL_CERTIFICATE_DATA       # Base64-encoded SSL certificate
SSL_CERTIFICATE_PASSWORD   # SSL certificate password
```

### Service URLs

```text
DOCUSEAL_URL               # DocuSeal base URL
BASEROW_URL                # Baserow base URL
BASEROW_TOKEN              # Baserow API token
```

### Azure Functions

```text
AZURE_FUNCTIONAPP_PUBLISH_PROFILE  # Function app publish profile
DOCUSEAL_WEBHOOK_SECRET            # Webhook signature secret
SENDGRID_API_KEY                   # SendGrid API key
ADMIN_EMAIL                        # Admin email for alerts
```

---

## Setting Up Azure Credentials

### 1. Create Service Principal

```bash
az ad sp create-for-rbac \
  --name "github-actions-houseofveritas" \
  --role contributor \
  --scopes /subscriptions/{subscription-id} \
  --sdk-auth
```

### 2. Copy Output to GitHub Secret

The output JSON goes into `AZURE_CREDENTIALS`:

```json
{
  "clientId": "xxx",
  "clientSecret": "xxx",
  "subscriptionId": "xxx",
  "tenantId": "xxx",
  ...
}
```

---

## Workflow Status Badges

Add these to your README.md:

```markdown
[![Deployment Checklist](https://github.com/{owner}/{repo}/actions/workflows/deployment-checklist.yml/badge.svg)](https://github.com/{owner}/{repo}/actions/workflows/deployment-checklist.yml)

[![Deploy on Merge](https://github.com/{owner}/{repo}/actions/workflows/deploy-on-merge.yml/badge.svg)](https://github.com/{owner}/{repo}/actions/workflows/deploy-on-merge.yml)

[![Terraform Plan](https://github.com/{owner}/{repo}/actions/workflows/terraform-plan.yml/badge.svg)](https://github.com/{owner}/{repo}/actions/workflows/terraform-plan.yml)

[![Deploy](https://github.com/{owner}/{repo}/actions/workflows/deploy.yml/badge.svg)](https://github.com/{owner}/{repo}/actions/workflows/deploy.yml)
```

---

## Running Workflows Manually

### Via GitHub UI

1. Go to **Actions** tab
2. Select the workflow
3. Click **Run workflow**
4. Select branch and options
5. Click **Run workflow**

### Via GitHub CLI

```bash
# Run deployment checklist
gh workflow run deployment-checklist.yml

# Run full deployment
gh workflow run deploy.yml -f environment=production -f seed_data=true

# Run Azure Functions deployment
gh workflow run deploy-functions.yml -f function=all
```

---

## Troubleshooting

### Workflow Fails: "Resource group does not exist"

- Infrastructure not deployed yet
- Run `terraform apply` first or use the deploy workflow

### Workflow Fails: "Permission denied"

- Check `AZURE_CREDENTIALS` secret is correct
- Verify service principal has required permissions

### Checklist Shows All Failed

- Azure CLI not authenticated (check `AZURE_CREDENTIALS`)
- Running in environment without Azure access
- This is expected in the preview environment

### Functions Not Deploying

- Function App doesn't exist yet
- Deploy infrastructure first via Terraform

---

## Best Practices

1. **Always run checklist before deployment**
   - Catches configuration issues early
   - Prevents failed deployments

2. **Use environments for approvals**
   - Configure environment protection rules
   - Require approval for production deployments

3. **Monitor scheduled checklist**
   - Review daily infrastructure drift reports
   - Address issues before they become critical

4. **Keep secrets updated**
   - Rotate credentials periodically
   - Update secrets when infrastructure changes

---

## Related Documentation

- [Deployment Checklist Script](/config/scripts/deployment-checklist.py)
- [Deployment Guide](/docs/03-deployment/01-deployment-guide.md)
- [Technical Design](/docs/02-architecture/01-technical-design.md)
- [Infrastructure](/docs/02-architecture/03-infrastructure.md)
