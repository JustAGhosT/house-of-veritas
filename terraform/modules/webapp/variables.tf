variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "web_app_name" {
  description = "Name of the Web App"
  type        = string
}

variable "domain_name" {
  description = "Root domain name"
  type        = string
}

variable "custom_domain" {
  description = "Custom domain to bind (empty to skip)"
  type        = string
  default     = ""
}

variable "key_vault_id" {
  description = "Key Vault ID for managed identity access"
  type        = string
}

variable "baserow_api_token" {
  description = "Baserow API token"
  type        = string
  sensitive   = true
  default     = ""
}

variable "docuseal_api_key" {
  description = "DocuSeal API key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "jwt_secret" {
  description = "JWT signing secret for auth"
  type        = string
  sensitive   = true
}

variable "storage_connection_string" {
  description = "Azure Storage connection string"
  type        = string
  sensitive   = true
  default     = ""
}

variable "document_intelligence_endpoint" {
  description = "Document Intelligence endpoint"
  type        = string
  default     = ""
}

variable "document_intelligence_key" {
  description = "Document Intelligence key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "extra_app_settings" {
  description = "Additional app settings to merge"
  type        = map(string)
  default     = {}
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
