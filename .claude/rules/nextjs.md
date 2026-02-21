# Next.js Rules

Rules for Next.js development in HouseOfVeritas.

## App Router
- Use the App Router (`app/`) directory structure
- Pages that need interactivity must have `"use client"` directive
- Pages that are purely presentational should NOT have `"use client"` (enable SSR)
- API routes go in `app/api/[resource]/route.ts`

## Components
- Shared components go in `components/`
- UI primitives (shadcn/ui) go in `components/ui/`
- Components should be single-responsibility
- Extract inline sub-components when they exceed ~50 lines
- Use `data-testid` attributes for E2E testing

## Performance
- Use `next/image` for image optimization (remove `unoptimized: true` when adding images)
- Use `next/dynamic` with `ssr: false` for heavy client-side libraries (Recharts, framer-motion)
- Isolate per-second timers into dedicated `<Clock />` components
- Remove `typescript: { ignoreBuildErrors: true }` — fix type errors instead
- `next.config.mjs` is the config file (not `.ts`)

## Middleware
- `middleware.ts` at project root handles auth, rate limiting, and route protection
- Public paths are defined in `PUBLIC_PATHS` array
- Auth context is injected via `x-user-id` and `x-user-role` headers
- Avoid propagating PII (email) in headers — resolve from user store by ID when needed
- Rate limiting: 5/min for login, 100/min for general API

## Styling
- Use Tailwind CSS v4 with CSS-only configuration (`@theme inline` blocks)
- Dark-first design using CSS variables
- Per-persona color palettes (Hans=blue, Charl=amber, Lucky=green, Irma=purple)
- Use responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`
