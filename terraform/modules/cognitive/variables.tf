variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "account_name" {
  description = "Name of the Document Intelligence account"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

variable "restrict_network_access" {
  description = "When true, restrict Cognitive Services to allowed IPs/subnets only"
  type        = bool
  default     = false
}

variable "allowed_ip_ranges" {
  description = "IP ranges allowed to access Cognitive Services (when restrict_network_access is true)"
  type        = list(string)
  default     = []
}

