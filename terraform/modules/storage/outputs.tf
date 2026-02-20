output "storage_account_id" {
  description = "ID of the storage account"
  value       = azurerm_storage_account.main.id
}

output "storage_account_name" {
  description = "Name of the storage account"
  value       = azurerm_storage_account.main.name
}

output "storage_account_primary_connection_string" {
  description = "Primary connection string for the storage account"
  value       = azurerm_storage_account.main.primary_connection_string
  sensitive   = true
}

output "documents_container_name" {
  description = "Name of the documents container"
  value       = azurerm_storage_container.documents.name
}

output "backups_container_name" {
  description = "Name of the backups container"
  value       = azurerm_storage_container.backups.name
}

output "tfstate_container_name" {
  description = "Name of the terraform state container"
  value       = azurerm_storage_container.terraform-state.name
}
