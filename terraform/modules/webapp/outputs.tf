output "web_app_id" {
  description = "ID of the Web App"
  value       = azurerm_linux_web_app.main.id
}

output "web_app_name" {
  description = "Name of the Web App"
  value       = azurerm_linux_web_app.main.name
}

output "default_hostname" {
  description = "Default hostname of the Web App"
  value       = azurerm_linux_web_app.main.default_hostname
}

output "web_app_url" {
  description = "URL of the Web App"
  value       = "https://${azurerm_linux_web_app.main.default_hostname}"
}

output "principal_id" {
  description = "Managed identity principal ID"
  value       = azurerm_linux_web_app.main.identity[0].principal_id
}
