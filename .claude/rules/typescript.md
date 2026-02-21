# TypeScript Rules

Rules for TypeScript code in HouseOfVeritas.

## Type Safety
- `strict: true` is enabled in `tsconfig.json` — maintain it
- Never use `any` — use `unknown` with type guards instead
- Use `error: unknown` in catch blocks, then narrow with `instanceof Error`
- Use discriminated unions for state management
- Use `Omit`, `Pick`, `Partial`, `Required` utility types to derive types

## Code Style
- Use `import type` for type-only imports
- Export types from centralized files (avoid duplicating interfaces)
- Use `as const` for literal type inference on constant arrays/objects
- Prefer `interface` for object shapes, `type` for unions/intersections

## API Routes
- Use `NextResponse.json()` for all responses
- Use consistent response shapes: `{ data, summary }` for success, `{ error }` for failure
- Use `withRole()`/`withAuth()` from `lib/auth/rbac.ts` instead of manual auth checks
- Validate request bodies before processing

## Patterns
- Use the structured logger (`lib/logger.ts`) — never `console.log/error/warn`
- Use `toDateString()` utility for date formatting instead of inline `.toISOString().split("T")[0]`
- Use integer cents for monetary values, not floating-point numbers
- External service calls must include `AbortSignal.timeout()` for timeout protection
