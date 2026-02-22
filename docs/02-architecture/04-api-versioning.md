# API Versioning Strategy

## Overview

The House of Veritas API uses a **URL path versioning** approach. As of February 2026, all endpoints
live under `/api/` without an explicit version prefix. This document describes the strategy for
future versioning.

## Current State

- **Base path:** `/api/`
- **Version:** Implicit v1 (no prefix)
- **Format:** JSON request/response bodies

## Versioning Approach

### When to Introduce Versioning

Introduce explicit versioning when:

1. **Breaking changes** to request/response schemas
2. **Deprecation** of endpoints or fields
3. **Major behavioral changes** (e.g., pagination defaults, sort order)

### URL Path Versioning

When versioning is needed, use path prefixes:

```text
/api/v1/stats
/api/v1/expenses
/api/v2/stats   # New version with breaking changes
```

### Migration Strategy

1. **Add new version** at `/api/v2/...` while keeping `/api/v1/...` (or current `/api/`) active
2. **Document deprecation** in response headers: `X-API-Deprecated: true`, `Sunset: <date>`
3. **Announce** deprecation window (e.g., 6 months) before removal
4. **Remove** old version after sunset date

### Non-Breaking Changes

These do **not** require a new version:

- Adding optional query parameters
- Adding optional response fields
- Adding new endpoints
- Fixing bugs that align with documented behavior

### Response Headers

| Header | Purpose |
| -------- | --------- |
| `Content-Type` | `application/json` |
| `X-Request-ID` | Request correlation (future) |
| `X-API-Version` | `1` (when versioning is active) |

## Recommendations

1. **Avoid versioning** until the first breaking change is required
2. **Document** all public API contracts (request/response schemas)
3. **Use OpenAPI/Swagger** for machine-readable API specs (future)
4. **Version** the entire API surface together, not per-endpoint

---

**Last Updated:** February 2026
