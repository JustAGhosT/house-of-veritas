output "endpoint" {
  description = "Endpoint URL for Document Intelligence"
  value       = azurerm_cognitive_account.document_intelligence.endpoint
}

output "primary_access_key" {
  description = "Primary access key for Document Intelligence"
  value       = azurerm_cognitive_account.document_intelligence.primary_access_key
  sensitive   = true
}

output "secondary_access_key" {
  description = "Secondary access key for Document Intelligence"
  value       = azurerm_cognitive_account.document_intelligence.secondary_access_key
  sensitive   = true
}

output "id" {
  description = "ID of the Document Intelligence account"
  value       = azurerm_cognitive_account.document_intelligence.id
}
