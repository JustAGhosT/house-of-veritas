variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "storage_account_name" {
  description = "Name of the storage account (must be globally unique)"
  type        = string
}

variable "container_subnet_id" {
  description = "ID of the container subnet"
  type        = string
}

variable "database_subnet_id" {
  description = "ID of the database subnet"
  type        = string
}

variable "runner_subnet_id" {
  description = "ID of the runner subnet (for CI runner access)"
  type        = string
}

variable "deployer_ip_addresses" {
  description = "IP addresses allowed to manage Storage Account (e.g. CI runner)"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
