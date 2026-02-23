resource "azurerm_log_analytics_workspace" "main" {
  name                = var.workspace_name
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = var.tags
}

resource "azurerm_monitor_action_group" "alerts" {
  name                = "${var.workspace_name}-alerts"
  resource_group_name = var.resource_group_name
  short_name          = "HOVAlerts"

  email_receiver {
    name          = "admin"
    email_address = var.alert_email
  }

  tags = var.tags
}

resource "azurerm_monitor_metric_alert" "db_cpu" {
  count               = var.enable_database_alerts ? 1 : 0
  name                = "db-cpu-high"
  resource_group_name = var.resource_group_name
  scopes              = [var.database_server_id]
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT15M"

  criteria {
    metric_namespace = "Microsoft.DBforPostgreSQL/flexibleServers"
    metric_name      = "cpu_percent"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 80
  }

  action {
    action_group_id = azurerm_monitor_action_group.alerts.id
  }

  lifecycle {
    precondition {
      condition     = var.database_server_id != ""
      error_message = "database_server_id must be provided when enable_database_alerts is true"
    }
  }

  tags = var.tags
}

resource "azurerm_monitor_metric_alert" "function_failures" {
  count               = var.enable_function_alerts ? 1 : 0
  name                = "func-failures"
  resource_group_name = var.resource_group_name
  scopes              = [var.function_app_id]
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT5M"

  criteria {
    metric_namespace = "Microsoft.Web/sites"
    metric_name      = "Http5xx"
    aggregation      = "Total"
    operator         = "GreaterThan"
    threshold        = 5
  }

  action {
    action_group_id = azurerm_monitor_action_group.alerts.id
  }

  lifecycle {
    precondition {
      condition     = var.function_app_id != ""
      error_message = "function_app_id must be provided when enable_function_alerts is true"
    }
  }

  tags = var.tags
}

resource "azurerm_monitor_metric_alert" "webapp_response_time" {
  count               = var.enable_webapp_alerts ? 1 : 0
  name                = "webapp-slow-response"
  resource_group_name = var.resource_group_name
  scopes              = [var.web_app_id]
  severity            = 3
  frequency           = "PT5M"
  window_size         = "PT15M"

  criteria {
    metric_namespace = "Microsoft.Web/sites"
    metric_name      = "HttpResponseTime"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 5
  }

  action {
    action_group_id = azurerm_monitor_action_group.alerts.id
  }

  lifecycle {
    precondition {
      condition     = var.web_app_id != ""
      error_message = "web_app_id must be provided when enable_webapp_alerts is true"
    }
  }

  tags = var.tags
}

resource "azurerm_consumption_budget_resource_group" "monthly" {
  count = var.enable_consumption_budget ? 1 : 0

  name              = "hov-monthly-budget"
  resource_group_id = var.resource_group_id

  amount     = var.monthly_budget
  time_grain = "Monthly"

  time_period {
    start_date = formatdate("YYYY-MM-01'T'00:00:00Z", timestamp())
  }

  notification {
    enabled        = true
    threshold      = 80
    operator       = "GreaterThanOrEqualTo"
    threshold_type = "Actual"

    contact_emails = [var.alert_email]
  }

  notification {
    enabled        = true
    threshold      = 100
    operator       = "GreaterThanOrEqualTo"
    threshold_type = "Forecasted"

    contact_emails = [var.alert_email]
  }

  lifecycle {
    ignore_changes = [time_period]
  }
}
