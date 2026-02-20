output "gateway_id" {
  description = "ID of the Application Gateway"
  value       = azurerm_application_gateway.main.id
}

output "public_ip_address" {
  description = "Public IP address of the Application Gateway"
  value       = azurerm_public_ip.gateway.ip_address
}

output "public_ip_fqdn" {
  description = "FQDN of the public IP"
  value       = azurerm_public_ip.gateway.fqdn
}
