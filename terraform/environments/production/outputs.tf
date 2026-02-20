output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "vnet_id" {
  description = "ID of the virtual network"
  value       = module.network.vnet_id
}

output "storage_account_name" {
  description = "Name of the storage account"
  value       = module.storage.storage_account_name
}

output "key_vault_uri" {
  description = "URI of the Key Vault"
  value       = module.security.key_vault_uri
}

output "database_server_fqdn" {
  description = "FQDN of the PostgreSQL server"
  value       = module.database.server_fqdn
}

output "docuseal_container_id" {
  description = "ID of the DocuSeal container"
  value       = module.compute.docuseal_container_id
}

output "baserow_container_id" {
  description = "ID of the Baserow container"
  value       = module.compute.baserow_container_id
}

output "application_gateway_public_ip" {
  description = "Public IP address of the Application Gateway"
  value       = module.gateway.public_ip_address
}

output "docuseal_url" {
  description = "URL for DocuSeal"
  value       = "https://docs.${var.domain_name}"
}

output "baserow_url" {
  description = "URL for Baserow"
  value       = "https://ops.${var.domain_name}"
}

output "dns_records_required" {
  description = "DNS records to configure"
  value = {
    docs = "docs.${var.domain_name} -> ${module.gateway.public_ip_address}"
    ops  = "ops.${var.domain_name} -> ${module.gateway.public_ip_address}"
  }
}
