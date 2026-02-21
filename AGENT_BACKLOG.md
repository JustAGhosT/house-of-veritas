# Agent Backlog

Prioritized action items from the latest multi-agent assessment (2026-02-21).
See `.claude/reports/orchestrator-summary.md` for the full report.

## P0 Critical — Fix Before Production

| # | Action | Effort | Agent |
|---|--------|--------|-------|
| 1 | Remove JWT secret fallback | 15m | 04, 09 |
| 2 | Remove `demoPassword` from reset response | 2h | 04, 09 |
| 3 | Add auth guard to `/api/auth/users` | 5m | 04 |
| 4 | Add auth to `POST /api/audit` | 5m | 04 |
| 5 | Re-enable WAF SQL injection rules | 5m | 02 |
| 6 | Restrict Cognitive Services network access | 15m | 02 |
| 7 | Migrate audit log to persistent storage | 4h | 05, 07, 09, 10 |
| 8 | Switch monetary math to integer-cents | 6h | 05, 09 |
| 9 | Remove hardcoded passwords (env or DB) | 4h | 05, 07, 09 |
| 10 | Replace 105+ console.* with logger | 30m | 08 |
| 11 | Remove `ignoreBuildErrors: true` | 2h | 06, 07 |

## P1 High — Sprint 1

| # | Action | Effort | Agent |
|---|--------|--------|-------|
| 12 | Add auth checks to 12+ unprotected routes | 2h | 04 |
| 13 | Add `timeout-minutes` to all CI/CD jobs | 30m | 01 |
| 14 | Fix yarn/npm mismatch in deploy.yml | 15m | 01 |
| 15 | Make health checks fail on exhausted retries | 30m | 01 |
| 16 | Create 17 missing dashboard pages or disable nav | 8h | 06 |
| 17 | Wire up Hans approval buttons | 4h | 09 |
| 18 | Add middleware unit tests | 4h | 03 |
| 19 | Add Baserow service unit tests | 4h | 03 |
| 20 | Add password reset API tests | 2h | 03 |
| 21 | Fix container NSG to specific ports | 10m | 02 |
| 22 | Remove insecure default secrets | 5m | 02 |
| 23 | Pin container image versions | 15m | 02 |
| 24 | Add SSL policy to Application Gateway | 5m | 02 |
| 25 | Persist rate limiter to Redis | 4h | 09 |
| 26 | Add E2E tests to CI pipeline | 2h | 03 |
| 27 | Add Baserow pagination support | 4h | 05 |

## Status

- Total findings: 130+
- P0: 11 items (~20h)
- P1: 16 items (~40h)
- P2: 18 items (~50h)
- P3: 7 items (~40h)
- Overall vertical completeness: 62%
