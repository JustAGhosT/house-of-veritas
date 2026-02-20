output "docuseal_container_id" {
  description = "ID of the DocuSeal container group"
  value       = azurerm_container_group.docuseal.id
}

output "docuseal_ip_address" {
  description = "IP address of the DocuSeal container"
  value       = azurerm_container_group.docuseal.ip_address
}

output "baserow_container_id" {
  description = "ID of the Baserow container group"
  value       = azurerm_container_group.baserow.id
}

output "baserow_ip_address" {
  description = "IP address of the Baserow container"
  value       = azurerm_container_group.baserow.ip_address
}

output "docuseal_identity_principal_id" {
  description = "Principal ID of DocuSeal managed identity"
  value       = azurerm_container_group.docuseal.identity[0].principal_id
}

output "baserow_identity_principal_id" {
  description = "Principal ID of Baserow managed identity"
  value       = azurerm_container_group.baserow.identity[0].principal_id
}
