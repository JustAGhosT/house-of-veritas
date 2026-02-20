# House of Veritas - GitHub Secrets Template
#
# This file lists all required GitHub secrets for CI/CD workflows.
# Add these in: Settings → Secrets and variables → Actions → New repository secret
#
# ⚠️ DO NOT commit actual values to version control!
#

# ============================================
# AZURE AUTHENTICATION
# ============================================

# Service Principal credentials (JSON format)
# Generate with: az ad sp create-for-rbac --name "github-actions" --role contributor --scopes /subscriptions/{id} --sdk-auth
AZURE_CREDENTIALS='{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}'

# Azure Subscription ID
AZURE_SUBSCRIPTION_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# ============================================
# TERRAFORM STATE STORAGE
# ============================================

# Resource group containing the state storage account
TF_STATE_RESOURCE_GROUP=rg-terraform-state

# Storage account name for Terraform state
TF_STATE_STORAGE_ACCOUNT=stterraformstate

# Container name within the storage account
TF_STATE_CONTAINER=tfstate

# State file key/name
TF_STATE_KEY=houseofveritas.tfstate

# ============================================
# DATABASE CREDENTIALS
# ============================================

# PostgreSQL admin password (min 8 chars, complex)
DB_ADMIN_PASSWORD=YourStrongPassword123!

# ============================================
# EMAIL/SMTP CONFIGURATION
# ============================================

# SendGrid API key username (always "apikey" for SendGrid)
SMTP_USERNAME=apikey

# SendGrid API key or SMTP password
SMTP_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Admin email for alerts
ADMIN_EMAIL=hans@houseofveritas.za

# ============================================
# SSL CERTIFICATES
# ============================================

# Base64-encoded PFX certificate
# Generate with: base64 -w 0 certificate.pfx
SSL_CERTIFICATE_DATA=base64encodedcertificatedata

# Certificate password (if applicable)
SSL_CERTIFICATE_PASSWORD=certificatepassword

# ============================================
# APPLICATION URLS
# ============================================

# DocuSeal instance URL
DOCUSEAL_URL=https://docs.houseofveritas.za

# Baserow instance URL
BASEROW_URL=https://ops.houseofveritas.za

# ============================================
# API TOKENS
# ============================================

# Baserow API token (generate in Baserow settings)
BASEROW_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# DocuSeal webhook secret (for signature verification)
DOCUSEAL_WEBHOOK_SECRET=your-webhook-secret-here

# SendGrid API key (for Azure Functions)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# AZURE FUNCTIONS
# ============================================

# Function App publish profile
# Download from: Azure Portal → Function App → Get publish profile
AZURE_FUNCTIONAPP_PUBLISH_PROFILE='<publishData>...</publishData>'

# ============================================
# OPTIONAL: TWILIO (SMS ALERTS)
# ============================================

# Twilio Account SID
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Twilio Auth Token
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Twilio Phone Number
TWILIO_PHONE_NUMBER=+1234567890
