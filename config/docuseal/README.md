# DocuSeal Configuration - House of Veritas

## Overview

DocuSeal is the document signing platform for House of Veritas, accessible at `docs.houseofveritas.za`.

## Initial Setup

### 1. First Login

After deployment, access DocuSeal at your configured URL and create the admin account:

- **Email:** hans@houseofveritas.za
- **Name:** Hans (Owner)
- **Role:** Admin

### 2. SMTP Configuration

Navigate to Settings → Email and configure:

```
SMTP Server: smtp.sendgrid.net
Port: 587
Username: apikey
Password: [Your SendGrid API Key]
From: noreply@houseofveritas.za
```

### 3. Branding

Upload the House of Veritas logo and configure colors:

- **Primary Color:** #1E40AF (Blue)
- **Secondary Color:** #059669 (Green)
- **Logo:** Use `/public/hv-logo.svg`

### 4. API Key Generation

Navigate to Settings → API and generate an API key. Store this in Azure Key Vault.

## Document Templates

Upload the 18 governance documents as templates. See `/config/templates/` for the list.

### Template Categories

| # | Document | Type | Signers |
|---|----------|------|---------|
| 1 | Property Charter | Governance | Hans |
| 2 | House Rules | Governance | All |
| 3 | Workshop Safety Manual | Safety | Charl, Lucky |
| 4 | Employment Contract | HR | Employee + Hans |
| 5 | Resident Agreement | Governance | Irma + Hans |
| 6 | Vehicle Usage Policy | Operations | Charl, Lucky |
| 7 | Tool Checkout Policy | Operations | Charl, Lucky |
| 8 | Expense Reimbursement Policy | Finance | All |
| 9 | Leave Policy | HR | All |
| 10 | Overtime Policy | HR | Charl, Lucky |
| 11 | Incident Reporting Procedure | Safety | All |
| 12 | Emergency Contact List | Safety | All |
| 13 | Asset Maintenance Schedule | Operations | Charl |
| 14 | Garden Maintenance Plan | Operations | Lucky |
| 15 | Household Task Roster | Operations | Irma |
| 16 | Financial Approval Matrix | Finance | Hans |
| 17 | POPIA Consent Form | Compliance | All |
| 18 | Succession Protocol | Governance | Hans |

## User Accounts

Create the following user accounts:

| User | Email | Role |
|------|-------|------|
| Hans | hans@houseofveritas.za | Admin |
| Charl | charl@houseofveritas.za | Employee |
| Lucky | lucky@houseofveritas.za | Employee |
| Irma | irma@houseofveritas.za | Resident |

## Webhook Configuration

Register webhook for integration with Baserow:

- **URL:** `https://func-houseofveritas.azurewebsites.net/api/docuseal-webhook`
- **Events:** `submission.completed`, `submission.viewed`
- **Secret:** Store in Key Vault

## API Endpoints

Base URL: `https://docs.houseofveritas.za/api`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/templates` | GET | List all templates |
| `/api/templates` | POST | Create template |
| `/api/submissions` | POST | Create signature request |
| `/api/submissions/:id` | GET | Get submission status |
| `/api/webhooks` | POST | Register webhook |

## Testing Checklist

- [ ] Admin can log in
- [ ] SMTP sends test email
- [ ] All 18 templates uploaded
- [ ] All 4 users can log in
- [ ] Signature workflow works end-to-end
- [ ] Webhook triggers Azure Function
- [ ] API key works for programmatic access
