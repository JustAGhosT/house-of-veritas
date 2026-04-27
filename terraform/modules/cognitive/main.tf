# Cognitive Services Module - Document Intelligence for OCR scanning

resource "azurerm_cognitive_account" "document_intelligence" {
  name                = var.account_name
  location            = var.location
  resource_group_name = var.resource_group_name
  kind                = "FormRecognizer"
  # F0 = free tier (500 transactions/month). Bump to S0 only when usage
  # outgrows it; switching is a no-op apply.
  sku_name            = var.sku_name

  custom_subdomain_name = var.account_name

  network_acls {
    default_action = var.restrict_network_access ? "Deny" : "Allow"
    ip_rules       = var.restrict_network_access ? var.allowed_ip_ranges : []
  }

  tags = var.tags
}
