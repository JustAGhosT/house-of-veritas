# Testing Rules

Rules for writing and maintaining tests in HouseOfVeritas.

## Framework

- Unit tests: Vitest with `happy-dom` environment
- E2E tests: Playwright with Chromium
- Test setup: `tests/setup.ts` imports `@testing-library/jest-dom/vitest`
- Path aliases: `@/` resolves to project root via `vitest.config.ts`

## Test Structure

- Unit tests go in `tests/lib/` mirroring the `lib/` structure
- API route tests go in `tests/api/` mirroring `app/api/`
- Component tests go in `tests/components/`
- E2E tests go in `tests/e2e/`

## Quality Standards

- Tests must be independent — no shared mutable state between tests
- Use specific assertions (`toBe`, `toEqual`), not just `toBeTruthy`
- Cover edge cases: empty inputs, error conditions, boundary values
- Mock external services (Baserow, DocuSeal, Twilio) — never call real APIs in tests
- Use `vi.useFakeTimers()` instead of busy-waits for time-dependent tests

## Coverage

- All security-critical code MUST have tests (auth, RBAC, rate limiting, middleware)
- New API routes must include at least basic unit tests
- Coverage thresholds should be enforced in CI (target: 60% statements)

## CI Integration

- Unit tests run in the `build` job of `deploy.yml` via `npm test`
- E2E tests should run after build, before deploy
- Failed tests must block deployment
