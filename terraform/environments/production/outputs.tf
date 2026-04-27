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

output "storage_blob_endpoint" {
  description = "Primary blob endpoint URL"
  value       = module.storage.primary_blob_endpoint
}

output "key_vault_uri" {
  description = "URI of the Key Vault"
  value       = module.security.key_vault_uri
}

output "database_server_fqdn" {
  description = "FQDN of the PostgreSQL server"
  value       = module.database.server_fqdn
}

output "cosmos_account_name" {
  description = "Cosmos DB account name"
  value       = module.cosmos_mongo.account_name
}

output "cosmos_mongo_database_name" {
  description = "Cosmos Mongo database name"
  value       = module.cosmos_mongo.mongo_database_name
}

output "cosmos_mongo_collection_name" {
  description = "Cosmos Mongo collection name"
  value       = module.cosmos_mongo.mongo_collection_name
}

output "cosmos_mongo_connection_string" {
  description = "Cosmos Mongo connection string"
  value       = module.cosmos_mongo.mongo_connection_string
  sensitive   = true
}

output "docuseal_container_id" {
  description = "ID of the DocuSeal container"
  value       = module.compute.docuseal_container_id
}

output "baserow_container_id" {
  description = "ID of the Baserow container"
  value       = module.compute.baserow_container_id
}

# Re-enable when module.gateway is uncommented in main.tf.
# output "application_gateway_public_ip" {
#   description = "Public IP address of the Application Gateway"
#   value       = module.gateway.public_ip_address
# }

output "docuseal_url" {
  description = "URL for DocuSeal"
  value       = "https://docs.${var.domain_name}"
}

output "baserow_url" {
  description = "URL for Baserow"
  value       = "https://ops.${var.domain_name}"
}

# Re-enable when module.dns is uncommented in main.tf.
# output "dns_records_required" {
#   description = "DNS records configured"
#   value = {
#     docs = module.dns.docs_fqdn
#     ops  = module.dns.ops_fqdn
#   }
# }

output "document_intelligence_endpoint" {
  description = "Document Intelligence endpoint URL"
  value       = module.cognitive.endpoint
}

output "document_intelligence_key" {
  description = "Document Intelligence access key"
  value       = module.cognitive.primary_access_key
  sensitive   = true
}

output "asset_uploads_container" {
  description = "Blob container name for asset photo uploads"
  value       = module.storage.asset_uploads_container_name
}

output "storage_connection_string" {
  description = "Storage account connection string (for app config)"
  value       = module.storage.storage_account_primary_connection_string
  sensitive   = true
}

output "web_app_url" {
  description = "URL of the Next.js Web App"
  value       = module.webapp.web_app_url
}

output "web_app_name" {
  description = "Name of the Web App"
  value       = module.webapp.web_app_name
}

output "web_app_hostname" {
  description = "Default hostname of the Web App"
  value       = module.webapp.default_hostname
}

output "function_app_url" {
  description = "URL of the Azure Function App"
  value       = module.functions.function_app_url
}

output "function_app_name" {
  description = "Name of the Azure Function App"
  value       = module.functions.function_app_name
}

output "function_app_hostname" {
  description = "Default hostname of the Function App"
  value       = module.functions.function_app_default_hostname
}

output "runner_subnet_id" {
  description = "ID of the runner subnet (pass to phoenixvc-actions-runner Terraform)"
  value       = module.network.runner_subnet_id
}
