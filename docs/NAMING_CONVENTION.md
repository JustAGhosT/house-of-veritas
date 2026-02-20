# House of Veritas - Azure Resource Naming Convention

## Naming Pattern

```
nl-{env}-hov-{resourcetype}-{location}
```

### Components

| Component | Description | Values |
|-----------|-------------|--------|
| `nl` | Namespace/Prefix | Always `nl` |
| `{env}` | Environment | `prod`, `dev`, `staging` |
| `hov` | Project Code | House of Veritas |
| `{resourcetype}` | Resource type abbreviation | See below |
| `{location}` | Azure region short code | `san` (South Africa North) |

### Resource Type Abbreviations

| Resource | Abbreviation | Example |
|----------|--------------|---------|
| Resource Group | `rg` | `nl-prod-hov-rg-san` |
| Virtual Network | `vnet` | `nl-prod-hov-vnet-san` |
| Subnet | `snet` | `nl-prod-hov-snet-containers-san` |
| Network Security Group | `nsg` | `nl-prod-hov-nsg-san` |
| Storage Account | `st` | `nlprodhovstsan` (no hyphens) |
| Key Vault | `kv` | `nl-prod-hov-kv-san` |
| PostgreSQL Server | `pg` | `nl-prod-hov-pg-san` |
| Container Instance | `aci` | `nl-prod-hov-aci-docuseal-san` |
| Application Gateway | `agw` | `nl-prod-hov-agw-san` |
| Function App | `func` | `nl-prod-hov-func-san` |
| Container Registry | `cr` | `nlprodhovcr` (no hyphens) |
| Public IP | `pip` | `nl-prod-hov-pip-agw-san` |
| Log Analytics | `log` | `nl-prod-hov-log-san` |
| App Insights | `appi` | `nl-prod-hov-appi-san` |

### Special Cases

Some Azure resources don't allow hyphens in names:
- **Storage Accounts**: `nlprodhovstsan` (concatenated)
- **Container Registry**: `nlprodhovcr` (concatenated)

### Location Codes

| Azure Region | Short Code |
|--------------|------------|
| South Africa North | `san` |
| West Europe | `weu` |
| North Europe | `neu` |
| East US | `eus` |
| West US | `wus` |

## Resource Inventory

### Production Environment (`prod`)

| Resource | Name | Purpose |
|----------|------|---------|
| Resource Group | `nl-prod-hov-rg-san` | All production resources |
| Virtual Network | `nl-prod-hov-vnet-san` | Network isolation |
| PostgreSQL | `nl-prod-hov-pg-san` | Database server |
| Storage Account | `nlprodhovstsan` | Document/backup storage |
| Key Vault | `nl-prod-hov-kv-san` | Secrets management |
| App Gateway | `nl-prod-hov-agw-san` | Load balancer/WAF |
| DocuSeal Container | `nl-prod-hov-aci-docuseal-san` | Document signing |
| Baserow Container | `nl-prod-hov-aci-baserow-san` | Operations data |
| Function App | `nl-prod-hov-func-san` | Automation functions |

### Development Environment (`dev`)

| Resource | Name | Purpose |
|----------|------|---------|
| Resource Group | `nl-dev-hov-rg-san` | Development resources |
| Virtual Network | `nl-dev-hov-vnet-san` | Network isolation |
| PostgreSQL | `nl-dev-hov-pg-san` | Database server |
| Storage Account | `nldevhovstsan` | Document/backup storage |
| Key Vault | `nl-dev-hov-kv-san` | Secrets management |

## Tags

All resources should have these tags:

```hcl
tags = {
  Project     = "HouseOfVeritas"
  Environment = "Production"  # or Development, Staging
  ManagedBy   = "Terraform"
  Owner       = "Hans"
  CostCenter  = "Operations"
}
```

## Environment Variables

Update these in your configuration:

```bash
# .env or GitHub Secrets
AZURE_RESOURCE_GROUP=nl-prod-hov-rg-san
AZURE_KEY_VAULT_NAME=nl-prod-hov-kv-san
AZURE_STORAGE_ACCOUNT=nlprodhovstsan
AZURE_FUNCTION_APP=nl-prod-hov-func-san
AZURE_ENV=prod
AZURE_LOCATION=southafricanorth
```

## Terraform Usage

```hcl
# variables.tf
variable "environment" {
  default = "prod"
}

variable "location_short" {
  default = "san"
}

# locals.tf
locals {
  name_prefix = "nl-${var.environment}-hov"
  
  resource_group_name = "${local.name_prefix}-rg-${var.location_short}"
  vnet_name           = "${local.name_prefix}-vnet-${var.location_short}"
  keyvault_name       = "${local.name_prefix}-kv-${var.location_short}"
  postgres_name       = "${local.name_prefix}-pg-${var.location_short}"
  storage_name        = "nl${var.environment}hovst${var.location_short}"
}
```
