# Ikigai Web (Developer & Life Dashboard)

Modern management dashboard for the Ikigai platform.

## Architecture & Technology
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **Primitives**: shadcn/ui
- **Data Management**: TanStack Query (React Query)
- **API Communication**: Typed `ApiClient` boundary (`src/lib/api-client.ts`)

## Boundary & Architecture Rule
`ikigai-web` communicates **strictly** with `ikigai-api` via authenticated HTTP endpoints.
It makes **zero direct queries** to Supabase or the PostgreSQL database, preserving tenant isolation and business logic encapsulation.

## Development & Build Commands
```bash
npm install
npm run dev      # Launches dev server at http://localhost:3000
npm run build    # Produces optimized production bundle
npm run start    # Starts production server
```
