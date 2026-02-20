variable "environment" {
  description = "Environment name (prod, dev, staging)"
  type        = string
  default     = "prod"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "South Africa North"
}

variable "location_short" {
  description = "Short location code for naming"
  type        = string
  default     = "san"
}

variable "project_prefix" {
  description = "Project naming prefix"
  type        = string
  default     = "nl"
}

variable "project_name" {
  description = "Project short name"
  type        = string
  default     = "hov"
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "nl-prod-hov-rg-san"
}

# Network variables
variable "vnet_name" {
  description = "Virtual network name"
  type        = string
  default     = "nl-prod-hov-vnet-san"
}

variable "vnet_address_space" {
  description = "Address space for VNet"
  type        = string
  default     = "10.0.0.0/16"
}

variable "gateway_subnet_prefix" {
  description = "Gateway subnet prefix"
  type        = string
  default     = "10.0.1.0/24"
}

variable "container_subnet_prefix" {
  description = "Container subnet prefix"
  type        = string
  default     = "10.0.2.0/24"
}

variable "database_subnet_prefix" {
  description = "Database subnet prefix"
  type        = string
  default     = "10.0.3.0/24"
}

# Storage variables
variable "storage_account_name" {
  description = "Storage account name (must be globally unique, no hyphens)"
  type        = string
  default     = "nlprodhovstsan"
}

# Security variables
variable "key_vault_name" {
  description = "Key Vault name (must be globally unique)"
  type        = string
  default     = "nl-prod-hov-kv-san"
}

# Database variables
variable "db_server_name" {
  description = "PostgreSQL server name"
  type        = string
  default     = "nl-prod-hov-pg-san"
}

variable "db_admin_username" {
  description = "Database admin username"
  type        = string
  default     = "hov_admin"
}

variable "db_admin_password" {
  description = "Database admin password"
  type        = string
  sensitive   = true
}

# Container variables
variable "docuseal_container_name" {
  description = "DocuSeal container instance name"
  type        = string
  default     = "nl-prod-hov-aci-docuseal-san"
}

variable "baserow_container_name" {
  description = "Baserow container instance name"
  type        = string
  default     = "nl-prod-hov-aci-baserow-san"
}

# Gateway variables
variable "app_gateway_name" {
  description = "Application Gateway name"
  type        = string
  default     = "nl-prod-hov-agw-san"
}

# Function App variables
variable "function_app_name" {
  description = "Azure Function App name"
  type        = string
  default     = "nl-prod-hov-func-san"
}

# Domain variables
variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "houseofveritas.za"
}

# SMTP variables
variable "smtp_host" {
  description = "SMTP server host"
  type        = string
  default     = "smtp.sendgrid.net"
}

variable "smtp_port" {
  description = "SMTP server port"
  type        = string
  default     = "587"
}

variable "smtp_username" {
  description = "SMTP username"
  type        = string
  default     = "apikey"
}

variable "smtp_password" {
  description = "SMTP password"
  type        = string
  sensitive   = true
}

# SSL Certificate variables
variable "ssl_certificate_data" {
  description = "SSL certificate data (base64 encoded PFX)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "ssl_certificate_password" {
  description = "SSL certificate password"
  type        = string
  sensitive   = true
  default     = ""
}

# Tags
variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "HouseOfVeritas"
    Environment = "Production"
    ManagedBy   = "Terraform"
    Owner       = "Hans"
  }
}
