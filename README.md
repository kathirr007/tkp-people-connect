# TKP People Connect

A full-stack people and youth management application built with Nuxt 4, featuring dual database support, JWT authentication, role-based access control, bulk data import/export, and integrated AI capabilities including semantic search, a natural language data assistant, AI-powered email generation, and duplicate detection. Designed as a POC foundation for AI-powered people analytics and community management systems.

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
| **@google/generative-ai**        | Google Gemini API (chat + embeddings)                |
| **groq-sdk**                     | Groq API (fast inference, no embeddings)             |
| **ollama**                       | Local Ollama server (chat + embeddings)              |
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
│   │   ├── AiSearchPanel.vue     # Semantic search UI with debounced input & filters
│   │   ├── AiQueryPanel.vue      # Streaming chat interface for AI Data Assistant
│   │   ├── AiEmailComposer.vue   # AI email generation dialog (welcome/event/follow-up)
│   │   ├── AiDuplicateWarning.vue # Duplicate detection results dialog
│   │   └── ThemeToggle.vue       # Dark/light mode toggle
│   ├── composables/
│   │   ├── useAuth.ts            # Auth state, login, register, logout, password reset
│   │   ├── usePeople.ts          # TanStack Query hooks for People CRUD + bulk upload
│   │   ├── useYouth.ts           # TanStack Query hooks for Youth CRUD + bulk upload
│   │   ├── useDashboard.ts       # Dashboard stats query hook
│   │   ├── useToastMessages.ts   # PrimeVue toast helpers
│   │   ├── useAiSearch.ts        # Semantic search state & provider info
│   │   ├── useAiQuery.ts         # Streaming chat composable (SSE)
│   │   └── useAiEmail.ts         # AI email generation & send state
│   ├── layouts/
│   │   ├── default.vue           # Public layout (header + footer)
│   │   ├── dashboard.vue         # Sidebar + header layout (collapsible, mobile)
│   │   └── auth.vue              # Centered card layout for auth pages
│   ├── middleware/
│   │   └── role.ts               # Client-side role-based route guard
│   └── pages/                    # 18 pages (see Pages section)
├── server/                       # Backend (Nitro)
│   ├── api/                      # API routes
│   │   ├── auth/                 # 9 auth endpoints
│   │   ├── people/               # 7 people endpoints
│   │   ├── youth/                # 7 youth endpoints
│   │   ├── users/                # 2 user management endpoints
│   │   ├── dashboard/            # 1 stats endpoint
│   │   └── ai/                   # 8 AI endpoints
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
│       ├── ai/                    # AI provider abstraction layer
│       │   ├── client.ts          # AI client factory (auto-detect, provider selection)
│       │   └── providers/
│       │       ├── base.ts        # AiProviderClient interface
│       │       ├── gemini.ts      # Google Gemini (chat + embeddings)
│       │       ├── groq.ts        # Groq (chat only)
│       │       └── ollama.ts      # Ollama local (chat + embeddings)
│       ├── db.ts                 # Query layer (CRUD, pagination, search)
│       ├── jwt.ts                # JWT sign/verify with jose
│       ├── password.ts           # bcrypt hash/compare
│       ├── email.ts              # AWS SES email templates
│       ├── email-generator.ts    # AI-powered personalized email generation
│       ├── embeddings.ts         # Vector embedding store & cosine similarity search
│       ├── duplicate-detector.ts # AI duplicate detection via embeddings
│       ├── nl-query.ts           # Natural language to SQL conversion
│       ├── web-search.ts         # DuckDuckGo web search for query augmentation
│       ├── errors.ts             # Zod/auth/role error handlers
│       ├── file-parser.ts        # CSV/Excel/JSON parser with column mapping
│       └── validators.ts         # Zod schemas for all endpoints
├── shared/                       # Shared types and utilities
│   ├── types/
│   │   ├── api.ts                # PaginatedResponse, ApiSuccess/Error, DashboardStats
│   │   ├── auth.ts               # AuthUser, LoginCredentials, RegisterData
│   │   ├── people.ts             # Person, PersonFormData, Child, Education
│   │   ├── youth.ts              # Youth, YouthFormData, Activities, Achievements
│   │   └── ai.ts                 # AiProvider, SearchResult, DuplicateMatch, etc.
│   └── utils/
│       ├── age-calculator.ts     # calculateAgeFromDateOfBirth()
│       ├── phone.ts              # Phone validation via libphonenumber-js
│       └── roles.ts              # Role hierarchy, hasPermission()
├── scripts/
│   └── dev.ts                    # Interactive dev script (DB driver + port selector)
├── drizzle.config.ts             # Dual-dialect Drizzle config
├── nuxt.config.ts                # Nuxt 4 config (PrimeVue, security, rate limiting)
└── data/
    ├── database.sqlite           # SQLite database file (dev)
    └── embeddings.json           # Vector embeddings store (generated)
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
| AI Search        | `/ai/search`            | dashboard | Semantic search over people/youth records using vector embeddings                    |
| AI Assistant     | `/ai/query`             | dashboard | Natural language query interface (streaming chat with SQL generation)                |
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

### AI

| Method | Endpoint                  | Auth | Description                                           |
| ------ | ------------------------- | ---- | ----------------------------------------------------- |
| POST   | `/api/ai/search`          | Auth | Semantic search via vector embeddings (cosine sim)    |
| POST   | `/api/ai/query`           | Auth | Natural language query (non-streaming)                |
| POST   | `/api/ai/query-stream`    | Auth | Streaming chat (SSE) with SQL gen + web search        |
| GET    | `/api/ai/provider`        | Auth | Current AI provider info (name, model, availability)  |
| GET    | `/api/ai/providers`       | Auth | List available AI providers                           |
| POST   | `/api/ai/embeddings-sync` | Auth | Generate/store vector embeddings for all records      |
| POST   | `/api/ai/email-generate`  | Auth | AI-generated personalized emails (with optional send) |
| POST   | `/api/ai/duplicates`      | Auth | Detect duplicate records via embedding similarity     |

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** >= 8
- (Optional) **PostgreSQL** for production
- (Optional) **Ollama** for local AI (install from https://ollama.com)

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

# AI Provider (all free - no paid subscriptions needed)
# Options: "ollama" (local/free), "gemini" (free tier), "groq" (free tier), "auto" (auto-detect)
AI_PROVIDER=auto

# AI Embedding Provider (optional, defaults to same as AI_PROVIDER)
# Only needed when chat provider doesn't support embeddings (e.g., Groq)
AI_EMBED_PROVIDER=

# Ollama (100% free, runs locally - https://ollama.com)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBED_MODEL=nomic-embed-text
OLLAMA_CHAT_MODEL=llama3.1

# Google Gemini (free tier - https://aistudio.google.com/apikey)
GEMINI_API_KEY=
GEMINI_CHAT_MODEL=gemini-3.6-flash

# Groq (free tier - https://console.groq.com/keys)
GROQ_API_KEY=
GROQ_CHAT_MODEL=openai/gpt-oss-20b
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
- `server/utils/ai/client.ts` for AI provider access (`getAiClient()`, `getEmbeddingClient()`)
- `server/utils/embeddings.ts` for vector search operations

### 4. Adding New Pages

Create files in `app/pages/` following Nuxt file-based routing. Use existing composables (`useAuth`, `usePeople`, `useYouth`, `useAiSearch`, `useAiQuery`, `useAiEmail`) and layouts (`dashboard`, `auth`, `default`).

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

### 8. AI Provider Configuration

Set `AI_PROVIDER` in `.env` to switch between providers. The system auto-detects availability:

- **`auto`** (default) — Tries Ollama → Groq → Gemini in order
- **`ollama`** — Local, 100% free. Requires Ollama running with `nomic-embed-text` and `llama3.1` models pulled
- **`groq`** — Free tier (~1000 req/day), fast inference. No embedding support (use `AI_EMBED_PROVIDER=gemini` for embeddings)
- **`gemini`** — Free tier (20 req/day), supports both chat and embeddings

To add a new AI provider, implement the `AiProviderClient` interface in `server/utils/ai/providers/base.ts` and register it in `server/utils/ai/client.ts`.

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

### Multi-Provider AI Abstraction Layer

The `server/utils/ai/providers/` directory implements a provider pattern with a shared `AiProviderClient` interface. Ollama (local/free), Google Gemini (free tier), and Groq (free tier) all conform to the same contract. Auto-detection tries providers in order (Ollama → Groq → Gemini), and a separate embedding provider chain handles cases where the chat provider lacks embedding support (e.g., Groq). This pattern enables zero-cost AI in development while scaling to paid providers in production.

### Semantic Search via Vector Embeddings

People and youth records are embedded into vector space using the configured provider's embedding model. The `server/utils/embeddings.ts` module manages a JSON-based vector store with cosine similarity search. The `AiSearchPanel.vue` component provides debounced search with type filtering — demonstrating how traditional CRUD data becomes AI-searchable without a dedicated vector database.

### Natural Language to SQL (Streaming)

The AI Assistant classifies user queries as `database`, `web`, or `both`, then generates SQL from natural language using a schema-aware prompt. Results are formatted back into natural language and streamed to the client via Server-Sent Events. SQL safety validation restricts to SELECT-only queries and blocks dangerous keywords — a critical guardrail when AI agents generate database queries.

### AI-Powered Duplicate Detection

During bulk uploads, new records are compared against stored embeddings using cosine similarity. Scores ≥ 0.85 are flagged as "likely" duplicates, scores ≥ 0.70 as "possible". This pattern leverages semantic similarity rather than exact matching — useful for detecting records that are the same person with slightly different data entry.

### AI Email Generation with Contextual Personalization

The email generator builds personalized prompts from person data (name, village, education, activities) and generates contextually appropriate emails for different scenarios (welcome, event invitation, follow-up, custom). The output is structured JSON that the `AiEmailComposer.vue` component renders as a preview before optional sending via AWS SES.

### Web Search Augmentation

The streaming query endpoint integrates DuckDuckGo web search for queries classified as "web" or "both". Search results are fetched, summarized, and streamed alongside database results — demonstrating how AI assistants can combine internal data with external information in a single response.

## Known Limitations

1. **No test suite** — No unit, integration, or E2E tests are configured
2. **Dashboard organizations** — The dashboard references `totalOrganizations` and `byOrganization` but the schema has no `organization` field (incomplete/leftover from a different schema)
3. **People export** — References fields (`organization`, `designation`, `department`, `address.street`, `address.city`, `tags`) that don't exist in the current schema
4. **No Docker** — Deployment is configured for Vercel only; no containerization
5. **Auth middleware coverage** — Only some pages use the `role` middleware; the dashboard relies on server-side protection only

## License

[MIT](LICENSE)
