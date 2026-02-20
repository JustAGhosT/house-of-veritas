variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "container_subnet_id" {
  description = "ID of the container subnet"
  type        = string
}

variable "storage_account_name" {
  description = "Name of the storage account"
  type        = string
}

variable "storage_account_key" {
  description = "Storage account access key"
  type        = string
  sensitive   = true
}

variable "key_vault_id" {
  description = "ID of the Key Vault"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
}

# DocuSeal variables
variable "docuseal_database_url" {
  description = "Database connection string for DocuSeal"
  type        = string
  sensitive   = true
}

variable "docuseal_secret_key" {
  description = "Secret key for DocuSeal"
  type        = string
  sensitive   = true
}

# Baserow variables
variable "baserow_database_url" {
  description = "Database connection string for Baserow"
  type        = string
  sensitive   = true
}

variable "baserow_secret_key" {
  description = "Secret key for Baserow"
  type        = string
  sensitive   = true
}

# SMTP variables
variable "smtp_host" {
  description = "SMTP server host"
  type        = string
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

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
