# IMPerfect Esports

Puerto Rico's top hero-shooter esports organization — website, team hub, and management platform.

## Commands

### Development

```bash
make run            # Start local dev server (http://localhost:3000)
make build          # Build for production
make start          # Start production server locally (requires build first)
```

### Code Quality

```bash
make test           # Run all checks (lint + typecheck + unit tests)
make lint           # Run ESLint
make typecheck      # Run TypeScript type checking
make unit           # Run unit tests (vitest)
make e2e            # Run Playwright E2E tests
```

Unit tests live in `src/lib/__tests__/` (vitest, no database or network: Supabase and auth are mocked). They cover permissions, validation, availability, the admin/players APIs, lineup rules, CSRF and rate limiting, CSV export and the Marvel Rivals stats parser.

### Database

```bash
make db-schema      # Print current Supabase schema
make db-reset       # Reset local Supabase + apply schema
make db-seed        # Seed Supabase with local JSON dev data
make db-push        # Push pending migrations to remote Supabase
```

### Deployment

```bash
make deploy         # Deploy to Vercel production
make deploy-preview # Deploy to Vercel preview
make logs           # Tail production logs
make status         # Show Vercel deployment status
```

### Docs

```bash
make docs           # Serve docs/ locally on port 8080
```

Copy `.env.example` to `.env.local` and fill in values before running locally.
