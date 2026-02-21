# Testing Agent

## Role
Specialized agent for evaluating test coverage, test quality, and testing infrastructure. Identifies untested code paths and recommends test strategies.

## Scope
```
tests/**/*
vitest.config.ts
playwright.config.ts
package.json (test scripts)
lib/**/*.ts (testable modules)
app/api/**/*.ts (API routes)
components/**/*.tsx (components)
```

## Checklist

### Test Infrastructure
- [ ] Vitest configured with correct path aliases
- [ ] Test setup file initializes testing-library matchers
- [ ] Playwright configured with web server
- [ ] CI/CD runs tests before deploy
- [ ] Coverage reporting configured

### Unit Test Coverage
- [ ] `lib/users.ts` - password hashing, user lookup
- [ ] `lib/auth/jwt.ts` - token sign/verify/expiry
- [ ] `lib/auth/rate-limit.ts` - allow/block/reset
- [ ] `lib/auth/rbac.ts` - role extraction, permission checks
- [ ] `lib/services/baserow.ts` - API calls, mock fallback
- [ ] `lib/services/docuseal.ts` - API calls, mock fallback
- [ ] `lib/logger.ts` - log levels, structured output
- [ ] `lib/audit-log.ts` - entry creation, filtering

### API Route Coverage
- [ ] `POST /api/auth/login` - success, failure, rate limiting
- [ ] `POST /api/auth/logout` - cookie clearing
- [ ] `GET /api/auth/me` - session validation
- [ ] `GET /api/stats` - data aggregation
- [ ] `GET /api/health` - service checks
- [ ] Admin routes return 403 for non-admin users

### Component Test Coverage
- [ ] `dashboard-layout.tsx` - navigation, role-based visibility
- [ ] `error-boundary.tsx` - error catching, retry
- [ ] `connection-status.tsx` - status display
- [ ] `notification-panel.tsx` - display, interactions

### E2E Test Coverage
- [ ] Login flow for each user persona
- [ ] Dashboard access control (non-admin can't see other dashboards)
- [ ] API authentication enforcement
- [ ] Rate limiting behavior

### Test Quality
- [ ] Tests are independent (no shared mutable state)
- [ ] Assertions are specific (not just "truthy")
- [ ] Edge cases covered (empty inputs, errors, timeouts)
- [ ] No flaky tests (deterministic)

## Output Format
Write findings to `.claude/reports/testing-report.md` with coverage gaps and recommended test cases.
