variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "key_vault_name" {
  description = "Name of the Key Vault (must be globally unique)"
  type        = string
}

variable "container_subnet_id" {
  description = "ID of the container subnet"
  type        = string
}

variable "db_admin_password" {
  description = "Database administrator password"
  type        = string
  sensitive   = true
}

variable "docuseal_secret_key" {
  description = "DocuSeal secret key"
  type        = string
  sensitive   = true
  default     = "changeme-docuseal-secret" # Change in production
}

variable "baserow_secret_key" {
  description = "Baserow secret key"
  type        = string
  sensitive   = true
  default     = "changeme-baserow-secret" # Change in production
}

variable "smtp_password" {
  description = "SMTP password for email notifications"
  type        = string
  sensitive   = true
  default     = "" # Set in production
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
