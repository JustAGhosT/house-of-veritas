# Cognitive Services Module - Document Intelligence for OCR scanning

resource "azurerm_cognitive_account" "document_intelligence" {
  name                = var.account_name
  location            = var.location
  resource_group_name = var.resource_group_name
  kind                = "FormRecognizer"
  sku_name            = "S0"

  custom_subdomain_name = var.account_name

  network_acls {
    default_action = var.restrict_network_access ? "Deny" : "Allow"
    ip_rules       = var.restrict_network_access ? var.allowed_ip_ranges : []
  }

  tags = var.tags
}
