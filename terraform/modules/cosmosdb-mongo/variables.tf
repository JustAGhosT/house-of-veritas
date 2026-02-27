variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "account_name" {
  description = "Cosmos DB account name (must be globally unique, lowercase alphanumeric)"
  type        = string
}

variable "mongo_database_name" {
  description = "Mongo database name"
  type        = string
}

variable "mongo_collection_name" {
  description = "Mongo collection name"
  type        = string
}

variable "throughput" {
  description = "Provisioned throughput (RU/s)"
  type        = number
  default     = 400
}

variable "public_network_access_enabled" {
  description = "Whether public network access is enabled"
  type        = bool
  default     = true
}

variable "enable_free_tier" {
  description = "Enable Cosmos DB free tier"
  type        = bool
  default     = false
}

variable "consistency_level" {
  description = "Consistency level"
  type        = string
  default     = "Session"
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
