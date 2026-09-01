# TKP People Connect

A full-stack people and youth management application built with Nuxt 4, featuring dual database support, JWT authentication, role-based access control, and bulk data import/export. Designed as a POC foundation for AI-powered people analytics and community management systems.

## Tech Stack

### Frontend

| Technology                  | Purpose                                                  |
| --------------------------- | -------------------------------------------------------- |
| **Nuxt 4** (v4.4.7)         | Full-stack Vue framework with SSR                        |
| **Vue 3** (v3.5.35)         | UI framework (Composition API, `<script setup>`)         |
| **PrimeVue 4** (Aura Theme) | UI component library (DataTable, Forms, Dialogs, Toasts) |
| **TanStack Vue Query**      | Server state management with SSR hydration               |
| **Zod**                     | Client-side schema validation                            |
| **VueUse**                  | Utility composables (dark mode, etc.)                    |
| **@iconify/vue**            | Icon system                                              |

### Backend

| Technology                       | Purpose                                              |
| -------------------------------- | ---------------------------------------------------- |
| **Nitro** (via Nuxt)             | Server engine (API routes, middleware, plugins)      |
| **Drizzle ORM**                  | Type-safe database queries with dual dialect support |
| **SQLite** (better-sqlite3)      | Local development database                           |
| **PostgreSQL** (postgres driver) | Production database (Neon serverless ready)          |
| **jose**                         | JWT token generation and verification                |
| **bcryptjs**                     | Password hashing (12 salt rounds)                    |
| **AWS SES**                      | Transactional email (verification, password reset)   |
| **nuxt-security**                | CSP headers, rate limiting, CORS                     |

### DevOps & Tooling

| Technology                | Purpose                                         |
| ------------------------- | ----------------------------------------------- |
| **pnpm**                  | Package manager with workspace config           |
| **TypeScript** (strict)   | End-to-end type safety                          |
| **ESLint** (Antfu config) | Linting with Vue + TypeScript + formatter rules |
| **simple-git-hooks**      | Pre-commit linting via lint-staged              |
| **Vercel**                | Deployment target (Nitro preset)                |

## Project Structure

```
tkp-people-connect/
├── app/                          # Frontend (Vue/Nuxt)
│   ├── app.vue                   # Root component (Toast, ConfirmDialog, loading)
│   ├── error.vue                 # Global error page (401/403/404/500)
│   ├── assets/css/main.css       # Global styles, brand variables, transitions
│   ├── components/
│   │   ├── PersonForm.vue        # Create/Edit person (Zod-validated, multi-section)
│   │   ├── YouthForm.vue         # Create/Edit youth (Zod-validated, multi-section)
│   │   └── ThemeToggle.vue       # Dark/light mode toggle
│   ├── composables/
│   │   ├── useAuth.ts            # Auth state, login, register, logout, password reset
│   │   ├── usePeople.ts          # TanStack Query hooks for People CRUD + bulk upload
│   │   ├── useYouth.ts           # TanStack Query hooks for Youth CRUD + bulk upload
│   │   ├── useDashboard.ts       # Dashboard stats query hook
│   │   └── useToastMessages.ts   # PrimeVue toast helpers
│   ├── layouts/
│   │   ├── default.vue           # Public layout (header + footer)
│   │   ├── dashboard.vue         # Sidebar + header layout (collapsible, mobile)
│   │   └── auth.vue              # Centered card layout for auth pages
│   ├── middleware/
│   │   └── role.ts               # Client-side role-based route guard
│   └── pages/                    # 16 pages (see Pages section)
├── server/                       # Backend (Nitro)
│   ├── api/                      # API routes
│   │   ├── auth/                 # 9 auth endpoints
│   │   ├── people/               # 7 people endpoints
│   │   ├── youth/                # 7 youth endpoints
│   │   ├── users/                # 2 user management endpoints
│   │   └── dashboard/            # 1 stats endpoint
│   ├── database/
│   │   ├── schema.ts             # Drizzle schema (SQLite + PostgreSQL)
│   │   ├── index.ts              # Database factory (singleton)
│   │   └── migrate.ts            # Custom migration system
│   ├── middleware/
│   │   └── 02.auth.ts            # JWT verification + auto-refresh
│   ├── plugins/
│   │   └── database.ts           # Run migrations on startup
│   ├── scripts/
│   │   └── seed.ts               # Sample data seeder
│   └── utils/
│       ├── db.ts                 # Query layer (CRUD, pagination, search)
│       ├── jwt.ts                # JWT sign/verify with jose
│       ├── password.ts           # bcrypt hash/compare
│       ├── email.ts              # AWS SES email templates
│       ├── errors.ts             # Zod/auth/role error handlers
│       ├── file-parser.ts        # CSV/Excel/JSON parser with column mapping
│       └── validators.ts         # Zod schemas for all endpoints
├── shared/                       # Shared types and utilities
│   ├── types/
│   │   ├── api.ts                # PaginatedResponse, ApiSuccess/Error, DashboardStats
│   │   ├── auth.ts               # AuthUser, LoginCredentials, RegisterData
│   │   ├── people.ts             # Person, PersonFormData, Child, Education
│   │   └── youth.ts              # Youth, YouthFormData, Activities, Achievements
│   └── utils/
│       ├── age-calculator.ts     # calculateAgeFromDateOfBirth()
│       ├── phone.ts              # Phone validation via libphonenumber-js
│       └── roles.ts              # Role hierarchy, hasPermission()
├── scripts/
│   └── dev.ts                    # Interactive dev script (DB driver + port selector)
├── drizzle.config.ts             # Dual-dialect Drizzle config
├── nuxt.config.ts                # Nuxt 4 config (PrimeVue, security, rate limiting)
└── data/
    └── database.sqlite           # SQLite database file (dev)
```

## Pages Overview

| Page             | Path                    | Layout    | Description                                                                          |
| ---------------- | ----------------------- | --------- | ------------------------------------------------------------------------------------ |
| Landing          | `/`                     | default   | Hero section with feature cards                                                      |
| Dashboard        | `/dashboard`            | dashboard | Stats grid (4 cards) + recent activity + top organizations                           |
| People Directory | `/people`               | dashboard | DataTable with search, sort, lazy loading, import dialog, export                     |
| Add Person       | `/people/add`           | dashboard | Create form with file import option                                                  |
| Bulk Upload      | `/people/bulk-upload`   | dashboard | Admin-only CSV/Excel/JSON import page                                                |
| Person Detail    | `/people/:id`           | dashboard | Multi-card view (personal, location, parents, family, education, notes)              |
| Edit Person      | `/people/:id/edit`      | dashboard | Pre-filled edit form                                                                 |
| Youth Directory  | `/youth`                | dashboard | DataTable with same features as People                                               |
| Add Youth        | `/youth/add`            | dashboard | Create form with file import option                                                  |
| Youth Detail     | `/youth/:id`            | dashboard | Multi-card view (personal, location, education, activities, achievements, interests) |
| Edit Youth       | `/youth/:id/edit`       | dashboard | Pre-filled edit form                                                                 |
| Users            | `/users`                | dashboard | Admin-only user management with role change                                          |
| Settings         | `/settings`             | dashboard | Profile display (read-only)                                                          |
| Sign In          | `/auth/signin`          | auth      | Login with resend verification flow                                                  |
| Sign Up          | `/auth/signup`          | auth      | Registration with confirm password                                                   |
| Forgot Password  | `/auth/forgot-password` | auth      | Password reset request                                                               |
| Reset Password   | `/auth/reset-password`  | auth      | Reset with token                                                                     |
| Verify Email     | `/auth/verify-email`    | auth      | Auto-verify on page load                                                             |

## API Endpoints

### Authentication

| Method | Endpoint                        | Auth          | Description                         |
| ------ | ------------------------------- | ------------- | ----------------------------------- |
| POST   | `/api/auth/register`            | Public        | Register (sends verification email) |
| POST   | `/api/auth/login`               | Public        | Login (email or username)           |
| POST   | `/api/auth/logout`              | Auth          | Clear tokens                        |
| GET    | `/api/auth/me`                  | Auth          | Get current user                    |
| POST   | `/api/auth/refresh`             | Refresh token | Rotate access + refresh tokens      |
| POST   | `/api/auth/forgot-password`     | Public        | Send reset email                    |
| POST   | `/api/auth/reset-password`      | Public        | Reset password with token           |
| GET    | `/api/auth/verify-email`        | Public        | Verify email with token             |
| POST   | `/api/auth/resend-verification` | Public        | Resend verification email           |

### People & Youth

| Method | Endpoint                  | Auth       | Description                          |
| ------ | ------------------------- | ---------- | ------------------------------------ |
| GET    | `/api/people`             | Public     | List people (paginated, searchable)  |
| POST   | `/api/people`             | admin/user | Create person                        |
| GET    | `/api/people/:id`         | Public     | Get person details                   |
| PUT    | `/api/people/:id`         | admin/user | Update person                        |
| DELETE | `/api/people/:id`         | admin      | Delete person                        |
| GET    | `/api/people/export`      | Auth       | Export as CSV                        |
| POST   | `/api/people/bulk-upload` | admin      | Import CSV/Excel/JSON (max 10K rows) |

> Youth endpoints follow the same pattern under `/api/youth`.

### Users & Dashboard

| Method | Endpoint               | Auth  | Description          |
| ------ | ---------------------- | ----- | -------------------- |
| GET    | `/api/users`           | admin | List users           |
| PUT    | `/api/users/:id`       | admin | Update user role     |
| GET    | `/api/dashboard/stats` | Auth  | Dashboard statistics |

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** >= 8
- (Optional) **PostgreSQL** for production

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/tkp-people-connect.git
cd tkp-people-connect

# Install dependencies
pnpm install
```

### Environment Variables

Copy the example env file and configure:

```bash
cp .env.example .env
```

Key variables:

```env
# Database: "sqlite" or "postgres"
DB_DRIVER=sqlite

# SQLite config
SQLITE_DB_PATH=./data/database.sqlite

# PostgreSQL config (when DB_DRIVER=postgres)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT secrets (generate strong random strings)
JWT_ACCESS_SECRET=your-access-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# App URL (for email links)
APP_URL=http://localhost:3000

# AWS SES (optional - falls back to console logging)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SES_REGION=us-east-1
EMAIL_FROM=noreply@yourdomain.com
```

### Development

```bash
# Interactive mode (prompts for DB driver and port)
pnpm dev

# Quick mode (uses defaults from .env)
pnpm dev:quick
```

### Seed Sample Data

```bash
pnpm seed
```

This creates sample users and people data with Tamil Nadu, India-specific records.

### Build & Preview

```bash
# Production build
pnpm build

# Preview production build locally
pnpm preview
```

### Linting

```bash
# Check for lint errors
pnpm lint

# Auto-fix lint errors
pnpm lint:fix
```

## Forking & Customization Guide

### 1. Branding

- **Colors**: Edit CSS custom properties in `app/assets/css/main.css` (`--color-primary`, `--color-primary-light`, etc.)
- **Logo**: Replace the logo reference in `app/layouts/dashboard.vue` and `app/layouts/auth.vue`
- **App Name**: Update `title` in `nuxt.config.ts` and layout files

### 2. Database Schema

The schema is defined in `server/database/schema.ts` with dual SQLite/PostgreSQL support. To add fields:

1. Add the column to both table definitions in `schema.ts`
2. Add the migration SQL to `server/database/migrate.ts` (both dialects)
3. Update the Zod validators in `server/utils/validators.ts`
4. Update TypeScript types in `shared/types/`
5. Update the form components (`PersonForm.vue` or `YouthForm.vue`)

### 3. Adding New API Routes

Create files in `server/api/` following the Nitro convention:

```
server/api/[endpoint].[method].ts
```

Use the existing utilities:

- `server/utils/db.ts` for database queries
- `server/utils/validators.ts` for Zod validation
- `server/utils/errors.ts` for error handling
- `server/utils/jwt.ts` for auth checks

### 4. Adding New Pages

Create files in `app/pages/` following Nuxt file-based routing. Use existing composables (`useAuth`, `usePeople`, `useYouth`) and layouts (`dashboard`, `auth`, `default`).

### 5. Role-Based Access

The role hierarchy is `admin > user > viewer`. To protect pages:

```vue
<script setup lang="ts">
definePageMeta({
  middleware: 'role',
  requiredRole: 'admin' // or 'user'
})
</script>
```

### 6. Email Templates

Modify templates in `server/utils/email.ts`. The app uses AWS SES with a console fallback when credentials are missing.

### 7. Rate Limiting

Configure in `nuxt.config.ts` under `security.rateLimiter`:

```
rateLimiter: {
  tokensPerInterval: 150,
  interval: 300000,
  headers: true,
  driver: {
    name: 'lruCache',
  },
  routeRules: {
    '/api/auth/login': { tokensPerInterval: 5, interval: 60000 },
    '/api/auth/register': { tokensPerInterval: 3, interval: 60000 },
  }
}
```

## Edge Cases & POC Highlights

This project demonstrates several production-grade patterns that make it a strong foundation for AI-powered systems:

### Dual Database Architecture

Every schema is defined twice (SQLite and PostgreSQL). The runtime dynamically selects the correct table references based on `DB_DRIVER`. The migration system handles column additions, data backfilling, and index creation across both dialects — critical for AI systems that may need to switch between local development and cloud production databases.

### Smart File Import with Column Mapping

`server/utils/file-parser.ts` implements a comprehensive column normalization system with 40+ mapped aliases (e.g., "first name", "firstname", "first_name" all map to `firstName`). Supports CSV, Excel (.xlsx), and JSON with a unified interface. This is essential for AI ingestion pipelines where data comes in unpredictable formats.

### Auto-Calculated Age & Data Enrichment

Age is computed from `dateOfBirth` at both write time and import time using `calculateAgeFromDateOfBirth()`, stored in the database, and displayed in the UI. This pattern extends to any derived/computed fields an AI system might generate.

### Intelligent Spouse Field Clearing

When a person's marital status changes to "single", all spouse-related fields (spouseName, spousePhone, marriageYear, numberOfChildren, children) are automatically cleared. This cascading cleanup prevents stale data — a common edge case in CRUD systems that AI agents often miss.

### Public API with Auth Middleware Differentiation

People and Youth GET endpoints are intentionally public (unauthenticated) to allow browsing, while all mutations require authentication. The `02.auth.ts` middleware uses regex matching to selectively skip JWT verification — a pattern needed when AI agents need read access but humans control write access.

### JWT Auto-Refresh

The auth middleware silently refreshes expired access tokens using refresh tokens without requiring explicit client-side handling. This reduces auth-related API calls and improves UX — important when AI agents make frequent automated requests.

### Rate Limiting Per Endpoint

Different endpoints have different rate limits (login: 5/min, register: 3/min, global: 150/5min). This granular control is essential when AI agents and human users share the same API surface.

### Complex Nested Data Models

Youth records have rich JSON fields for education (with institutions, degrees, GPAs), activities (with proficiency levels), and achievements (with categories and levels). These nested structures are serialized/deserialized at the API boundary — a pattern common in AI systems that process unstructured or semi-structured data.

### Resend Verification Flow

The sign-in page includes an inline "resend verification email" feature when a user tries to log in with an unverified email. This edge case handling prevents user lockout without requiring a separate support flow.

### Seed Data with Regional Context

The seed script creates Tamil Nadu, India-specific sample data (regional names, village/town names, Indian phone number formats). This demonstrates localized data handling for international deployments.

### Error Handling Pipeline

A unified error handler converts Zod validation errors (422), authentication errors (401/403), and generic errors (500) into consistent API responses. This structured error output is critical for AI agents that need to parse and react to API failures programmatically.

## Known Limitations

1. **No test suite** — No unit, integration, or E2E tests are configured
2. **Dashboard organizations** — The dashboard references `totalOrganizations` and `byOrganization` but the schema has no `organization` field (incomplete/leftover from a different schema)
3. **People export** — References fields (`organization`, `designation`, `department`, `address.street`, `address.city`, `tags`) that don't exist in the current schema
4. **No Docker** — Deployment is configured for Vercel only; no containerization
5. **Auth middleware coverage** — Only some pages use the `role` middleware; the dashboard relies on server-side protection only

## License

[MIT](LICENSE)
