# Terraform Deployment Guide - House of Veritas

> Complete guide for deploying the House of Veritas infrastructure to Azure using Terraform

## Prerequisites

### Required Tools
- **Terraform:** >= 1.5.0 ([Download](https://www.terraform.io/downloads))
- **Azure CLI:** >= 2.50.0 ([Install](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli))
- **Git:** For version control
- **OpenSSL:** For certificate generation (optional)

### Azure Requirements
- Azure subscription (active)
- Contributor role on the subscription
- Ability to create service principals

### Domain Requirements
- Registered domain name (e.g., houseofveritas.za or .co.za)
- Access to DNS management

---

## Step 1: Azure Account Setup

### 1.1 Login to Azure

```bash
az login
az account list --output table
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### 1.2 Create Service Principal for Terraform

```bash
# Create service principal
az ad sp create-for-rbac \
  --name "sp-houseofveritas-terraform" \
  --role="Contributor" \
  --scopes="/subscriptions/YOUR_SUBSCRIPTION_ID" \
  --sdk-auth > azure-credentials.json

# View the credentials (keep these secure!)
cat azure-credentials.json
```

### 1.3 Create Terraform State Storage

```bash
# Variables
RESOURCE_GROUP="rg-houseofveritas-tfstate"
STORAGE_ACCOUNT="sthouseofveritastfstate"  # Must be globally unique
CONTAINER="tfstate"
LOCATION="southafricanorth"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create storage account
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS \
  --encryption-services blob

# Get storage account key
ACCOUNT_KEY=$(az storage account keys list \
  --resource-group $RESOURCE_GROUP \
  --account-name $STORAGE_ACCOUNT \
  --query '[0].value' -o tsv)

# Create container
az storage container create \
  --name $CONTAINER \
  --account-name $STORAGE_ACCOUNT \
  --account-key $ACCOUNT_KEY
```

---

## Step 2: GitHub Repository Setup

### 2.1 Create GitHub Repository

1. Go to GitHub and create a new private repository: `house-of-veritas`
2. Clone the repository locally
3. Copy the terraform code to the repository

### 2.2 Configure GitHub Secrets

Navigate to: **Settings → Secrets and variables → Actions → New repository secret**

Add the following secrets:

| Secret Name | Value | Source |
|-------------|-------|--------|
| `AZURE_CREDENTIALS` | Content of azure-credentials.json | Step 1.2 |
| `TF_STATE_RESOURCE_GROUP` | rg-houseofveritas-tfstate | Step 1.3 |
| `TF_STATE_STORAGE_ACCOUNT` | sthouseofveritastfstate | Step 1.3 |
| `TF_STATE_CONTAINER` | tfstate | Step 1.3 |
| `TF_STATE_KEY` | production.terraform.tfstate | Fixed |
| `DB_ADMIN_PASSWORD` | Generated secure password | See below |
| `SMTP_USERNAME` | your-email@gmail.com | Your SMTP |
| `SMTP_PASSWORD` | app-specific password | Gmail App Password |
| `SSL_CERTIFICATE_DATA` | Base64 encoded PFX | See Step 3 |
| `SSL_CERTIFICATE_PASSWORD` | Certificate password | See Step 3 |

**Generate secure database password:**
```bash
openssl rand -base64 32
```

---

## Step 3: SSL Certificate Setup

### Option A: Self-Signed Certificate (Testing Only)

```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 \
  -keyout key.pem -out cert.pem \
  -days 365 -nodes \
  -subj "/CN=*.houseofveritas.za"

# Create PFX from PEM files
openssl pkcs12 -export \
  -out certificate.pfx \
  -inkey key.pem \
  -in cert.pem \
  -passout pass:YourPassword123

# Base64 encode for GitHub secret
cat certificate.pfx | base64 -w 0
```

### Option B: Let's Encrypt Certificate (Production)

```bash
# Install Certbot
sudo apt-get install certbot

# Generate certificate (DNS challenge)
sudo certbot certonly \
  --manual \
  --preferred-challenges dns \
  -d '*.houseofveritas.za' \
  -d 'houseofveritas.za'

# Follow prompts to add DNS TXT records
# Certificates will be in: /etc/letsencrypt/live/houseofveritas.za/

# Convert to PFX
sudo openssl pkcs12 -export \
  -out certificate.pfx \
  -inkey /etc/letsencrypt/live/houseofveritas.za/privkey.pem \
  -in /etc/letsencrypt/live/houseofveritas.za/fullchain.pem \
  -passout pass:YourPassword123

# Base64 encode
sudo cat certificate.pfx | base64 -w 0
```

---

## Step 4: Local Terraform Configuration

### 4.1 Navigate to Production Environment

```bash
cd terraform/environments/production
```

### 4.2 Create terraform.tfvars

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your values:

```hcl
environment         = "production"
location            = "South Africa North"
resource_group_name = "rg-houseofveritas-prod"

# Storage (must be globally unique, lowercase, no hyphens)
storage_account_name = "sthouseofveritas"

# Key Vault (must be globally unique)
key_vault_name = "kv-houseofveritas"

# Database
db_server_name      = "pg-houseofveritas"
db_admin_username   = "hov_admin"
db_admin_password   = "YOUR_SECURE_PASSWORD"

# Domain
domain_name = "houseofveritas.za"

# SMTP
smtp_host     = "smtp.gmail.com"
smtp_port     = "587"
smtp_username = "your-email@gmail.com"
smtp_password = "your-app-password"

# SSL Certificate
ssl_certificate_data     = "BASE64_ENCODED_PFX"
ssl_certificate_password = "your-certificate-password"
```

**Important:** Add `terraform.tfvars` to `.gitignore` (already included)

---

## Step 5: Initial Deployment (Local)

### 5.1 Initialize Terraform

```bash
terraform init \
  -backend-config="backend.hcl"
```

### 5.2 Validate Configuration

```bash
terraform validate
terraform fmt -check -recursive
```

### 5.3 Plan Deployment

```bash
terraform plan -out=tfplan
```

Review the plan carefully:
- Expected resources: ~50-60 resources
- Estimated cost: R950/month
- Review security groups, network configuration

### 5.4 Apply Deployment

```bash
terraform apply tfplan
```

This will take **15-30 minutes** to complete.

### 5.5 Save Outputs

```bash
terraform output -json > outputs.json
terraform output application_gateway_public_ip
```

---

## Step 6: DNS Configuration

### 6.1 Get Application Gateway IP

```bash
APP_GATEWAY_IP=$(terraform output -raw application_gateway_public_ip)
echo $APP_GATEWAY_IP
```

### 6.2 Create DNS A Records

In your DNS provider (e.g., GoDaddy, Cloudflare), create:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | docs | YOUR_APP_GATEWAY_IP | 300 |
| A | ops | YOUR_APP_GATEWAY_IP | 300 |

### 6.3 Verify DNS Propagation

```bash
# Check DNS records
nslookup docs.houseofveritas.za
nslookup ops.houseofveritas.za

# Or use online tool: https://dnschecker.org
```

Wait 5-15 minutes for global propagation.

---

## Step 7: Verify Deployment

### 7.1 Check Azure Resources

```bash
# List all resources
az resource list \
  --resource-group rg-houseofveritas-prod \
  --output table

# Check container status
az container show \
  --resource-group rg-houseofveritas-prod \
  --name production-docuseal \
  --query instanceView.state

az container show \
  --resource-group rg-houseofveritas-prod \
  --name production-baserow \
  --query instanceView.state
```

### 7.2 Access Applications

**DocuSeal:** https://docs.houseofveritas.za  
**Baserow:** https://ops.houseofveritas.za

**Note:** It may take 5-10 minutes for containers to fully start.

### 7.3 Check Container Logs

```bash
# DocuSeal logs
az container logs \
  --resource-group rg-houseofveritas-prod \
  --name production-docuseal \
  --tail 50

# Baserow logs
az container logs \
  --resource-group rg-houseofveritas-prod \
  --name production-baserow \
  --tail 50
```

---

## Step 8: CI/CD via GitHub Actions

### 8.1 Enable GitHub Actions

1. Push code to `main` branch
2. GitHub Actions will automatically run `terraform-apply.yml`
3. Monitor workflow in: **Actions** tab

### 8.2 Make Changes via PR

1. Create feature branch: `git checkout -b feature/update-config`
2. Make Terraform changes
3. Push and create Pull Request
4. GitHub Actions runs `terraform-plan.yml`
5. Review plan in PR comments
6. Merge to `main` → Auto-apply

### 8.3 Manual Triggers

**Apply:**
- Go to **Actions → Terraform Apply → Run workflow**

**Destroy** (careful!):
- Go to **Actions → Terraform Destroy → Run workflow**
- Type `DESTROY` to confirm

---

## Step 9: Post-Deployment Configuration

### 9.1 DocuSeal Initial Setup

1. Navigate to https://docs.houseofveritas.za
2. Create admin account (Hans)
3. Configure SMTP settings (already set via environment)
4. Upload document templates
5. Create user accounts (Charl, Lucky, Irma)

### 9.2 Baserow Initial Setup

1. Navigate to https://ops.houseofveritas.za
2. Create admin account (Hans)
3. Create workspace: "House of Veritas Operations"
4. Import database schema (see Phase 3 in BACKLOG.md)
5. Configure views and permissions
6. Create user accounts

---

## Common Operations

### Check Infrastructure Cost

```bash
# Get cost estimate
az consumption usage list \
  --start-date $(date -d "30 days ago" +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d) \
  --query "[?contains(instanceName, 'houseofveritas')]" \
  --output table
```

### Update Secret

```bash
# Update Key Vault secret
az keyvault secret set \
  --vault-name kv-houseofveritas \
  --name smtp-password \
  --value "new-password"
```

### Restart Container

```bash
# Restart DocuSeal
az container restart \
  --resource-group rg-houseofveritas-prod \
  --name production-docuseal

# Restart Baserow
az container restart \
  --resource-group rg-houseofveritas-prod \
  --name production-baserow
```

### View Application Gateway Health

```bash
az network application-gateway show-backend-health \
  --resource-group rg-houseofveritas-prod \
  --name production-appgw
```

---

## Troubleshooting

### Container Not Starting

```bash
# Check container logs
az container logs --resource-group rg-houseofveritas-prod --name production-docuseal

# Common issues:
# 1. Database connection failed → Check connection string
# 2. Volume mount failed → Check storage account
# 3. Out of memory → Increase container memory
```

### Database Connection Issues

```bash
# Test database connectivity
az postgres flexible-server connect \
  --name pg-houseofveritas \
  --admin-user hov_admin \
  --admin-password "YOUR_PASSWORD" \
  --database-name docuseal_production
```

### SSL Certificate Issues

```bash
# Check certificate expiry
openssl x509 -in cert.pem -noout -dates

# Renew Let's Encrypt certificate
sudo certbot renew
```

### DNS Not Resolving

```bash
# Check Application Gateway public IP
az network public-ip show \
  --resource-group rg-houseofveritas-prod \
  --name production-gateway-pip \
  --query ipAddress

# Verify DNS records match
```

---

## Maintenance

### Daily
- Check Azure Monitor alerts
- Verify backups completed

### Weekly
- Review Azure costs
- Check container logs for errors

### Monthly
- Update container images
- Review security recommendations
- Test disaster recovery

### Quarterly
- Rotate secrets (DB password, API keys)
- Update SSL certificate
- Review access policies

---

## Disaster Recovery

### Backup State File

```bash
# Download current state
az storage blob download \
  --account-name sthouseofveritastfstate \
  --container-name tfstate \
  --name production.terraform.tfstate \
  --file tfstate-backup-$(date +%Y%m%d).json
```

### Restore from Backup

```bash
# Restore database from automated backup
az postgres flexible-server restore \
  --resource-group rg-houseofveritas-prod \
  --name pg-houseofveritas-restored \
  --source-server pg-houseofveritas \
  --restore-time "2025-01-23T10:00:00Z"
```

### Full Infrastructure Recovery

```bash
# If infrastructure is lost
cd terraform/environments/production
terraform init -backend-config="backend.hcl"
terraform apply
```

---

## Cleanup / Destroy

### Option 1: Via GitHub Actions

1. Go to **Actions → Terraform Destroy**
2. Click **Run workflow**
3. Type `DESTROY` to confirm

### Option 2: Local Command

```bash
cd terraform/environments/production
terraform destroy
```

**Warning:** This will delete ALL resources and data. Ensure backups exist!

---

## Cost Optimization Tips

1. **Use burstable tier for database** (already configured)
2. **Enable autoscaling** for Application Gateway (if traffic increases)
3. **Review blob storage tiers** monthly
4. **Set up budget alerts** in Azure
5. **Delete old backups** after 30 days

---

## Security Best Practices

1. **Never commit secrets** to Git
2. **Rotate passwords** quarterly
3. **Enable Azure AD authentication** (future phase)
4. **Review NSG rules** regularly
5. **Monitor Key Vault access logs**
6. **Enable MFA** for Azure portal access

---

## Support

For issues or questions:
- **Email:** admin@houseofveritas.za
- **Documentation:** `/docs` directory
- **Azure Support:** [Azure Portal](https://portal.azure.com)

---

## Next Steps

After successful deployment, proceed to:
- **Phase 3:** Core Platform setup (DocuSeal + Baserow configuration)
- **Phase 4:** Integration & Automation
- See `BACKLOG.md` for complete roadmap

---

**Last Updated:** January 2025  
**Document Version:** 1.0  
**Terraform Version:** 1.5.7  
**Azure Provider Version:** 3.80
