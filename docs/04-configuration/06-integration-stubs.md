# Integration Stubs — Bank and Insurance

House of Veritas uses placeholder integrations for Bank and Insurance until production credentials are configured. When env vars are not set, the stubs log actions and return success placeholders without making external calls.

## Bank API

**Purpose:** Outbound payments for payroll, reimbursements, loans/advances, and contractor payments.

**Location:** `lib/integrations/bank.ts`

**Environment Variables:**

| Variable       | Description                    | Example                          |
| -------------- | ------------------------------ | -------------------------------- |
| `BANK_API_URL` | Bank API base URL              | `https://bank-api.example.com`   |
| `BANK_API_KEY` | API key or bearer token        | (secret, store in Key Vault)     |

**Usage:**

```typescript
import { submitPayment } from "@/lib/integrations/bank"

const result = await submitPayment({
  recipientId: "emp-123",
  recipientName: "Charl Pieterse",
  amount: 5000,
  currency: "ZAR",
  reference: "LOAN-001",
  type: "loan",
})
```

**When not configured:** Logs payment details and returns `{ success: true, transactionId: "stub-..." }` without making a request.

## Insurance Portal API

**Purpose:** Claim submission and status tracking for asset loss/damage and incident-related claims.

**Location:** `lib/integrations/insurance.ts`

**Environment Variables:**

| Variable               | Description                    | Example                                |
| ---------------------- | ------------------------------ | -------------------------------------- |
| `INSURANCE_PORTAL_URL` | Insurance portal API base URL   | `https://insurer.example.com/api`      |
| `INSURANCE_API_KEY`    | API key or bearer token         | (secret, store in Key Vault)           |

**Usage:**

```typescript
import { submitClaim, getClaimStatus } from "@/lib/integrations/insurance"

const result = await submitClaim({
  incidentId: "inc-456",
  description: "Vehicle damage",
  amount: 15000,
  currency: "ZAR",
})

const status = await getClaimStatus(result.claimId ?? "")
```

**When not configured:** `submitClaim` logs and returns stub claim ID; `getClaimStatus` returns `{ status: "Submitted" }`.

## Setup

1. Obtain API credentials from your bank and insurer.
2. Add variables to `.env.local` (local) or Azure Key Vault / App Configuration (production).
3. Ensure `BANK_API_URL` and `BANK_API_KEY` are set for payment flows.
4. Ensure `INSURANCE_PORTAL_URL` and `INSURANCE_API_KEY` are set for claim flows.

## Security

- Never commit API keys to source control.
- Use Azure Key Vault references in production (e.g. `@Microsoft.KeyVault(SecretUri=...)`).
- Restrict API keys to the minimum required scope.
