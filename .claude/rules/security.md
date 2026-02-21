# Security Rules

Rules for secure development in HouseOfVeritas.

## Secrets
- NEVER hardcode secrets, API keys, passwords, or tokens in source code
- Use environment variables via `process.env` for all sensitive values
- Throw at startup if critical secrets (JWT_SECRET, database credentials) are missing in production
- Never return passwords, tokens, or secrets in API responses
- Mark Terraform variables as `sensitive = true` when they contain secrets

## Authentication
- All non-public API routes MUST use `withAuth()` or `withRole()` from `lib/auth/rbac.ts`
- Never trust client-provided headers for auth context without middleware verification
- Use bcrypt (10+ rounds) for password hashing — never store plaintext
- JWT tokens must have expiry (max 8 hours) and use a strong secret
- Rate limit authentication endpoints (5/min for login, 100/min for API)

## Input Validation
- Validate all request bodies using Zod or manual checks before processing
- Never pass user input directly to database queries or external APIs
- Sanitize user-provided strings before storage
- Validate file uploads (type, size, content)

## Error Handling
- Never expose internal error messages (`error.message`) in API responses
- Use structured logging via `lib/logger.ts` — never `console.log` in production
- Return generic error messages to clients; log details server-side

## Infrastructure
- All Azure resources must enforce TLS 1.2 minimum
- Storage accounts must use deny-by-default network ACLs
- Database must not be publicly accessible
- Use managed identities over access keys where possible
- WAF rules must not be inadvertently disabled
