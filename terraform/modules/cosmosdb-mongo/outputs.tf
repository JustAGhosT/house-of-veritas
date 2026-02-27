output "account_name" {
  description = "Cosmos DB account name"
  value       = azurerm_cosmosdb_account.main.name
}

output "mongo_connection_string" {
  description = "Primary Mongo connection string"
  value       = azurerm_cosmosdb_account.main.primary_mongodb_connection_string
  sensitive   = true
}

output "mongo_database_name" {
  description = "Mongo database name"
  value       = azurerm_cosmosdb_mongo_database.main.name
}

output "mongo_collection_name" {
  description = "Mongo collection name"
  value       = azurerm_cosmosdb_mongo_collection.main.name
}
