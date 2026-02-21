variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "resource_group_id" {
  description = "ID of the resource group (for budget scope)"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "workspace_name" {
  description = "Log Analytics workspace name"
  type        = string
}

variable "alert_email" {
  description = "Email address for alerts"
  type        = string
}

variable "database_server_id" {
  description = "PostgreSQL server resource ID for monitoring"
  type        = string
  default     = ""
}

variable "function_app_id" {
  description = "Function App resource ID for monitoring"
  type        = string
  default     = ""
}

variable "web_app_id" {
  description = "Web App resource ID for monitoring"
  type        = string
  default     = ""
}

variable "monthly_budget" {
  description = "Monthly budget in ZAR"
  type        = number
  default     = 1000
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
