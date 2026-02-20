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

variable "gateway_subnet_id" {
  description = "ID of the gateway subnet"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
}

variable "docuseal_ip_address" {
  description = "IP address of DocuSeal container"
  type        = string
}

variable "baserow_ip_address" {
  description = "IP address of Baserow container"
  type        = string
}

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

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
