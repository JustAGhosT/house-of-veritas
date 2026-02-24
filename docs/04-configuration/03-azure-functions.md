# House of Veritas - Azure Functions

This directory contains all Azure Functions for automation and integration.

## Functions Overview

| Function            | Trigger   | Schedule            | Purpose                          |
| ------------------- | --------- | ------------------- | -------------------------------- |
| DocuSealWebhook     | HTTP POST | On demand           | Handle DocuSeal signature events |
| DocumentExpiryAlert | Timer     | Daily 6:00 AM       | Check expiring documents         |
| RecurringTasks      | Timer     | Monday 8:00 AM      | Create weekly tasks              |
| OvertimeCalculator  | Timer     | Sunday 11:00 PM     | Calculate weekly overtime        |
| LeaveBalanceUpdate  | Timer     | Monthly 1st 7:00 AM | Update leave balances            |
| ExpenseNotification | HTTP POST | On demand           | Notify on new expenses           |
| BudgetReport        | Timer     | Monthly 5th 8:00 AM | Generate financial report        |
| BackupExport        | Timer     | Sunday midnight     | Export data to blob storage      |

## Directory Structure

```text
azure-functions/
├── shared/
│   └── utils.py              # Shared utilities (clients, config)
├── DocuSealWebhook/
│   ├── __init__.py           # Function code
│   └── function.json         # Trigger configuration
├── DocumentExpiryAlert/
│   ├── __init__.py
│   └── function.json
├── RecurringTasks/
│   ├── __init__.py
│   └── function.json
├── OvertimeCalculator/
│   ├── __init__.py
│   └── function.json
├── LeaveBalanceUpdate/
│   ├── __init__.py
│   └── function.json
├── ExpenseNotification/
│   ├── __init__.py
│   └── function.json
├── BudgetReport/
│   ├── __init__.py
│   └── function.json
├── BackupExport/
│   ├── __init__.py
│   └── function.json
├── host.json                 # Function app settings
├── requirements.txt          # Python dependencies
├── local.settings.json       # Local dev settings
└── README.md                 # This file
```

## Local Development

### Prerequisites

- Python 3.9+
- Azure Functions Core Tools v4
- Azure CLI (for deployment)

### Setup

```bash
# Navigate to functions directory
cd /app/config/azure-functions

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Copy and configure settings
cp local.settings.json.example local.settings.json
# Edit local.settings.json with your values
```

### Run Locally

```bash
# Start function app
func start

# Functions will be available at:
# - http://localhost:7071/api/webhook/docuseal
# - http://localhost:7071/api/webhook/expense
```

### Test Individual Functions

```bash
# Test DocuSeal webhook
# Note: If authLevel != anonymous, append ?code=<function-key> to the URL.
# Obtain the function key from Azure Portal → Function App → Functions → DocuSealWebhook → Function Keys.
curl -X POST http://localhost:7071/api/webhook/docuseal \
  -H "Content-Type: application/json" \
  -d '{"event_type": "submission.completed", "data": {...}}'

# Manually trigger timer functions (via admin endpoint)
# Note: Host/admin key required for admin endpoints. Retrieve from Azure Portal → Function App → App Keys.
curl -X POST http://localhost:7071/admin/functions/DocumentExpiryAlert
```

## Deployment

### Option 1: GitHub Actions (Recommended)

The CI/CD workflow automatically deploys functions when changes are pushed.
See `/.github/workflows/deploy-functions.yml`

### Option 2: Azure CLI

```bash
# Login to Azure
az login

# Deploy function app
func azure functionapp publish func-houseofveritas
```

### Option 3: VS Code

1. Install Azure Functions extension
2. Right-click on function app folder
3. Select "Deploy to Function App"

## Configuration

### Required Environment Variables

Set these in Azure Portal → Function App → Configuration:

```text
# Baserow
BASEROW_URL=https://baserow.example.com
BASEROW_TOKEN=<api-token>

# Table IDs (update after Baserow setup)
TABLE_EMPLOYEES=1
TABLE_ASSETS=2
TABLE_TASKS=3
TABLE_TIME_CLOCK=4
TABLE_INCIDENTS=5
TABLE_VEHICLE_LOGS=6
TABLE_EXPENSES=7
TABLE_DOCUMENT_EXPIRY=8

# DocuSeal
DOCUSEAL_URL=https://docuseal.example.com
DOCUSEAL_API_KEY=<api-key>
DOCUSEAL_WEBHOOK_SECRET=<secret>

# Email
SENDGRID_API_KEY=<api-key>
EMAIL_FROM=alerts@example.com

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PHONE=+00000000000

# Storage (for backups)
AZURE_STORAGE_CONNECTION_STRING=<connection-string>
BACKUP_CONTAINER=backups
```

## Function Details

### 1. DocuSealWebhook

Receives webhooks when documents are signed in DocuSeal.

**Events Handled:**

- `submission.completed` - Updates employee contract status, document expiry
- `submission.viewed` - Logs view event
- `submission.created` - Logs creation

**Endpoint:** `POST /api/webhook/docuseal`

### 2. DocumentExpiryAlert

Daily check for documents approaching expiry.

**Alert Levels:**

- 🔴 URGENT: ≤7 days
- 🟡 WARNING: ≤30 days
- 🟢 NOTICE: ≤60 days

**Actions:**

- Email to responsible party
- SMS for urgent items
- Daily summary to admin

### 3. RecurringTasks

Creates task instances from recurring templates.

**Recurrence Types:**

- Daily: 7 instances per week
- Weekly: 1 instance per week
- Monthly: 1st week only
- Quarterly: Jan/Apr/Jul/Oct

### 4. OvertimeCalculator

Calculates weekly overtime per BCEA.

**Rules:**

- Standard week: 45 hours
- Weekday overtime: 1.5x rate
- Sunday: 2x rate
- Requires approval

### 5. LeaveBalanceUpdate

Monthly leave accrual per BCEA.

**Leave Types:**

- Annual: 1.25 days/month (15/year)
- Sick: 30 days/3-year cycle
- Family: 3 days/year

### 6. ExpenseNotification

Notifies admin of pending expenses.

**Triggers:**

- HTTP webhook from Baserow
- Hourly check (optional)

### 7. BudgetReport

Monthly financial summary.

**Includes:**

- Category breakdown
- Budget vs actual
- Employee spending
- Top expenses

### 8. BackupExport

Weekly data export to blob storage.

**Exports:**

- All 8 tables as CSV
- Timestamped folders
- 90-day retention

## Monitoring

### Application Insights

Functions automatically log to Application Insights when configured.

View logs:

1. Azure Portal → Function App → Monitor
2. Application Insights → Logs

### Common Queries

```kusto
// Function execution errors
traces
| where severityLevel >= 3
| order by timestamp desc

// Function duration
requests
| summarize avg(duration), count() by name
| order by avg_duration desc
```

## Troubleshooting

### Function Not Triggering

1. Check function is enabled in Azure Portal
2. Verify schedule expression
3. Check Application Insights for errors

### Baserow Connection Fails

1. Verify BASEROW_URL is correct
2. Check BASEROW_TOKEN has correct permissions
3. Test API manually with curl

### Emails Not Sending

1. Verify SENDGRID_API_KEY is valid
2. Check sender verification in SendGrid
3. Review SendGrid activity feed

### Timer Functions Not Running

1. Check Azure Portal → Function App → Functions
2. Verify function is not disabled
3. Check schedule expression syntax

## Security Notes

- Never commit `local.settings.json` with real values
- Use Azure Key Vault for production secrets
- Webhook endpoints use function-level auth keys
- All communications should use HTTPS
