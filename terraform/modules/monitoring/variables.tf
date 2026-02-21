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

variable "enable_database_alerts" {
  description = "Whether to create database metric alerts"
  type        = bool
  default     = false
}

variable "function_app_id" {
  description = "Function App resource ID for monitoring"
  type        = string
  default     = ""
}

variable "enable_function_alerts" {
  description = "Whether to create function app metric alerts"
  type        = bool
  default     = false
}

variable "web_app_id" {
  description = "Web App resource ID for monitoring"
  type        = string
  default     = ""
}

variable "enable_webapp_alerts" {
  description = "Whether to create web app metric alerts"
  type        = bool
  default     = false
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
