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
  description = "Provisioned throughput (RU/s). Must be between 400 and 1000000."
  type        = number
  default     = 400

  validation {
    condition     = var.throughput >= 400 && var.throughput <= 1000000
    error_message = "Throughput must be between 400 and 1000000 RU/s."
  }
}

variable "public_network_access_enabled" {
  description = "Whether public network access is enabled. Defaults to false for production security."
  type        = bool
  default     = false
}

variable "enable_free_tier" {
  description = "Enable Cosmos DB free tier"
  type        = bool
  default     = false
}

variable "consistency_level" {
  description = "Consistency level. Allowed values: Eventual, ConsistentPrefix, Session, BoundedStaleness, Strong"
  type        = string
  default     = "Session"

  validation {
    condition     = contains(["Eventual", "ConsistentPrefix", "Session", "BoundedStaleness", "Strong"], var.consistency_level)
    error_message = "Consistency level must be one of: Eventual, ConsistentPrefix, Session, BoundedStaleness, Strong."
  }
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
