# n8n Business Rules Setup

n8n provides visual workflow automation for business-user-defined rules. Deploy via Docker Compose (see `config/docker-compose.yml`).

## Deployment

```bash
cd config
docker compose up -d n8n
```

Access n8n at http://localhost:5678. Default credentials: admin / changeme (override via `N8N_BASIC_AUTH_USER` and `N8N_BASIC_AUTH_PASSWORD`).

## Connectors

1. **Baserow** — Add Baserow credential with `BASEROW_API_TOKEN` and `BASEROW_URL`
2. **SendGrid** — For email notifications
3. **Twilio** — For SMS (incident escalation)

## Business Rules to Implement

### 1. Expense > R5,000 → Extra Approval

- **Trigger:** Webhook from Next.js when expense created (or Baserow webhook)
- **Condition:** `amount > 5000`
- **Action:** Send notification to Hans; optionally create "secondary approval" task

### 2. Incident High/Critical → SMS Hans

- **Trigger:** Webhook when incident created
- **Condition:** `severity` in ["High", "Critical"]
- **Action:** Send SMS to Hans via Twilio

### 3. Task Overdue > 3 Days → Escalate

- **Trigger:** Scheduled (daily) or Baserow webhook on task update
- **Condition:** `status !== "Completed"` AND `dueDate` < today - 3 days
- **Action:** Notify Hans; optionally reassign

### 4. Vehicle Mileage > 100,000 km → Schedule Service

- **Trigger:** Webhook when vehicle log updated (or scheduled check)
- **Condition:** `odometerEnd` or `odometerStart` > 100000
- **Action:** Create maintenance task; notify workshop (Charl)

## Webhook Integration

Next.js can send events to n8n via HTTP:

```typescript
// Example: POST to n8n webhook when expense created
await fetch(`${process.env.N8N_WEBHOOK_URL}/webhook/expense-created`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ amount, category, id }),
})
```

Configure `N8N_WEBHOOK_URL` in environment (e.g. http://localhost:5678 for local dev).
