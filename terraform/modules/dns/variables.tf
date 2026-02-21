variable "dns_zone_name" {
  description = "Name of the Azure DNS zone (e.g., nexamesh.ai)"
  type        = string
}

variable "dns_zone_resource_group" {
  description = "Resource group containing the DNS zone"
  type        = string
}

variable "gateway_public_ip" {
  description = "Public IP of the Application Gateway"
  type        = string
}

variable "create_root_record" {
  description = "Whether to create an A record for the root domain"
  type        = bool
  default     = false
}

variable "acme_challenge_value" {
  description = "ACME challenge TXT record value for Let's Encrypt (empty = skip)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
