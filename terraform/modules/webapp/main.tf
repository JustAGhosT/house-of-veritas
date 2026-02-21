resource "azurerm_service_plan" "webapp" {
  name                = "${var.web_app_name}-plan"
  resource_group_name = var.resource_group_name
  location            = var.location
  os_type             = "Linux"
  sku_name            = "B1"

  tags = var.tags
}

resource "azurerm_linux_web_app" "main" {
  name                = var.web_app_name
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = azurerm_service_plan.webapp.id

  site_config {
    application_stack {
      node_version = "20-lts"
    }

    always_on  = true
    ftps_state = "Disabled"

    cors {
      allowed_origins = [
        "https://${var.domain_name}",
        "https://docs.${var.domain_name}",
        "https://ops.${var.domain_name}",
      ]
    }
  }

  app_settings = merge({
    WEBSITE_NODE_DEFAULT_VERSION = "~20"
    NODE_ENV                     = "production"
    NEXT_PUBLIC_APP_URL          = "https://${var.domain_name}"

    BASEROW_URL   = "https://ops.${var.domain_name}"
    BASEROW_TOKEN = var.baserow_api_token
    DOCUSEAL_URL  = "https://docs.${var.domain_name}"
    DOCUSEAL_KEY  = var.docuseal_api_key

    JWT_SECRET = var.jwt_secret

    AZURE_STORAGE_CONNECTION_STRING = var.storage_connection_string
    DOCUMENT_INTELLIGENCE_ENDPOINT  = var.document_intelligence_endpoint
    DOCUMENT_INTELLIGENCE_KEY       = var.document_intelligence_key
  }, var.extra_app_settings)

  identity {
    type = "SystemAssigned"
  }

  https_only = true

  tags = var.tags
}

resource "azurerm_key_vault_access_policy" "webapp" {
  key_vault_id = var.key_vault_id
  tenant_id    = azurerm_linux_web_app.main.identity[0].tenant_id
  object_id    = azurerm_linux_web_app.main.identity[0].principal_id

  secret_permissions = [
    "Get",
    "List",
  ]
}

resource "azurerm_app_service_custom_hostname_binding" "root" {
  count               = var.custom_domain != "" ? 1 : 0
  hostname            = var.custom_domain
  app_service_name    = azurerm_linux_web_app.main.name
  resource_group_name = var.resource_group_name
}
