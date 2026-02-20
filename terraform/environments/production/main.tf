# Main Terraform configuration for House of Veritas - Production Environment

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
  
  backend "azurerm" {
    # Backend configuration provided via backend-config during init
    # terraform init -backend-config="backend.hcl"
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy = false
      recover_soft_deleted_key_vaults = true
    }
    
    resource_group {
      prevent_deletion_if_contains_resources = true
    }
  }
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
  tags     = local.common_tags
}

# Network Module
module "network" {
  source = "../../modules/network"
  
  resource_group_name     = azurerm_resource_group.main.name
  location                = azurerm_resource_group.main.location
  environment             = var.environment
  vnet_name               = "${var.environment}-vnet"
  vnet_address_space      = var.vnet_address_space
  gateway_subnet_prefix   = var.gateway_subnet_prefix
  container_subnet_prefix = var.container_subnet_prefix
  database_subnet_prefix  = var.database_subnet_prefix
  
  tags = local.common_tags
}

# Storage Module
module "storage" {
  source = "../../modules/storage"
  
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  storage_account_name   = var.storage_account_name
  container_subnet_id    = module.network.container_subnet_id
  database_subnet_id     = module.network.database_subnet_id
  
  tags = local.common_tags
  
  depends_on = [module.network]
}

# Security Module (Key Vault)
module "security" {
  source = "../../modules/security"
  
  resource_group_name   = azurerm_resource_group.main.name
  location              = azurerm_resource_group.main.location
  key_vault_name        = var.key_vault_name
  container_subnet_id   = module.network.container_subnet_id
  db_admin_password     = var.db_admin_password
  docuseal_secret_key   = random_password.docuseal_secret.result
  baserow_secret_key    = random_password.baserow_secret.result
  smtp_password         = var.smtp_password
  
  tags = local.common_tags
  
  depends_on = [module.network]
}

# Database Module
module "database" {
  source = "../../modules/database"
  
  resource_group_name  = azurerm_resource_group.main.name
  location             = azurerm_resource_group.main.location
  server_name          = var.db_server_name
  admin_username       = var.db_admin_username
  admin_password       = var.db_admin_password
  database_subnet_id   = module.network.database_subnet_id
  vnet_id              = module.network.vnet_id
  
  tags = local.common_tags
  
  depends_on = [module.network, module.security]
}

# Compute Module (Container Instances)
module "compute" {
  source = "../../modules/compute"
  
  resource_group_name     = azurerm_resource_group.main.name
  location                = azurerm_resource_group.main.location
  environment             = var.environment
  container_subnet_id     = module.network.container_subnet_id
  storage_account_name    = module.storage.storage_account_name
  storage_account_key     = module.storage.storage_account_primary_connection_string
  key_vault_id            = module.security.key_vault_id
  domain_name             = var.domain_name
  docuseal_database_url   = module.database.connection_string_docuseal
  docuseal_secret_key     = random_password.docuseal_secret.result
  baserow_database_url    = module.database.connection_string_baserow
  baserow_secret_key      = random_password.baserow_secret.result
  smtp_host               = var.smtp_host
  smtp_port               = var.smtp_port
  smtp_username           = var.smtp_username
  smtp_password           = var.smtp_password
  
  tags = local.common_tags
  
  depends_on = [module.network, module.storage, module.database, module.security]
}

# Gateway Module (Application Gateway)
module "gateway" {
  source = "../../modules/gateway"
  
  resource_group_name       = azurerm_resource_group.main.name
  location                  = azurerm_resource_group.main.location
  environment               = var.environment
  gateway_subnet_id         = module.network.gateway_subnet_id
  domain_name               = var.domain_name
  docuseal_ip_address       = module.compute.docuseal_ip_address
  baserow_ip_address        = module.compute.baserow_ip_address
  ssl_certificate_data      = var.ssl_certificate_data
  ssl_certificate_password  = var.ssl_certificate_password
  
  tags = local.common_tags
  
  depends_on = [module.network, module.compute]
}

# Random passwords for application secrets
resource "random_password" "docuseal_secret" {
  length  = 64
  special = true
}

resource "random_password" "baserow_secret" {
  length  = 64
  special = true
}

# Local values
locals {
  common_tags = {
    Environment = var.environment
    Project     = "House of Veritas"
    ManagedBy   = "Terraform"
    Owner       = "Hans Jurgens Smit"
  }
}
