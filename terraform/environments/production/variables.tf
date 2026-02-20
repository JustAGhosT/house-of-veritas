variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "South Africa North"
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "rg-houseofveritas-prod"
}

# Network variables
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
  description = "Storage account name (must be globally unique)"
  type        = string
  default     = "sthouseofveritas"
}

# Security variables
variable "key_vault_name" {
  description = "Key Vault name (must be globally unique)"
  type        = string
  default     = "kv-houseofveritas"
}

# Database variables
variable "db_server_name" {
  description = "PostgreSQL server name"
  type        = string
  default     = "pg-houseofveritas"
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
  default     = "smtp.gmail.com"
}

variable "smtp_port" {
  description = "SMTP server port"
  type        = string
  default     = "587"
}

variable "smtp_username" {
  description = "SMTP username"
  type        = string
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
}

variable "ssl_certificate_password" {
  description = "SSL certificate password"
  type        = string
  sensitive   = true
  default     = ""
}
