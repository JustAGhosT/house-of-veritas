# Database Module - PostgreSQL Flexible Server for House of Veritas

resource "azurerm_postgresql_flexible_server" "main" {
  name                   = var.server_name
  resource_group_name    = var.resource_group_name
  location               = var.location
  version                = "14"
  
  delegated_subnet_id    = var.database_subnet_id
  private_dns_zone_id    = azurerm_private_dns_zone.postgres.id
  
  administrator_login    = var.admin_username
  administrator_password = var.admin_password
  
  storage_mb = 32768  # 32GB
  
  sku_name   = "B_Standard_B1ms"  # Burstable, cost-effective
  
  backup_retention_days        = 7
  geo_redundant_backup_enabled = true
  
  high_availability {
    mode = "ZoneRedundant"
  }

  tags = var.tags

  depends_on = [azurerm_private_dns_zone_virtual_network_link.postgres]
}

# Private DNS Zone for PostgreSQL
resource "azurerm_private_dns_zone" "postgres" {
  name                = "${var.server_name}.postgres.database.azure.com"
  resource_group_name = var.resource_group_name
  
  tags = var.tags
}

resource "azurerm_private_dns_zone_virtual_network_link" "postgres" {
  name                  = "${var.server_name}-vnet-link"
  private_dns_zone_name = azurerm_private_dns_zone.postgres.name
  resource_group_name   = var.resource_group_name
  virtual_network_id    = var.vnet_id
  
  tags = var.tags
}

# Databases
resource "azurerm_postgresql_flexible_server_database" "docuseal" {
  name      = "docuseal_production"
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "UTF8"
}

resource "azurerm_postgresql_flexible_server_database" "baserow" {
  name      = "baserow_production"
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "UTF8"
}

# Firewall Rules (None - using private endpoint only)
# All access via private subnet

# Server Configuration
resource "azurerm_postgresql_flexible_server_configuration" "ssl" {
  name      = "ssl"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "on"
}

resource "azurerm_postgresql_flexible_server_configuration" "connection_throttling" {
  name      = "connection_throttling"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "on"
}
