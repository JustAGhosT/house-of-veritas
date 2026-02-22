# ADR-008: Testing Strategy — Vitest, Playwright, and CI Integration

**Status:** Accepted  
**Date:** 2026-02-21  
**Deciders:** Technical Lead, Engineering Team

---

## Context

House of Veritas requires a testing approach that balances coverage, speed, and maintainability.
The platform uses Next.js API routes, React components, and integrations with Baserow, DocuSeal,
and Azure services. Tests must run in CI and block deployment on failure.

---

## Decision Drivers

1. **Speed** — Unit tests must run quickly (<30s) for developer feedback
2. **Reliability** — E2E tests must be stable; avoid flakiness from external services
3. **Coverage** — Security-critical paths (auth, RBAC, rate limiting) must be tested
4. **CI** — Tests run on every PR and before deployment

---

## Decisions

### 1. Unit Tests: Vitest

- **Framework:** Vitest with `happy-dom` environment
- **Location:** `tests/lib/`, `tests/api/`, `tests/components/` mirroring source structure
- **Path aliases:** `@/` resolves to project root via `vitest.config.ts`
- **Setup:** `tests/setup.ts` imports `@testing-library/jest-dom/vitest`

### 2. E2E Tests: Playwright

- **Framework:** Playwright with Chromium
- **Location:** `tests/e2e/`
- **Scope:** Critical user flows (login, dashboard, key workflows)
- **Isolation:** Mock or stub external services where possible

### 3. Coverage Targets

- **Statements:** 60% minimum (enforced in CI)
- **Security-critical:** Auth, RBAC, rate limiting, middleware — must have tests
- **New API routes:** At least basic unit tests required

### 4. Mocking and Isolation

- **External services:** Mock Baserow, DocuSeal, Twilio — never call real APIs in tests
- **Time:** Use `vi.useFakeTimers()` instead of busy-waits
- **Independence:** No shared mutable state between tests

### 5. CI Integration

- **Unit tests:** Run in `build` job of `deploy.yml` via `npm test`
- **E2E tests:** Run after build, before deploy
- **Failure:** Failed tests block deployment

---

## Commands

```bash
npm test              # Unit tests (Vitest)
npm run test:e2e      # E2E tests (Playwright)
npm run test:coverage # Coverage report
```

---

## Consequences

- **Positive:** Fast feedback, consistent structure, security coverage
- **Negative:** E2E tests can be slower; flakiness requires maintenance
- **Future:** Consider visual regression, performance budgets as needed
