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

- Azure subscription (active with billing enabled)
- Azure CLI >= 2.50.0 installed
- Terraform >= 1.5.0 installed
- GitHub account with repository access
- Domain name (e.g., houseofveritas.za)
- SSH key pair (for secure access)

---

## Step 1: Create Service Principal for Terraform

### Bash (Linux/macOS)

```bash
# Login to Azure
az login

# List available subscriptions
az account list --output table

# Set your subscription
SUBSCRIPTION_ID="your-subscription-id-here"
az account set --subscription "$SUBSCRIPTION_ID"

# Create Service Principal with Contributor role
az ad sp create-for-rbac \
  --name "sp-houseofveritas-terraform" \
  --role "Contributor" \
  --scopes "/subscriptions/$SUBSCRIPTION_ID" \
  --sdk-auth > azure-credentials.json

# View credentials (KEEP THESE SECURE!)
cat azure-credentials.json

# Extract individual values for GitHub Secrets
jq -r '.clientId' azure-credentials.json       # ARM_CLIENT_ID
jq -r '.clientSecret' azure-credentials.json   # ARM_CLIENT_SECRET
jq -r '.tenantId' azure-credentials.json       # ARM_TENANT_ID
jq -r '.subscriptionId' azure-credentials.json # ARM_SUBSCRIPTION_ID
```

### PowerShell (Windows)

```powershell
# Login to Azure
az login

# List available subscriptions
az account list --output table

# Set your subscription
$SUBSCRIPTION_ID = "your-subscription-id-here"
az account set --subscription $SUBSCRIPTION_ID

# Create Service Principal with Contributor role
az ad sp create-for-rbac `
  --name "sp-houseofveritas-terraform" `
  --role "Contributor" `
  --scopes "/subscriptions/$SUBSCRIPTION_ID" `
  --sdk-auth | Out-File -FilePath azure-credentials.json

# View credentials (KEEP THESE SECURE!)
Get-Content azure-credentials.json

# Extract individual values for GitHub Secrets (requires PowerShell 7+)
$creds = Get-Content azure-credentials.json | ConvertFrom-Json
Write-Host "ARM_CLIENT_ID: $($creds.clientId)"
Write-Host "ARM_CLIENT_SECRET: $($creds.clientSecret)"
Write-Host "ARM_TENANT_ID: $($creds.tenantId)"
Write-Host "ARM_SUBSCRIPTION_ID: $($creds.subscriptionId)"
```

---

## Step 2: Set Up GitHub Repository with Secrets

### Create Repository

```bash
# Clone or initialize repository
git clone https://github.com/your-org/house-of-veritas.git
cd house-of-veritas

# Or create new
gh repo create house-of-veritas --private --clone
```

### Configure GitHub Secrets

Navigate to: **Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `AZURE_CREDENTIALS` | `$(cat azure-credentials.json)` | Full JSON from Step 1 |
| `ARM_CLIENT_ID` | From azure-credentials.json | Service Principal App ID |
| `ARM_CLIENT_SECRET` | From azure-credentials.json | Service Principal Password |
| `ARM_TENANT_ID` | From azure-credentials.json | Azure AD Tenant ID |
| `ARM_SUBSCRIPTION_ID` | From azure-credentials.json | Azure Subscription ID |
| `TF_STATE_RESOURCE_GROUP` | `rg-houseofveritas-tfstate` | State storage RG |
| `TF_STATE_STORAGE_ACCOUNT` | `sthoveritastfstate` | State storage account |
| `TF_STATE_CONTAINER` | `tfstate` | State container name |
| `DB_ADMIN_PASSWORD` | Generated secure password | Database admin password |
| `SMTP_USERNAME` | `your-email@gmail.com` | SMTP email for notifications |
| `SMTP_PASSWORD` | Gmail App Password | SMTP authentication |

#### Generate Secure Database Password

**Bash:**
```bash
openssl rand -base64 32
# Example output: K8x9mNp2qR4sT6uV8wX0yZ2aB4cD6eF8
```

**PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
# Or using .NET
Add-Type -AssemblyName System.Web
[System.Web.Security.Membership]::GeneratePassword(32, 8)
```

---

## Step 3: Configure Terraform Backend (Azure Blob Storage)

### Bash (Linux/macOS)

```bash
# Set variables
RESOURCE_GROUP="rg-houseofveritas-tfstate"
STORAGE_ACCOUNT="sthoveritastfstate"  # Must be globally unique, lowercase, 3-24 chars
CONTAINER="tfstate"
LOCATION="southafricanorth"

# Create resource group for Terraform state
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --tags "Purpose=TerraformState" "Project=HouseOfVeritas"

# Create storage account (Standard_LRS for cost efficiency)
az storage account create \
  --name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku Standard_LRS \
  --kind StorageV2 \
  --encryption-services blob \
  --min-tls-version TLS1_2 \
  --allow-blob-public-access false

# Get storage account key
ACCOUNT_KEY=$(az storage account keys list \
  --resource-group "$RESOURCE_GROUP" \
  --account-name "$STORAGE_ACCOUNT" \
  --query '[0].value' -o tsv)

# Create container for state files
az storage container create \
  --name "$CONTAINER" \
  --account-name "$STORAGE_ACCOUNT" \
  --account-key "$ACCOUNT_KEY" \
  --public-access off

# Enable versioning for state file recovery
az storage account blob-service-properties update \
  --account-name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --enable-versioning true

# Verify creation
echo "Storage Account: $STORAGE_ACCOUNT"
echo "Container: $CONTAINER"
echo "Account Key: $ACCOUNT_KEY"
```

### PowerShell (Windows)

```powershell
# Set variables
$RESOURCE_GROUP = "rg-houseofveritas-tfstate"
$STORAGE_ACCOUNT = "sthoveritastfstate"  # Must be globally unique
$CONTAINER = "tfstate"
$LOCATION = "southafricanorth"

# Create resource group
az group create `
  --name $RESOURCE_GROUP `
  --location $LOCATION `
  --tags "Purpose=TerraformState" "Project=HouseOfVeritas"

# Create storage account
az storage account create `
  --name $STORAGE_ACCOUNT `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION `
  --sku Standard_LRS `
  --kind StorageV2 `
  --encryption-services blob `
  --min-tls-version TLS1_2 `
  --allow-blob-public-access false

# Get storage account key
$ACCOUNT_KEY = az storage account keys list `
  --resource-group $RESOURCE_GROUP `
  --account-name $STORAGE_ACCOUNT `
  --query '[0].value' -o tsv

# Create container
az storage container create `
  --name $CONTAINER `
  --account-name $STORAGE_ACCOUNT `
  --account-key $ACCOUNT_KEY `
  --public-access off

# Enable versioning
az storage account blob-service-properties update `
  --account-name $STORAGE_ACCOUNT `
  --resource-group $RESOURCE_GROUP `
  --enable-versioning true

# Output results
Write-Host "Storage Account: $STORAGE_ACCOUNT"
Write-Host "Container: $CONTAINER"
Write-Host "Account Key: $ACCOUNT_KEY"
```

### Create Backend Configuration File

Create `terraform/environments/production/backend.hcl`:

```hcl
resource_group_name  = "rg-houseofveritas-tfstate"
storage_account_name = "sthoveritastfstate"
container_name       = "tfstate"
key                  = "production.terraform.tfstate"
```

---

## Step 4: Run Terraform Deployment

### Bash (Linux/macOS)

```bash
# Navigate to Terraform directory
cd terraform/environments/production

# Set environment variables for authentication
export ARM_CLIENT_ID="your-client-id"
export ARM_CLIENT_SECRET="your-client-secret"
export ARM_TENANT_ID="your-tenant-id"
export ARM_SUBSCRIPTION_ID="your-subscription-id"

# Initialize Terraform with backend configuration
terraform init \
  -backend-config="backend.hcl" \
  -upgrade

# Format check (ensure consistent style)
terraform fmt -check -recursive

# Validate configuration syntax
terraform validate

# Create execution plan
terraform plan \
  -var-file="terraform.tfvars" \
  -out=tfplan

# Review the plan output carefully!
# Expected: ~50-60 resources, estimated cost ~R950/month

# Apply the plan (this takes 15-30 minutes)
terraform apply tfplan

# Save outputs for reference
terraform output -json > deployment-outputs.json

# Get specific outputs
terraform output application_gateway_public_ip
terraform output docuseal_fqdn
terraform output baserow_fqdn
```

### PowerShell (Windows)

```powershell
# Navigate to Terraform directory
Set-Location terraform\environments\production

# Set environment variables for authentication
$env:ARM_CLIENT_ID = "your-client-id"
$env:ARM_CLIENT_SECRET = "your-client-secret"
$env:ARM_TENANT_ID = "your-tenant-id"
$env:ARM_SUBSCRIPTION_ID = "your-subscription-id"

# Initialize Terraform with backend configuration
terraform init `
  -backend-config="backend.hcl" `
  -upgrade

# Format check
terraform fmt -check -recursive

# Validate configuration
terraform validate

# Create execution plan
terraform plan `
  -var-file="terraform.tfvars" `
  -out=tfplan

# Review the plan output carefully!

# Apply the plan (15-30 minutes)
terraform apply tfplan

# Save outputs
terraform output -json | Out-File deployment-outputs.json

# Get specific outputs
terraform output application_gateway_public_ip
terraform output docuseal_fqdn
terraform output baserow_fqdn
```

---

## Step 5: Configure DNS to Point to Application Gateway

### Get Application Gateway Public IP

**Bash:**
```bash
# Get IP from Terraform output
APP_GATEWAY_IP=$(terraform output -raw application_gateway_public_ip)
echo "Application Gateway IP: $APP_GATEWAY_IP"

# Or query Azure directly
az network public-ip show \
  --resource-group rg-houseofveritas-prod \
  --name production-gateway-pip \
  --query ipAddress -o tsv
```

**PowerShell:**
```powershell
# Get IP from Terraform output
$APP_GATEWAY_IP = terraform output -raw application_gateway_public_ip
Write-Host "Application Gateway IP: $APP_GATEWAY_IP"

# Or query Azure directly
az network public-ip show `
  --resource-group rg-houseofveritas-prod `
  --name production-gateway-pip `
  --query ipAddress -o tsv
```

### Create DNS Records

In your DNS provider (GoDaddy, Cloudflare, etc.), create these A records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | docs | `<APP_GATEWAY_IP>` | 300 |
| A | ops | `<APP_GATEWAY_IP>` | 300 |
| A | @ | `<APP_GATEWAY_IP>` | 300 |

### Verify DNS Propagation

**Bash:**
```bash
# Check DNS resolution
nslookup docs.houseofveritas.za
nslookup ops.houseofveritas.za

# Using dig (more detailed)
dig docs.houseofveritas.za +short
dig ops.houseofveritas.za +short

# Check global propagation
# Visit: https://dnschecker.org/#A/docs.houseofveritas.za
```

**PowerShell:**
```powershell
# Check DNS resolution
Resolve-DnsName docs.houseofveritas.za
Resolve-DnsName ops.houseofveritas.za

# Or using nslookup
nslookup docs.houseofveritas.za
nslookup ops.houseofveritas.za
```

---

## Step 6: Generate SSL Certificates (Let's Encrypt)

### Option A: Certbot on Linux/macOS

```bash
# Install Certbot
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install -y certbot

# macOS (Homebrew)
brew install certbot

# Generate wildcard certificate (DNS challenge)
sudo certbot certonly \
  --manual \
  --preferred-challenges dns \
  -d '*.houseofveritas.za' \
  -d 'houseofveritas.za' \
  --email admin@houseofveritas.za \
  --agree-tos

# Follow prompts to add DNS TXT records:
# _acme-challenge.houseofveritas.za → <provided-value>

# Wait for DNS propagation (check with)
nslookup -type=TXT _acme-challenge.houseofveritas.za

# Certificates saved to:
# /etc/letsencrypt/live/houseofveritas.za/fullchain.pem
# /etc/letsencrypt/live/houseofveritas.za/privkey.pem

# Convert to PFX for Azure
CERT_PASSWORD="YourSecurePassword123!"
sudo openssl pkcs12 -export \
  -out certificate.pfx \
  -inkey /etc/letsencrypt/live/houseofveritas.za/privkey.pem \
  -in /etc/letsencrypt/live/houseofveritas.za/fullchain.pem \
  -passout pass:$CERT_PASSWORD

# Base64 encode for Azure Key Vault / GitHub Secret
base64 -w 0 certificate.pfx > certificate-base64.txt
cat certificate-base64.txt
```

### Option B: Windows (win-acme)

```powershell
# Download win-acme from https://www.win-acme.com/
# Extract to C:\win-acme

# Run interactive wizard
cd C:\win-acme
.\wacs.exe

# Select options:
# 1. Create certificate (manually)
# 2. Manual input - *.houseofveritas.za, houseofveritas.za
# 3. DNS validation (manual)
# 4. Follow prompts to add TXT records

# Or use command line
.\wacs.exe --target manual --host "*.houseofveritas.za,houseofveritas.za" `
  --validation dns-manual `
  --store pfxfile --pfxfilepath C:\certs\houseofveritas.pfx `
  --pfxpassword "YourSecurePassword123!"

# Base64 encode for GitHub Secret
$pfxBytes = [System.IO.File]::ReadAllBytes("C:\certs\houseofveritas.pfx")
$base64 = [Convert]::ToBase64String($pfxBytes)
$base64 | Out-File certificate-base64.txt
```

### Upload Certificate to Azure Key Vault

**Bash:**
```bash
# Upload PFX to Key Vault
az keyvault certificate import \
  --vault-name "kv-houseofveritas" \
  --name "ssl-wildcard" \
  --file certificate.pfx \
  --password "$CERT_PASSWORD"

# Verify upload
az keyvault certificate show \
  --vault-name "kv-houseofveritas" \
  --name "ssl-wildcard"
```

**PowerShell:**
```powershell
# Upload PFX to Key Vault
az keyvault certificate import `
  --vault-name "kv-houseofveritas" `
  --name "ssl-wildcard" `
  --file certificate.pfx `
  --password $CERT_PASSWORD

# Verify upload
az keyvault certificate show `
  --vault-name "kv-houseofveritas" `
  --name "ssl-wildcard"
```

---

## Step 7: Set Up Applications

### 7.1 Create Admin Accounts

**DocuSeal** (https://docs.houseofveritas.za):
```bash
# Access via browser and create first admin account
# Email: hans@houseofveritas.za
# Follow on-screen setup wizard
```

**Baserow** (https://ops.houseofveritas.za):
```bash
# Access via browser and create first admin account
# Email: hans@houseofveritas.za
# Create workspace: "House of Veritas Operations"
```

### 7.2 Configure SMTP

**DocuSeal** - Already configured via environment variables in Terraform.

Verify in DocuSeal admin panel:
- Settings → Email Configuration
- Test email delivery

**Baserow** - Configure in admin settings:
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP Username: your-email@gmail.com
SMTP Password: (App Password from Google)
Use TLS: Yes
```

### 7.3 Upload Document Templates

**Bash (using DocuSeal API):**
```bash
# Get API token from DocuSeal admin panel
DOCUSEAL_API_KEY="your-api-key"
DOCUSEAL_URL="https://docs.houseofveritas.za"

# Upload employment contract template
curl -X POST "$DOCUSEAL_URL/api/templates" \
  -H "X-Auth-Token: $DOCUSEAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Employment Contract - Standard",
    "folder_name": "Employment",
    "document_urls": ["https://storage.url/employment-contract.pdf"]
  }'

# List all templates
curl -X GET "$DOCUSEAL_URL/api/templates" \
  -H "X-Auth-Token: $DOCUSEAL_API_KEY"
```

**PowerShell:**
```powershell
$DOCUSEAL_API_KEY = "your-api-key"
$DOCUSEAL_URL = "https://docs.houseofveritas.za"

# Upload template
$headers = @{
  "X-Auth-Token" = $DOCUSEAL_API_KEY
  "Content-Type" = "application/json"
}
$body = @{
  name = "Employment Contract - Standard"
  folder_name = "Employment"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$DOCUSEAL_URL/api/templates" `
  -Method Post -Headers $headers -Body $body
```

### 7.4 Seed Baserow Data

**Bash:**
```bash
BASEROW_API_KEY="your-api-key"
BASEROW_URL="https://ops.houseofveritas.za"

# Create Employees table data
curl -X POST "$BASEROW_URL/api/database/rows/table/1/?user_field_names=true" \
  -H "Authorization: Token $BASEROW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "Name": "Hans Smit",
      "Role": "Owner/Administrator",
      "Email": "hans@houseofveritas.za",
      "Status": "Active"
    },
    {
      "Name": "Charl",
      "Role": "Workshop Operator",
      "Email": "charl@houseofveritas.za",
      "Status": "Active"
    }
  ]'
```

### 7.5 Configure Webhooks and Automation

**DocuSeal Webhook Setup:**
```bash
# Register webhook for document completion
curl -X POST "$DOCUSEAL_URL/api/webhooks" \
  -H "X-Auth-Token: $DOCUSEAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-function-app.azurewebsites.net/api/docuseal-webhook",
    "events": ["submission.completed", "submission.expired"]
  }'
```

**Azure Function for webhook processing:**
```bash
# Deploy webhook processor
cd config/azure-functions
func azure functionapp publish hov-functions-prod
```

---

## Step 8: Onboard Users and Go Live

### Create User Accounts

| User | Email | Role | Access Level |
|------|-------|------|--------------|
| Hans | hans@houseofveritas.za | Administrator | Full access |
| Charl | charl@houseofveritas.za | Workshop Operator | Tasks, Assets, Time |
| Lucky | lucky@houseofveritas.za | Gardener | Tasks, Expenses, Vehicles |
| Irma | irma@houseofveritas.za | Household | Tasks, Documents |

### Conduct Training Session

1. Login procedure demonstration
2. Document signing walkthrough
3. Task management training
4. Time tracking (clock in/out)
5. Expense submission
6. Mobile access setup

### Go-Live Checklist

```bash
# Verify all services are running
az container show --resource-group rg-houseofveritas-prod --name production-docuseal --query instanceView.state
az container show --resource-group rg-houseofveritas-prod --name production-baserow --query instanceView.state

# Check Application Gateway health
az network application-gateway show-backend-health \
  --resource-group rg-houseofveritas-prod \
  --name production-appgw

# Verify SSL certificates
curl -vI https://docs.houseofveritas.za 2>&1 | grep "SSL certificate"
curl -vI https://ops.houseofveritas.za 2>&1 | grep "SSL certificate"

# Test email delivery
# (Send test email from DocuSeal admin panel)

# Verify database connectivity
az postgres flexible-server show \
  --resource-group rg-houseofveritas-prod \
  --name pg-houseofveritas \
  --query state
```

---

## Troubleshooting

### Container Issues

```bash
# View container logs
az container logs --resource-group rg-houseofveritas-prod --name production-docuseal --tail 100
az container logs --resource-group rg-houseofveritas-prod --name production-baserow --tail 100

# Restart containers
az container restart --resource-group rg-houseofveritas-prod --name production-docuseal
az container restart --resource-group rg-houseofveritas-prod --name production-baserow

# Check container events
az container show --resource-group rg-houseofveritas-prod --name production-docuseal --query "containers[0].instanceView.events"
```

### Terraform State Lock

```bash
# Check for existing lock
az storage blob show \
  --account-name sthoveritastfstate \
  --container-name tfstate \
  --name production.terraform.tfstate \
  --query "properties.lease.state"

# Break lock if stuck (use with caution!)
az storage blob lease break \
  --account-name sthoveritastfstate \
  --container-name tfstate \
  --blob-name production.terraform.tfstate
```

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

## Summary

This deployment guide provides complete, production-ready infrastructure setup for House of Veritas on Azure, with automated provisioning, robust security, comprehensive monitoring, and clear operational procedures. The platform is designed to be cost-effective (<R1,000/month), secure, and maintainable with minimal manual intervention.

---

**Last Updated:** February 2026  
**Document Version:** 2.0  
**Terraform Version:** 1.5.7  
**Azure Provider Version:** 3.80
