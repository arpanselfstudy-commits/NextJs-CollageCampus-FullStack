# CollageCampus Next.js Fullstack Project — Developer Onboarding Guide

This guide is written for junior React developers who are new to Next.js. If you know how to build a React SPA — components, hooks, state, props — you have everything you need to follow along. Over the course of 11 phases, you will learn how this project uses Next.js for both the frontend and the backend (the BFF pattern), how the backend architecture is structured, how security is handled, and how all the reusable patterns fit together. Read the phases in order for the full picture, or use the Table of Contents below to jump directly to a topic you need right now.

## Table of Contents

1. [Phase 1: Project Architecture Overview](#phase-1-project-architecture-overview)
2. [Phase 2: Next.js Core Concepts Used](#phase-2-nextjs-core-concepts-used)
3. [Phase 3: Next.js Optimizations Implemented](#phase-3-nextjs-optimizations-implemented)
4. [Phase 4: Backend Architecture (BFF Pattern)](#phase-4-backend-architecture-bff-pattern)
5. [Phase 5: Forms and Data Flow](#phase-5-forms-and-data-flow)
6. [Phase 6: Reusable Architecture Patterns](#phase-6-reusable-architecture-patterns)
7. [Phase 7: Admin Panel (Separate React App)](#phase-7-admin-panel-separate-react-app)
8. [Phase 8: Security Design](#phase-8-security-design)
9. [Phase 9: Real Feature Walkthroughs](#phase-9-real-feature-walkthroughs)
10. [Phase 10: React Developer → Next.js Transition Guide](#phase-10-react-developer--nextjs-transition-guide)
11. [Phase 11: Learning Roadmap](#phase-11-learning-roadmap)

---

## Phase 1: Project Architecture Overview

Before touching a single file, you need a mental map of the whole system. This phase answers: what are the moving parts, how do they connect, and why is the project structured the way it is?

---

### 1.1 The Big Picture — System Architecture

**What** is this system?

CollageCampus is a fullstack web application built with Next.js. It has three distinct runtime environments that talk to each other:

1. **The Next.js app** — serves both the React UI and the backend API from a single process on `localhost:3000`.
2. **The Admin Panel** — a completely separate React SPA (not in this repo) running on `localhost:5173` or `localhost:5174`.
3. **MongoDB** — the primary database, accessed only from the Next.js server side via Mongoose.

There is also an optional external CollageCampus Express API (a separate Node.js/Express backend). The Next.js app can proxy or delegate certain operations to it, but the core auth, marketplace, jobs, and shops logic lives entirely inside this Next.js project.

**Why** does this architecture exist?

The key insight is that Next.js lets you run server-side code (Route Handlers) in the same process as your React pages. This means you don't need a separate Express server for most operations — Next.js IS the backend. This is the BFF (Backend-for-Frontend) pattern, explained in detail in section 1.2.

**How** does it all connect?

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                      │
│                                                                           │
│   Next.js React Pages              Admin Panel (separate React SPA)       │
│   src/app/(auth)/                  localhost:5173 / localhost:5174        │
│   src/app/(protected)/                                                    │
│         │                                      │                          │
│         │  withCredentials: true               │  withCredentials: true   │
└─────────┼──────────────────────────────────────┼──────────────────────────┘
          │                                      │
          ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APP  (localhost:3000)                          │
│                                                                           │
│  src/proxy.ts ──► CORS guard + root redirect  (runs on every request)    │
│                                                                           │
│  src/app/(auth)/       ──► Public pages: login, register, reset-password │
│  src/app/(protected)/  ──► Authenticated pages: jobs, shops, marketplace │
│                                                                           │
│  src/app/api/          ──► Route Handlers  (BFF layer)                   │
│    /api/auth           ──► login, register, refresh, logout, profile     │
│    /api/jobs           ──► Jobs CRUD                                     │
│    /api/shops          ──► Shops CRUD                                    │
│    /api/listed-products    ──► Marketplace listings                      │
│    /api/requested-products ──► Marketplace requests                      │
│    /api/cms            ──► Content management (admin)                    │
│    /api/users          ──► User management (admin)                       │
│    /api/swagger        ──► API documentation                             │
│    /api/health         ──► Health check                                  │
│                                                                           │
│  src/backend/          ──► Server-only: services, models, validators     │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    MONGODB  (via Mongoose)                                │
│   Collections: User, RefreshToken, Shop, Job,                            │
│                ListedProduct, RequestedProduct, Cms                      │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              EXTERNAL CollageCampus Express API  (optional)              │
│              (separate Node.js/Express backend — not this project)       │
└─────────────────────────────────────────────────────────────────────────┘
```

**When** do you need to think about this diagram?

Every time you add a new feature. Ask yourself: does this logic belong in a Route Handler (`src/app/api/`), a service (`src/backend/services/`), or a React page (`src/app/(protected)/`)? The diagram tells you which layer owns what.

---

### 1.2 The BFF Pattern — Why Next.js IS the Backend

**What** is BFF?

BFF stands for Backend-for-Frontend. Instead of your React pages calling an external API directly, they call Route Handlers that live inside the same Next.js process. Those Route Handlers then talk to MongoDB (and optionally the external Express API). The Next.js app acts as both the frontend server and the backend API.

**Why** use BFF instead of calling an external API from the browser?

Three reasons:

1. **Security** — Tokens, database credentials, and secrets never leave the server. The browser only ever talks to `localhost:3000/api/*`. It never sees a MongoDB connection string or a JWT secret.
2. **Cookie-based auth** — httpOnly cookies (which store the access and refresh tokens) can only be sent to the same origin or a CORS-allowed origin. Having the API on the same domain as the frontend makes this seamless.
3. **Flexibility** — The Route Handlers can aggregate data from multiple sources (MongoDB + external API) and return a single clean response to the browser. The browser doesn't need to know about the internal data sources.

**How** does it work in practice?

When the browser calls `POST /api/auth/login`, it hits a Route Handler at `src/app/api/auth/login/route.ts`. That handler validates the request, calls `loginUser()` from `src/backend/services/auth.service.ts`, which queries MongoDB via Mongoose, and then sets httpOnly cookies on the response. The browser never touches MongoDB directly.

```
Browser
  │
  │  POST /api/auth/login  (same origin — no CORS needed)
  ▼
Next.js Route Handler  (src/app/api/auth/login/route.ts)
  │
  │  calls loginUser()
  ▼
Auth Service  (src/backend/services/auth.service.ts)
  │
  │  queries User collection
  ▼
MongoDB
  │
  │  returns user document
  ▼
Route Handler sets httpOnly cookies → returns { success: true, data: user }
  │
  ▼
Browser receives response + cookies are set automatically
```

**When** does the Admin Panel fit in?

The Admin Panel is a separate React SPA on a different port. It is NOT the same origin as `localhost:3000`, so it needs CORS headers to call the Route Handlers. `src/proxy.ts` handles this — it whitelists the Admin Panel's origins and attaches the correct CORS headers. The Admin Panel uses the same Route Handlers as the Next.js frontend; there is no separate admin API.

---

### 1.3 Folder Structure — What Lives Where

**What** are the top-level directories under `src/`?

```
src/
├── app/            ← Next.js App Router: pages, layouts, Route Handlers
├── backend/        ← Server-only code: services, models, validators, DB
├── modules/        ← Feature modules: each feature owns its own slice
├── lib/            ← Shared infrastructure: Axios, React Query, Zustand
├── components/     ← Shared React components: common UI + layout wrappers
├── utils/          ← Shared utilities and static constants
├── styles/         ← Global CSS: variables, utilities, design tokens
└── proxy.ts        ← Next.js middleware (renamed): CORS + root redirect
```

**Why** is the code split this way?

Each directory has a single responsibility. `src/backend/` is server-only — nothing in there should ever be imported by a React component. `src/modules/` co-locates everything a feature needs (API calls, hooks, components, types) so you can find all the code for "jobs" in one place. `src/lib/` holds infrastructure that multiple modules share (the Axios client, React Query setup, Zustand factories).

**How** does each directory work?

| Directory | Purpose | Example files |
|---|---|---|
| `src/app/` | Next.js routing — pages, layouts, Route Handlers | `(auth)/login/page.tsx`, `api/auth/login/route.ts` |
| `src/backend/` | Server-only backend logic | `services/auth.service.ts`, `models/user.model.ts` |
| `src/modules/` | Feature-scoped code (API, hooks, components, types) | `modules/jobs/hooks/useJobs.ts`, `modules/auth/api/auth.api.ts` |
| `src/lib/` | Shared infrastructure libraries | `lib/axios/axiosClient.ts`, `lib/react-query/createQuery.ts` |
| `src/components/` | Shared React UI components | `components/common/`, `components/layouts/` |
| `src/utils/` | Static constants and utility functions | `utils/globalStaticData.ts` |
| `src/styles/` | Global CSS architecture | `styles/variables.css`, `styles/design.css` |

**When** do you add something to each directory?

- New page or API endpoint → `src/app/`
- New database model or service → `src/backend/`
- New feature (jobs, shops, etc.) → `src/modules/{feature}/`
- New shared hook or client config → `src/lib/`
- New reusable UI component → `src/components/common/`
- New app-wide constant → `src/utils/globalStaticData.ts`

---

### 1.4 Route Groups — `(auth)` and `(protected)`

**What** are route groups?

In Next.js App Router, any folder name wrapped in parentheses — like `(auth)` or `(protected)` — is a **route group**. The parentheses tell Next.js: "this folder organises files but does NOT add a URL segment."

So `src/app/(auth)/login/page.tsx` maps to the URL `/login`, not `/auth/login`. The `(auth)` part is invisible in the URL.

**Why** use route groups?

Two reasons:

1. **Separate layouts** — Each route group can have its own `layout.tsx`. Pages inside `(auth)` get the auth layout (centered card, no sidebar). Pages inside `(protected)` get the protected layout (sidebar, navbar, auth guard). Without route groups, you'd need to manually apply layouts in every page file.
2. **Logical organisation** — It's immediately clear which pages require authentication (`(protected)`) and which don't (`(auth)`).

**How** does it work in this project?

```
src/app/
├── (auth)/
│   ├── layout.tsx          ← Applied to ALL pages in (auth)
│   ├── login/page.tsx      ← URL: /login
│   ├── register/page.tsx   ← URL: /register
│   └── forgot-password/page.tsx  ← URL: /forgot-password
│
└── (protected)/
    ├── layout.tsx          ← Applied to ALL pages in (protected)
    ├── jobs/page.tsx       ← URL: /jobs
    ├── shops/page.tsx      ← URL: /shops
    └── marketplace/page.tsx ← URL: /marketplace
```

The `(protected)/layout.tsx` is where the auth guard lives — it checks whether the user is authenticated and redirects to `/login` if not. Every page inside `(protected)` gets this check automatically, without any per-page code.

**When** do you add a new page to `(auth)` vs `(protected)`?

- Public page (no login required) → `src/app/(auth)/`
- Authenticated page (login required) → `src/app/(protected)/`

---

### 1.5 Technology Stack

**What** technologies does this project use?

| Technology | Version | Role |
|---|---|---|
| Next.js App Router | 16.2.1 | Full-stack framework — routing, SSR, Route Handlers |
| React | 19.2.4 | UI rendering |
| TypeScript | ^5 | Type safety across frontend and backend |
| Tailwind CSS | ^4 | Utility-first styling |
| Zustand | ^5.0.12 | Client-side state management (auth session, UI state) |
| React Query (`@tanstack/react-query`) | ^5.95.2 | Server-state caching, background refetch, loading/error states |
| Axios | ^1.13.6 | HTTP client for calling Route Handlers from the browser |
| Zod | ^4.3.6 | Schema validation for Route Handler request bodies (server-side) |
| Yup | ^1.7.1 | Schema validation for form inputs (client-side, with react-hook-form) |
| Mongoose | ^9.4.1 | MongoDB ODM — models, queries, connection management |
| JWT (`jsonwebtoken`) | ^9.0.3 | Access token and refresh token signing/verification |
| Nodemailer | ^8.0.5 | Sending password reset emails |
| bcryptjs | ^3.0.3 | Password hashing |
| react-hook-form | ^7.72.1 | Form state management |
| react-hot-toast | ^2.6.0 | Toast notifications |

**Why** this combination?

- **Next.js + React Query** replaces the need for a separate Express server AND eliminates `useEffect`-based data fetching. React Query handles caching, loading states, and background refetching automatically.
- **Zustand** is used only for client-side state that doesn't come from the server (e.g., the current user session after login). It's lightweight and avoids Redux boilerplate.
- **Zod on the server + Yup on the client** is a deliberate split: Zod is better for server-side schema validation (strict, composable), while Yup integrates more naturally with `react-hook-form` via `@hookform/resolvers`.
- **httpOnly cookies + JWT** instead of `localStorage` tokens prevents XSS attacks from stealing auth tokens (covered in depth in Phase 8).

**How** do these technologies interact?

```
User fills form
      │
      ▼
react-hook-form + Yup  ──► validates input client-side
      │
      ▼
React Query mutation  ──► calls Axios
      │
      ▼
Axios (axiosClient)  ──► POST /api/auth/login  (withCredentials: true)
      │
      ▼
Next.js Route Handler  ──► Zod validates body  ──► calls service
      │
      ▼
Mongoose  ──► queries MongoDB
      │
      ▼
JWT  ──► signs tokens  ──► Nodemailer (if needed)
      │
      ▼
Response + httpOnly cookies set  ──► Zustand store updated in browser
```

**When** do you need to know which library does what?

When debugging. If a form field shows an error before submission, that's Yup. If the API returns a 400 with `VALIDATION_ERROR`, that's Zod. If data appears stale or doesn't refresh, that's React Query cache config. If the user gets logged out unexpectedly, that's JWT expiry or cookie handling.

---

### 1.6 `src/proxy.ts` — The Renamed Middleware

**What** is `src/proxy.ts`?

It is the Next.js middleware file — the code that runs on every incoming request before it reaches any page or Route Handler. In a standard Next.js project this file is called `middleware.ts`. In this project it is named `proxy.ts` and re-exported via a `matcher` config.

Here is the actual file:

```typescript
// src/proxy.ts
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',  // Admin Panel dev port
  'http://localhost:5174',  // Admin Panel alt dev port
]

function setCorsHeaders(res: NextResponse, origin: string) {
  res.headers.set('Access-Control-Allow-Origin', origin)
  res.headers.set('Access-Control-Allow-Credentials', 'true')
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const origin = req.headers.get('origin') ?? ''

  // Handle CORS for /api/* routes
  if (pathname.startsWith('/api/')) {
    const isAllowed = ALLOWED_ORIGINS.includes(origin)
    if (req.method === 'OPTIONS') {
      const res = new NextResponse(null, { status: 204 })
      if (isAllowed) setCorsHeaders(res, origin)
      return res
    }
    const res = NextResponse.next()
    if (isAllowed) setCorsHeaders(res, origin)
    return res
  }

  // Redirect root to landing/dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/landing', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
```

**Why** is it named `proxy.ts` instead of `middleware.ts`?

Next.js looks for a file named exactly `middleware.ts` (or `middleware.js`) at the `src/` root to run as middleware. This project exports the function as `proxy` and the file is named `proxy.ts` — but Next.js still picks it up because the `config.matcher` export is present and the file is at the correct location. The name `proxy` better describes what the file actually does: it acts as a reverse proxy layer that intercepts requests, applies CORS headers, and redirects the root path. It's a naming convention choice for clarity.

**How** does it work?

Every request that matches the `matcher` pattern (everything except static assets) passes through `proxy()` before reaching any page or Route Handler:

```
Incoming request
      │
      ▼
src/proxy.ts  (runs first, always)
      │
      ├── /api/* ?
      │     ├── OPTIONS (preflight) → return 204 + CORS headers
      │     └── other methods → NextResponse.next() + CORS headers if origin is allowed
      │
      ├── pathname === '/' ?
      │     └── redirect to /landing
      │
      └── everything else → NextResponse.next()  (pass through)
```

**When** do you need to modify `proxy.ts`?

- Adding a new allowed origin (e.g., a new Admin Panel deployment URL) → add to `ALLOWED_ORIGINS`
- Changing the root redirect destination → update the `NextResponse.redirect` call
- Adding global request headers or auth checks that apply to all routes → add logic before the `return NextResponse.next()` calls



---

## Phase 2: Next.js Core Concepts Used

Coming from React SPAs, the biggest mental shift is understanding that Next.js has opinions about file names, folder structure, and where code runs. This phase maps those opinions to the actual files in this project.

---

### 2.1 App Router File Conventions

**What** are file conventions?

The App Router treats certain filenames as special. Drop a file with the right name into a folder and Next.js automatically wires it up — no route config, no imports needed. The five conventions used in this project are:

| Filename | Purpose | Example in this project |
|---|---|---|
| `page.tsx` | The UI for a route — what the user sees | `src/app/(protected)/jobs/page.tsx` → `/jobs` |
| `layout.tsx` | Wraps all pages in a folder (and sub-folders) | `src/app/(protected)/layout.tsx` → auth guard for all protected pages |
| `loading.tsx` | Shown automatically while the page is loading (Suspense boundary) | `src/app/(protected)/jobs/loading.tsx` |
| `error.tsx` | Shown when an unhandled error is thrown in the route | `src/app/(protected)/error.tsx` |
| `route.ts` | A Route Handler — server-side HTTP endpoint (no UI) | `src/app/api/auth/login/route.ts` |

**Why** do these conventions exist?

They eliminate boilerplate. In a React SPA you'd manually configure a router, wrap routes in error boundaries, and add loading spinners per component. Next.js does all of that automatically when it sees the right filename. The file IS the configuration.

**How** does Next.js resolve them?

Next.js scans the `src/app/` directory tree. For any given URL, it collects the nearest `layout.tsx` files from the root down to the matched segment, then renders the `page.tsx` inside them. If the page throws, it falls back to the nearest `error.tsx`. While the page is loading, it shows the nearest `loading.tsx`.

```
URL: /jobs

src/app/
├── layout.tsx          ← 1st layout applied (root — fonts, providers)
└── (protected)/
    ├── layout.tsx      ← 2nd layout applied (auth guard, header, footer)
    ├── loading.tsx     ← shown while jobs/page.tsx is loading
    ├── error.tsx       ← shown if jobs/page.tsx throws
    └── jobs/
        ├── loading.tsx ← overrides parent loading.tsx for /jobs specifically
        ├── error.tsx   ← overrides parent error.tsx for /jobs specifically
        └── page.tsx    ← the actual /jobs page content
```

**When** do you create each file?

- New page → `page.tsx`
- Shared wrapper (nav, auth check, providers) → `layout.tsx`
- Loading skeleton for a route → `loading.tsx`
- Custom error UI for a route → `error.tsx`
- New API endpoint → `route.ts` inside `src/app/api/`

---

### 2.2 Server Components vs Client Components

**What** is the difference?

By default, every component in the App Router is a **Server Component** — it runs only on the server, never in the browser. It can `await` database calls, read environment variables, and import server-only packages. It produces HTML that is sent to the browser.

A **Client Component** is marked with `'use client'` at the top of the file. It runs in the browser (and also during SSR for the initial render). It can use React hooks (`useState`, `useEffect`, `useRef`), browser APIs, and event handlers.

**Why** does this distinction matter?

Server Components can't use hooks or browser APIs. Client Components can't directly access the database or server secrets. The `'use client'` directive is the boundary — everything in a file marked `'use client'` (and everything it imports) runs in the browser.

**How** does this project use the boundary?

```
src/app/layout.tsx                    ← Server Component (no 'use client')
  └── renders <Providers>             ← Client Component (React Query, Zustand)
        └── renders page children

src/app/(auth)/login/page.tsx         ← Server Component (no 'use client')
  └── renders <LoginClient />         ← Client Component ('use client')
        └── dynamic import of LoginPage (ssr: false)

src/app/(protected)/layout.tsx        ← Client Component ('use client')
  └── uses useEffect, useState, useRouter, useAuthStore
```

Files that use `'use client'` in this project and why:

| File | Why `'use client'` is needed |
|---|---|
| `src/app/(protected)/layout.tsx` | Uses `useEffect`, `useState`, `useRouter` (navigation), and `useAuthStore` (Zustand) — all browser-only APIs |
| `src/app/(auth)/login/LoginClient.tsx` | Uses `next/dynamic` with `ssr: false` — dynamic imports with SSR disabled must run in the browser |
| `src/app/(protected)/error.tsx` | Error boundaries must be Client Components — React requires it |
| `src/app/(protected)/jobs/error.tsx` | Same reason — error boundaries are always `'use client'` |

Files that do NOT use `'use client'` (Server Components):

| File | Why it stays a Server Component |
|---|---|
| `src/app/layout.tsx` | Only sets up fonts, metadata, and renders `<Providers>` — no hooks needed |
| `src/app/(auth)/login/page.tsx` | Just renders `<LoginClient />` — no hooks, no browser APIs |
| `src/app/(protected)/jobs/[id]/page.tsx` | Fetches data server-side with `getJobById()` and passes it to the client via `HydrationBoundary` |

**When** do you add `'use client'`?

Add it when your component needs any of: `useState`, `useEffect`, `useRef`, `useContext`, event handlers (`onClick`, `onChange`), browser APIs (`window`, `document`, `localStorage`), or third-party hooks that use any of the above. If none of those apply, leave it as a Server Component.

---

### 2.3 Route Groups — `(auth)` and `(protected)`

**What** are route groups?

A folder name wrapped in parentheses is a **route group**. The parentheses are stripped from the URL — they exist only to organise files and apply separate layouts.

**Why** use them?

Without route groups, every page would share a single root layout. Route groups let you apply different layouts to different sections of the app without affecting URLs. `(auth)` pages get a minimal layout (no sidebar, no auth check). `(protected)` pages get the full layout with the auth guard.

**How** are they structured in this project?

```
src/app/
├── layout.tsx                        ← Root layout (fonts, providers) — all pages
│
├── (auth)/
│   ├── layout.tsx                    ← Auth layout (footer only, no auth guard)
│   ├── login/
│   │   └── page.tsx                  ← URL: /login
│   ├── register/
│   │   └── page.tsx                  ← URL: /register
│   ├── forgot-password/
│   │   └── page.tsx                  ← URL: /forgot-password
│   └── reset-password/
│       ├── page.tsx                  ← URL: /reset-password
│       └── [token]/
│           └── page.tsx              ← URL: /reset-password/abc123
│
└── (protected)/
    ├── layout.tsx                    ← Protected layout (auth guard, header, footer)
    ├── landing/
    │   └── page.tsx                  ← URL: /landing
    ├── jobs/
    │   ├── page.tsx                  ← URL: /jobs
    │   └── [id]/
    │       └── page.tsx              ← URL: /jobs/123
    ├── shops/
    │   └── page.tsx                  ← URL: /shops
    └── marketplace/
        └── page.tsx                  ← URL: /marketplace
```

The `(protected)/layout.tsx` wraps every page inside `(protected)/` — so the auth guard runs automatically for `/jobs`, `/shops`, `/marketplace`, and every other protected page. You never need to add auth checks to individual pages.

**When** do you add a page to `(auth)` vs `(protected)`?

- Page requires login → `src/app/(protected)/`
- Page is public (login, register, password reset) → `src/app/(auth)/`

---

### 2.4 Dynamic Routes — `[id]` and `[token]`

**What** are dynamic routes?

A folder name wrapped in square brackets — like `[id]` or `[token]` — is a **dynamic segment**. It matches any value in that URL position and makes the value available to the page or Route Handler as a parameter.

**Why** use them?

You can't create a separate page file for every job ID or every password reset token. Dynamic segments let one file handle all values: `/jobs/1`, `/jobs/2`, `/jobs/abc` all resolve to the same `[id]/page.tsx`.

**How** do they work in this project?

Two examples from the actual codebase:

**Example 1 — Page route:**

```
src/app/(protected)/jobs/[id]/page.tsx
```
URL pattern: `/jobs/{any-id}` → e.g., `/jobs/123`, `/jobs/abc456`

```typescript
// src/app/(protected)/jobs/[id]/page.tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // id is "123" when URL is /jobs/123
  const qc = makeServerQueryClient()
  try {
    const job = await getJobById(id)
    qc.setQueryData(queryKeys.jobs.byId(id), JSON.parse(JSON.stringify(job)))
  } catch {
    notFound()
  }
  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <JobDetailPage />
    </HydrationBoundary>
  )
}
```

**Example 2 — Route Handler:**

```
src/app/api/auth/reset-password/[token]/route.ts
```
URL pattern: `/api/auth/reset-password/{any-token}` → e.g., `/api/auth/reset-password/abc123`

```typescript
// src/app/api/auth/reset-password/[token]/route.ts
export const POST = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ token: string }> }) => {
    const { token } = await params
    const body = await req.json()
    const data = validate(resetPasswordSchema, body)
    await resetPassword(token, data.password)
    return sendSuccess(null, 'Password reset successful')
  }
)
```

Note: In Next.js 15+, `params` is a `Promise` — you must `await` it before accessing the values.

```
Dynamic segment resolution:

URL: /jobs/abc123
         │
         └── matches [id] segment
               │
               ▼
         params = { id: "abc123" }
               │
               ▼
         const { id } = await params
         // id === "abc123"
```

**When** do you use dynamic routes?

Whenever a URL contains a variable part — a resource ID, a slug, a token, a username. If the URL pattern is `/something/{variable}`, you need a `[variable]` folder.

---

### 2.5 `next/dynamic` with `ssr: false`

**What** is `next/dynamic`?

`next/dynamic` is Next.js's code-splitting import. It works like `React.lazy` but with extra options — most importantly `ssr: false`, which tells Next.js: "do not render this component on the server at all."

**Why** is `ssr: false` used in `LoginClient.tsx`?

The `LoginPage` component (inside `src/modules/auth/pages/LoginPage.tsx`) uses Zustand stores and browser-specific hooks. Rendering it on the server would cause a **hydration mismatch** — the server-rendered HTML would differ from what the browser renders after Zustand hydrates from `localStorage`. Setting `ssr: false` skips server rendering entirely for this component, so the first render always happens in the browser where Zustand state is available.

**How** is it implemented?

Here is the actual code from `src/app/(auth)/login/LoginClient.tsx`:

```typescript
'use client'

import dynamic from 'next/dynamic'

const LoginPage = dynamic(() => import('@/modules/auth/pages/LoginPage'), {
  ssr: false,
  loading: () => null,
})

export default function LoginClient() {
  return <LoginPage />
}
```

And `src/app/(auth)/login/page.tsx` (a Server Component) simply renders it:

```typescript
import { Metadata } from 'next'
import LoginClient from './LoginClient'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Login',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <LoginClient />
}
```

The two-file split is intentional:
- `page.tsx` is a Server Component — it can export `metadata` and `dynamic = 'force-static'`
- `LoginClient.tsx` is a Client Component — it handles the dynamic import with `ssr: false`

```
Request for /login:

Server renders page.tsx
  └── renders <LoginClient /> shell (no LoginPage HTML yet)
        │
        ▼
Browser receives HTML (LoginPage is absent — ssr: false)
        │
        ▼
Browser loads LoginClient.tsx JS bundle
        │
        ▼
dynamic() triggers lazy import of LoginPage
        │
        ▼
LoginPage renders in browser (Zustand is hydrated, no mismatch)
```

**When** should you use `ssr: false`?

Use it when a component:
- Reads from `localStorage` or `sessionStorage` on mount
- Uses a Zustand store that persists to `localStorage` (hydration mismatch risk)
- Uses browser-only APIs (`window`, `navigator`, `document`) at the top level
- Imports a library that breaks during SSR (e.g., chart libraries, map libraries)

Do NOT use it as a default — it disables SSR for that component, which means slower perceived load time and no server-rendered HTML for that section.

---

### 2.6 Font Optimization — `next/font/google`

**What** is `next/font/google`?

`next/font/google` is Next.js's built-in font system. It downloads Google Fonts at build time, self-hosts them alongside your app, and injects them as CSS variables — with zero layout shift.

**Why** use it instead of a `<link>` tag?

A standard Google Fonts `<link>` tag causes the browser to make an extra network request to `fonts.googleapis.com` during page load. This blocks rendering and causes **Cumulative Layout Shift (CLS)** — the page jumps when the font loads. `next/font/google` eliminates both problems: the font is served from your own domain (no extra request) and `display: 'swap'` ensures text is visible immediately using a fallback font.

**How** is it implemented in this project?

Here is the actual code from `src/app/layout.tsx`:

```typescript
import { Geist, Geist_Mono } from 'next/font/google'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

Two things to notice:

1. **`variable: '--font-geist-sans'`** — This creates a CSS custom property. You can then use `var(--font-geist-sans)` anywhere in your CSS, or reference it via Tailwind's `font-sans` class (if configured).
2. **`display: 'swap'`** — The browser shows text immediately using a system fallback font, then swaps to Geist once it loads. This prevents invisible text during font load (FOIT — Flash of Invisible Text).

```
Build time:
  next/font downloads Geist + Geist_Mono from Google
        │
        ▼
  Fonts stored in .next/static/media/
        │
        ▼
  CSS variables injected into <html> element:
  class="__variable_abc123 __variable_def456"
        │
        ▼
Runtime:
  Browser loads fonts from same origin (no external request)
  Text renders immediately with fallback → swaps to Geist
```

**When** do you add a new font?

Only if the design system requires it. Import from `next/font/google`, assign a CSS variable, and add the variable class to `<html>`. Never use a `<link>` tag for fonts in this project.

---

### 2.7 Metadata API

**What** is the Metadata API?

Next.js provides a built-in way to set `<title>`, `<meta>`, and Open Graph tags from Server Components. You export a `metadata` object (or an async `generateMetadata` function) from any `page.tsx` or `layout.tsx`, and Next.js injects the correct `<head>` tags automatically.

**Why** use it instead of `<head>` tags?

In a React SPA you'd use a library like `react-helmet` to manage `<head>` tags. In Next.js, the Metadata API is built in, works with SSR (so search engines see the correct title), and supports a `template` pattern that automatically combines page-level titles with a site-wide suffix.

**How** does the template pattern work in this project?

The root layout (`src/app/layout.tsx`) defines the template:

```typescript
export const metadata: Metadata = {
  title: {
    template: '%s | Campus App',
    default: 'Campus App',
  },
  description: 'Your campus marketplace for products, shops, and jobs.',
  openGraph: {
    title: 'Campus App',
    description: 'Your campus marketplace for products, shops, and jobs.',
  },
}
```

The `template: '%s | Campus App'` means: take whatever title a page exports, substitute it for `%s`, and append `| Campus App`. The `default: 'Campus App'` is used when a page exports no title.

A page then exports just its own title:

```typescript
// src/app/(auth)/login/page.tsx
export const metadata: Metadata = {
  title: 'Login',
  robots: { index: false, follow: false },
}
```

Next.js combines them automatically:

```
Page exports:    title: 'Login'
Template:        '%s | Campus App'
                      │
                      ▼
Browser <title>: 'Login | Campus App'
```

For dynamic pages, `generateMetadata` is used instead:

```typescript
// src/app/(protected)/jobs/[id]/page.tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const job = await getJobById(id)
  return {
    title: job.jobName,   // e.g. "Senior Frontend Engineer"
    // → browser title: "Senior Frontend Engineer | Campus App"
  }
}
```

**When** do you add metadata to a page?

Every `page.tsx` should export either `metadata` (static) or `generateMetadata` (dynamic). At minimum, set `title`. For auth pages, also set `robots: { index: false, follow: false }` to prevent search engines from indexing login/register pages.


---

## Phase 3: Next.js Optimizations Implemented

Coming from a React SPA, you're used to Webpack configs and manual bundle tweaks. Next.js centralises most of that in `next.config.ts` and a handful of library settings. This phase walks through every production optimization in this project — what it does, why it was chosen, and when you'd touch it.

---

### 3.1 `next.config.ts` Optimizations

**What** is `next.config.ts`?

It is the single configuration file for the entire Next.js build pipeline. Every option here affects how the app is compiled, served, and deployed. Here is the actual file:

```typescript
// next.config.ts
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  compress: true,
  output: "standalone",
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "loremflickr.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
```

**Why** each option?

| Option | What it does | Why it's here |
|---|---|---|
| `compress: true` | Enables gzip/brotli compression for all HTTP responses served by Next.js | Reduces payload size over the wire — HTML, JS, CSS, and JSON responses are all compressed before leaving the server |
| `output: 'standalone'` | Produces a self-contained build in `.next/standalone/` that includes only the files needed to run the app | Required for Docker/containerised deployment — the standalone output can be copied into a minimal Docker image without `node_modules` |
| `experimental.optimizePackageImports: ['lucide-react']` | Tells Next.js to tree-shake `lucide-react` at build time, bundling only the icons actually imported | `lucide-react` ships hundreds of icons; without this, the entire icon library would be included in the bundle even if you only use five icons |
| `images.remotePatterns` | Whitelists external image hostnames that `next/image` is allowed to optimise | `next/image` refuses to proxy and optimise images from unknown domains by default — this is a security measure to prevent your server from being used as an open image proxy |

**How** does each option work internally?

- `compress: true` — Next.js passes responses through Node's `zlib` module before sending them. The browser signals support via the `Accept-Encoding` header; Next.js picks gzip or brotli accordingly.
- `output: 'standalone'` — After `npm run build`, Next.js traces all `require()` calls and copies only the necessary `node_modules` into `.next/standalone/`. The result is a folder you can `node server.js` directly.
- `optimizePackageImports` — Next.js rewrites `import { X } from 'lucide-react'` into a direct path import (`import X from 'lucide-react/dist/esm/icons/x'`) so the bundler can drop everything else.
- `remotePatterns` — When `<Image src="https://images.pexels.com/...">` is rendered, Next.js checks the hostname against this list before proxying the image through its optimisation pipeline (resize, convert to WebP/AVIF, cache).

```
Build pipeline overview:

next.config.ts
      │
      ├── compress: true ──────────────► gzip/brotli on all responses
      │
      ├── output: standalone ──────────► .next/standalone/ (Docker-ready)
      │
      ├── optimizePackageImports ──────► tree-shake lucide-react icons
      │
      └── images.remotePatterns ───────► whitelist for next/image proxy
```

**When** do you modify this file?

- Adding a new image CDN domain → add an entry to `remotePatterns`
- Deploying to a new environment that doesn't use Docker → you might remove `output: 'standalone'`
- Adding another large icon/component library → add it to `optimizePackageImports`
- Disabling compression (e.g., a reverse proxy like nginx already handles it) → set `compress: false`

---

### 3.2 Bundle Analyzer

**What** is `@next/bundle-analyzer`?

It is a Next.js plugin that wraps your build with `webpack-bundle-analyzer`. After a build it opens an interactive treemap in your browser showing every module in every JS chunk — their sizes, their dependencies, and how much of each package is actually used.

**Why** use it?

Bundle size directly affects Time to Interactive (TTI). A large initial JS bundle means the browser has to download, parse, and execute more code before the page becomes interactive. The bundle analyzer lets you see exactly which packages are bloating your bundle so you can tree-shake, lazy-load, or replace them.

**How** is it set up?

The setup is already in `next.config.ts`:

```typescript
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
```

The analyzer is only active when `ANALYZE=true` is set — it has zero cost in normal builds. To run it:

```bash
ANALYZE=true npm run build
```

This produces a normal production build AND opens two HTML files in your browser:

- `client.html` — the client-side bundle treemap (what the browser downloads)
- `server.html` — the server-side bundle treemap (what runs in Node.js)

```
ANALYZE=true npm run build
      │
      ▼
Normal .next/ build output
      │
      ▼
.next/analyze/client.html  ──► opens in browser (client bundle treemap)
.next/analyze/server.html  ──► opens in browser (server bundle treemap)

Treemap shows:
┌──────────────────────────────────────────────────────┐
│  node_modules/                                        │
│  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │  react-dom       │  │  @tanstack/react-query   │  │
│  │  (large)         │  │  (medium)                │  │
│  └──────────────────┘  └──────────────────────────┘  │
│  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │  lucide-react    │  │  your app code           │  │
│  │  (small — ✓)     │  │  (small)                 │  │
│  └──────────────────┘  └──────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

**When** should you run it?

- Before a production release to check for unexpected large dependencies
- After adding a new npm package to see how much it adds to the bundle
- When a Lighthouse audit flags a high "Total Blocking Time" or large JS payload
- When `lucide-react` or another icon library appears suspiciously large (means `optimizePackageImports` may not be working)

---

### 3.3 React Query Caching Strategy

**What** is the React Query cache config?

React Query caches every server response in memory. The cache behaviour is controlled by four settings defined in `src/lib/react-query/queryClient.ts`:

```typescript
// src/lib/react-query/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 minutes
      gcTime:    1000 * 60 * 10,  // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

**Why** these specific values?

This is a campus marketplace — jobs, shops, and product listings change occasionally, but not every second. The values were chosen to balance freshness against unnecessary network requests:

| Setting | Value | Reasoning |
|---|---|---|
| `staleTime: 5 minutes` | Data is considered fresh for 5 minutes after it was fetched | A job listing or shop detail is unlikely to change in the 5 minutes a user spends browsing. No background refetch is triggered during this window. |
| `gcTime: 10 minutes` | Unused cache entries are garbage-collected after 10 minutes | If a user navigates away from `/jobs` and comes back within 10 minutes, the cached data is still available for an instant render while a background refetch runs. |
| `retry: 1` | Failed requests are retried once before showing an error | One retry handles transient network blips without hammering the server on a genuine outage. |
| `refetchOnWindowFocus: false` | React Query does NOT refetch when the browser tab regains focus | The default behaviour (refetch on focus) causes jarring re-renders when a user alt-tabs back to the app. For a campus marketplace this is unnecessary noise. |

**How** does staleTime vs gcTime work?

```
Data fetched at t=0
      │
      ├── t=0 to t=5min  ──► FRESH: no background refetch, cached data served instantly
      │
      ├── t=5min          ──► STALE: next access triggers a background refetch
      │                        (stale data shown immediately, fresh data replaces it)
      │
      ├── t=5min to t=10min ► STALE but still in cache (gcTime window)
      │
      └── t=10min          ──► GARBAGE COLLECTED: cache entry removed from memory
                               (next access triggers a full loading state)
```

**When** would you change these values?

- Real-time data (e.g., live auction prices) → reduce `staleTime` to 0 or 30 seconds
- Rarely-changing reference data (e.g., category lists) → increase `staleTime` to 30 minutes or more
- High-traffic API with rate limits → increase `gcTime` to keep data in cache longer
- Critical data where stale reads are unacceptable → set `staleTime: 0` to always refetch

---

### 3.4 `next/dynamic` Lazy Loading

**What** is lazy loading with `next/dynamic`?

Lazy loading splits your JavaScript bundle so that a component's code is only downloaded when it is actually needed — not on the initial page load. `next/dynamic` is Next.js's wrapper around `React.lazy` with additional options like `ssr: false`.

**Why** does it reduce initial bundle size?

Without lazy loading, every component imported by a page is included in that page's JS chunk. With `next/dynamic`, the component is split into a separate chunk that the browser fetches on demand. For the login page, this means the `LoginPage` component (which includes form logic, validation, Zustand hooks, and react-hook-form) is NOT included in the initial HTML payload.

**How** is it implemented in `LoginClient.tsx`?

```typescript
// src/app/(auth)/login/LoginClient.tsx
'use client'

import dynamic from 'next/dynamic'

const LoginPage = dynamic(() => import('@/modules/auth/pages/LoginPage'), {
  ssr: false,
  loading: () => null,
})

export default function LoginClient() {
  return <LoginPage />
}
```

The `ssr: false` option is critical here — `LoginPage` uses Zustand stores that read from `localStorage`. Rendering it on the server would produce HTML that doesn't match what the browser renders after Zustand hydrates, causing a React hydration mismatch error. By setting `ssr: false`, the component is skipped entirely during server rendering and only rendered in the browser.

```
Without lazy loading:
  /login page chunk = page.tsx + LoginClient.tsx + LoginPage.tsx + all imports
  ──► browser downloads everything upfront

With next/dynamic (ssr: false):
  /login page chunk = page.tsx + LoginClient.tsx (tiny shell)
  ──► browser downloads the shell first, renders immediately
        │
        ▼
  LoginPage chunk fetched separately (only when LoginClient mounts)
  ──► LoginPage renders in browser (Zustand is hydrated, no mismatch)
```

**When** should you use `next/dynamic`?

- The component uses browser-only APIs or Zustand stores that read `localStorage` → use `ssr: false`
- The component is large and only needed after user interaction (e.g., a modal, a rich text editor) → lazy load it
- The component imports a heavy third-party library (e.g., a chart library, a map) → lazy load it to keep the initial bundle small

---

### 3.5 Font Loading with `display: 'swap'`

**What** is `display: 'swap'`?

`display: 'swap'` is a CSS `font-display` strategy. It tells the browser: "show text immediately using a fallback system font, then swap to the custom font once it has loaded." It is set on both Geist fonts in `src/app/layout.tsx` (covered in detail in section 2.6).

**Why** does it matter for Core Web Vitals?

Without `display: 'swap'`, the browser uses `font-display: block` by default — it hides text for up to 3 seconds while the custom font loads (FOIT — Flash of Invisible Text). This directly hurts two Core Web Vitals:

- **LCP (Largest Contentful Paint)** — if the largest element on the page is text, it won't paint until the font loads
- **CLS (Cumulative Layout Shift)** — when the font finally loads, the text reflows if the fallback font has different metrics, causing visible layout jumps

`display: 'swap'` eliminates FOIT entirely. The trade-off is a brief FOUT (Flash of Unstyled Text) — text is visible immediately in the fallback font, then swaps to Geist. This swap can still cause a small CLS if the fonts have very different metrics, but `next/font` mitigates this by generating a `size-adjust` CSS property that makes the fallback font match Geist's dimensions as closely as possible.

**How** does it work in this project?

```typescript
// src/app/layout.tsx
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',   // ← this line
})
```

```
Page load timeline with display: 'swap':

t=0ms   ──► HTML arrives, text renders in system fallback font (visible immediately)
t=50ms  ──► Geist font file downloaded from same origin (.next/static/media/)
t=51ms  ──► Browser swaps fallback → Geist (brief reflow, minimal CLS)

Without display: 'swap' (default block):
t=0ms   ──► HTML arrives, text is INVISIBLE (FOIT)
t=3000ms ──► Font timeout: text becomes visible in fallback
t=3050ms ──► Geist loads: text swaps (large CLS)
```

**When** do you need to think about this?

When adding a new font to the project. Always use `display: 'swap'` with `next/font/google`. Never use a `<link>` tag to load fonts — it bypasses Next.js's font optimisation and reintroduces the external network request and CLS problems.

---

### 3.6 CSS Modules

**What** are CSS Modules?

A CSS Module is a `.css` file where every class name is automatically scoped to the component that imports it. The file is named `ComponentName.module.css`. At build time, Next.js transforms the class names into unique hashes, so `.searchWrap` in `JobsView.module.css` becomes something like `JobsView_searchWrap__x7k2p` in the final HTML — guaranteed to never collide with `.searchWrap` in any other component.

**Why** use CSS Modules instead of global CSS or inline styles?

In a large codebase, global CSS class names collide. If two developers both write `.card { ... }` in different files, one will silently override the other. CSS Modules solve this at build time — you write plain CSS, but the class names are scoped automatically. No naming conventions (BEM, SMACSS) required.

**How** does it work in this project?

Here is a real example from `src/modules/jobs/components/JobsView.module.css`:

```css
/* JobsView.module.css */
.searchWrap {
  margin-top: var(--space-5);
  max-width: 480px;
}

.emptyState {
  text-align: center;
  padding: 64px;
  color: var(--color-text-muted);
}

.salary {
  color: var(--color-primary);
  font-weight: 700;
  margin-top: 3px;
  display: block;
}
```

The component imports it as an object and uses the class names as properties:

```typescript
import styles from './JobsView.module.css'

// In JSX:
<div className={styles.searchWrap}>...</div>
<span className={styles.salary}>$80,000</span>
<div className={styles.emptyState}>No jobs found</div>
```

At build time, Next.js transforms this to:

```html
<!-- In the browser -->
<div class="JobsView_searchWrap__x7k2p">...</div>
<span class="JobsView_salary__3qr8m">$80,000</span>
```

```
Source code:          styles.searchWrap
                            │
                            ▼
Build transform:      JobsView_searchWrap__x7k2p  (unique hash)
                            │
                            ▼
Browser HTML:         class="JobsView_searchWrap__x7k2p"
                            │
                            ▼
Zero collision with any other component's .searchWrap
```

**When** do you use CSS Modules vs global CSS?

- Component-specific styles → `ComponentName.module.css` (scoped, no collision risk)
- Design tokens (colours, spacing, typography) → `src/styles/variables.css` (global, intentionally shared)
- Utility classes (`.flex`, `.hidden`, `.truncate`) → Tailwind CSS or `src/styles/utilities.css`
- Page-level layout styles → `src/styles/pages.css`

---

### 3.7 `globalStaticData.ts` Pattern

**What** is `globalStaticData.ts`?

It is a single file at `src/utils/globalStaticData.ts` that exports every static constant used across the application — navigation links, label maps, colour maps, filter options, and decorative values. Nothing is defined inline in components; everything is imported from here.

**Why** centralise static data?

Two reasons:

1. **No magic values** — A component that renders `'#dcfce7'` as a background colour is unreadable. A component that renders `CATEGORY_BG['ELECTRONICS']` is self-documenting. When the design changes, you update one file instead of hunting through every component.
2. **Tree-shaking** — Because every export is a named export, the bundler can drop any export that is never imported. If `RESET_PASSWORD_CIRCLES` is only used in one component and that component is lazy-loaded, the array is only included in that component's chunk — not the main bundle.

**How** does it work?

Here are three real examples from the file:

```typescript
// src/utils/globalStaticData.ts

// Sidebar navigation links — used by UserLayout sidebar
export const SIDEBAR_LINKS = [
  { href: '/account/my-profile',      label: 'My Profile',   icon: '👤' },
  { href: '/account/manage-listing',  label: 'My Listings',  icon: '🛍'  },
  { href: '/account/manage-request',  label: 'My Requests',  icon: '📋' },
  { href: '/account/list-product',    label: 'List Product', icon: '➕' },
  { href: '/account/request-product', label: 'Request Item', icon: '🔍' },
  { href: '/account/edit-profile',    label: 'Edit Profile', icon: '✏️' },
] as const

// Job type display labels — used by job cards and filters
export const JOB_TYPE_LABEL: Record<string, string> = {
  FULL_TIME:   'Full-Time',
  PART_TIME:   'Part-Time',
  INTERNSHIP:  'Internship',
  CONTRACT:    'Contract',
}

// Marketplace category background colours — used by category badges
export const CATEGORY_BG: Record<string, string> = {
  ELECTRONICS:          '#dcfce7',
  CLOTHING_FASHION:     '#fce7f3',
  HOME_KITCHEN:         '#fef9c3',
  BOOKS_STATIONERY:     '#e0e7ff',
  SPORTS_FITNESS:       '#dcfce7',
  BEAUTY_PERSONAL_CARE: '#fce7f3',
  TOYS_GAMES:           '#fef9c3',
  AUTOMOTIVE:           '#e5e7eb',
  GROCERIES_FOOD:       '#dcfce7',
  HEALTH_WELLNESS:      '#e0f2fe',
}
```

A component uses them like this:

```typescript
import { JOB_TYPE_LABEL, CATEGORY_BG } from '@/utils/globalStaticData'

// In a job card:
<span>{JOB_TYPE_LABEL[job.type]}</span>   // renders "Full-Time"

// In a category badge:
<span style={{ background: CATEGORY_BG[product.category] }}>
  {product.category}
</span>
```

```
Tree-shaking at build time:

globalStaticData.ts exports:
  HERO_IMAGES        ← imported by LandingPage only
  JOB_TYPE_LABEL     ← imported by JobCard, JobsView
  CATEGORY_BG        ← imported by MarketplaceView
  SIDEBAR_LINKS      ← imported by UserLayout
  RESET_PASSWORD_CIRCLES ← imported by ResetPasswordPage only

Bundler result:
  LandingPage chunk  ──► includes HERO_IMAGES only
  Jobs chunk         ──► includes JOB_TYPE_LABEL only
  Marketplace chunk  ──► includes CATEGORY_BG only
  (unused exports are dropped entirely)
```

**When** do you add something to `globalStaticData.ts`?

Any time you find yourself writing a string literal, colour hex, or array of options directly inside a component. If the value is used in more than one place, or if it represents a domain concept (job types, categories, navigation links), it belongs in `globalStaticData.ts`. The rule of thumb: if you'd need to update it in multiple files when the business logic changes, centralise it here.



---

## Phase 4: Backend Architecture (BFF Pattern)

This is the most important phase if you've never written backend code. Everything here runs on the server — the browser never sees it. By the end of this phase you'll understand how an HTTP request travels from the browser all the way to MongoDB and back, and why every piece of the pipeline exists.

---

### 4.1 What is a Route Handler?

**What** is a Route Handler?

A Route Handler is a server-side HTTP endpoint defined by a file named `route.ts` inside `src/app/api/`. It is the Next.js equivalent of an Express route. When the browser sends a request to `/api/auth/login`, Next.js finds `src/app/api/auth/login/route.ts` and runs the exported function that matches the HTTP method.

HTTP methods map directly to named exports:

```typescript
// src/app/api/example/route.ts

export async function GET(req: NextRequest) { ... }    // handles GET /api/example
export async function POST(req: NextRequest) { ... }   // handles POST /api/example
export async function PATCH(req: NextRequest) { ... }  // handles PATCH /api/example
export async function DELETE(req: NextRequest) { ... } // handles DELETE /api/example
```

The file system IS the router. No `app.get('/api/example', handler)` registration needed.

Here is the actual login Route Handler from this project:

```typescript
// src/app/api/auth/login/route.ts
import { NextRequest } from 'next/server'
import { withErrorHandler } from '../../../../backend/lib/withErrorHandler'
import { sendSuccess } from '../../../../backend/lib/response'
import { validate } from '../../../../backend/lib/validate'
import { setAuthCookies } from '../../../../backend/lib/cookies'
import { loginSchema } from '../../../../backend/validators/auth.validator'
import { loginUser } from '../../../../backend/services/auth.service'

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json()
  const data = validate(loginSchema, body)
  const deviceInfo = {
    ip: req.headers.get('x-forwarded-for') ?? undefined,
    name: req.headers.get('user-agent') ?? undefined,
  }
  const { accessToken, refreshToken, user } = await loginUser(data.email, data.password, deviceInfo)
  await setAuthCookies(accessToken, refreshToken)
  return sendSuccess(user, 'Login successful')
})
```

Notice that `POST` is exported as a `const` (not a function declaration). That is because `withErrorHandler` wraps it — the export is the wrapped version.

**Why** do Route Handlers exist?

They are the BFF layer. The browser calls them; they call the database. The browser never touches MongoDB directly. All secrets (JWT keys, DB connection strings) stay on the server.

**How** does Next.js find the right handler?

```
Browser: POST /api/auth/login
              │
              ▼
Next.js file-system router:
  src/app/api/auth/login/route.ts  ──► found
              │
              ▼
  HTTP method = POST  ──► run exported `POST` function
              │
              ▼
  Response returned to browser
```

**When** do you create a new Route Handler?

Any time you need a new API endpoint. Create a folder under `src/app/api/` and add a `route.ts` file. Export a function named after the HTTP method you want to handle.

---

### 4.2 Complete Request Lifecycle — Login Endpoint

**What** is the request lifecycle?

Every Route Handler in this project follows the same pipeline. Understanding it once means you understand every endpoint. The login endpoint is the best example because it uses every step.

**Why** does each step exist?

Each step has a single job. `withErrorHandler` catches errors. `validate` rejects bad input early. The service contains the business logic. `setAuthCookies` writes the tokens. `sendSuccess` formats the response. Separating them means you can change one without touching the others.

**How** does the login request flow?

```
Browser: POST /api/auth/login  { email, password }
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│  withErrorHandler  (src/backend/lib/withErrorHandler.ts)         │
│  Wraps the handler in try/catch.                                 │
│  If anything below throws, it catches and returns a JSON error.  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  const body = await req.json()                                   │
│  Parses the raw request body into a JavaScript object.           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  validate(loginSchema, body)  (src/backend/lib/validate.ts)      │
│  Runs the Zod schema against the body.                           │
│  If email is missing or password is empty → throws AppError      │
│  with errorCode: 'VALIDATION_ERROR' → withErrorHandler catches   │
│  it and returns 400 immediately. No business logic runs.         │
└──────────────────────────┬──────────────────────────────────────┘
                           │  data = { email, password } (validated)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  loginUser(data.email, data.password, deviceInfo)                │
│  (src/backend/services/auth.service.ts)                          │
│  1. connectDB() — ensures Mongoose is connected                  │
│  2. Find user by email in MongoDB                                │
│  3. bcrypt.compare(password, user.password)                      │
│  4. generateAccessToken(userId) — signs JWT (59 min)             │
│  5. generateRefreshToken(userId) — signs JWT (7 days)            │
│  6. Store hashed refresh token in RefreshToken collection        │
│  Returns: { accessToken, refreshToken, user }                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  setAuthCookies(accessToken, refreshToken)                       │
│  (src/backend/lib/cookies.ts)                                    │
│  Sets two httpOnly cookies on the response:                      │
│    accessToken  — maxAge: 900s (15 min)                          │
│    refreshToken — maxAge: 604800s (7 days)                       │
│  httpOnly = true means JavaScript cannot read these cookies.     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  sendSuccess(user, 'Login successful')                           │
│  (src/backend/lib/response.ts)                                   │
│  Returns: { code: 200, success: true, message: '...', data: user }│
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
Browser receives:
  HTTP 200
  Set-Cookie: accessToken=...; HttpOnly
  Set-Cookie: refreshToken=...; HttpOnly
  Body: { code: 200, success: true, message: "Login successful", data: { _id, name, email, role, ... } }
```

**When** does the error path trigger?

If `loginUser` throws an `AppError` (e.g., wrong password → `INVALID_CREDENTIALS`), `withErrorHandler` catches it and returns a 401 JSON response immediately. The `setAuthCookies` and `sendSuccess` lines never run.

---

### 4.3 `withErrorHandler` — The Error Wrapper

**What** is `withErrorHandler`?

It is a Higher-Order Component (HOC) for Route Handlers. It takes a handler function and returns a new function that wraps the original in a `try/catch`. Here is the actual implementation:

```typescript
// src/backend/lib/withErrorHandler.ts
import { NextRequest, NextResponse } from 'next/server'
import { AppError } from './appError'

type Handler = (
  req: NextRequest,
  ctx?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>

export function withErrorHandler(handler: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx)
    } catch (err) {
      if (err instanceof AppError) {
        return NextResponse.json(
          {
            code: err.statusCode,
            success: false,
            message: err.message,
            errorCode: err.errorCode,
            data: null,
            ...(err.details ? { details: err.details } : {}),
          },
          { status: err.statusCode }
        )
      }

      const message =
        process.env.NODE_ENV === 'production'
          ? 'Internal Server Error'
          : err instanceof Error
            ? err.message
            : String(err)

      return NextResponse.json(
        { code: 500, success: false, message, errorCode: 'INTERNAL_SERVER_ERROR', data: null },
        { status: 500 }
      )
    }
  }
}
```

It handles two error types differently:

```
Error thrown inside handler
          │
          ├── instanceof AppError?
          │     ├── YES → return JSON with err.statusCode, err.errorCode, err.message
          │     │         (e.g., 401 INVALID_CREDENTIALS, 400 VALIDATION_ERROR)
          │     │
          │     └── NO  → return 500 JSON
          │               development: include real error message
          │               production:  "Internal Server Error" (hides internals)
```

**Why** does every Route Handler use it?

Without it, an unhandled exception would crash the Route Handler and Next.js would return a generic 500 with no useful body. With `withErrorHandler`, every error — expected or unexpected — produces a consistent JSON response that the frontend can parse.

**How** do you use it?

Wrap your handler function when you export it:

```typescript
export const POST = withErrorHandler(async (req: NextRequest) => {
  // your handler logic — throw AppError freely, withErrorHandler catches it
})
```

**When** do you NOT use it?

Never. Every Route Handler in this project uses `withErrorHandler`. It is the first thing you add when creating a new endpoint.

---

### 4.4 Layered Backend Architecture

**What** are the layers?

The backend is split into three layers. Each layer has one job and only talks to the layer below it:

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: Route Handler  (src/app/api/**/route.ts)               │
│  Receives HTTP request, validates input, calls service,          │
│  sets cookies, returns HTTP response.                            │
│  Knows about: HTTP, cookies, request/response format.            │
│  Does NOT know about: MongoDB, business rules.                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │  calls service functions
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 2: Service  (src/backend/services/*.service.ts)           │
│  Contains all business logic: password hashing, token rotation,  │
│  ownership checks, ID generation, email sending.                 │
│  Knows about: business rules, MongoDB models.                    │
│  Does NOT know about: HTTP, cookies, request format.             │
└──────────────────────────┬──────────────────────────────────────┘
                           │  queries models
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: Model  (src/backend/models/*.model.ts)                 │
│  Mongoose schemas and models. Defines the shape of data in       │
│  MongoDB. Handles timestamps, indexes, TTL.                      │
│  Knows about: MongoDB, data shape.                               │
│  Does NOT know about: business rules, HTTP.                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
                        MongoDB
```

**Why** this separation?

If you put business logic in the Route Handler, you can't reuse it. If you put HTTP logic in the service, you can't test it without a real HTTP request. The layers keep concerns separate so each piece can be changed, tested, and reused independently.

**How** is `src/backend/` organised?

```
src/backend/
├── lib/            ← Shared utilities used by Route Handlers and services
│   ├── withErrorHandler.ts  ← HOC that wraps every Route Handler
│   ├── authGuard.ts         ← getAuthUser() — verifies access token
│   ├── validate.ts          ← Zod validation helper
│   ├── response.ts          ← sendSuccess() / sendError()
│   ├── cookies.ts           ← setAuthCookies() / clearAuthCookies()
│   ├── db.ts                ← connectDB() — Mongoose connection with caching
│   ├── appError.ts          ← AppError class
│   ├── jwt.ts               ← generateAccessToken / generateRefreshToken / hashToken
│   ├── mailer.ts            ← sendResetPasswordEmail()
│   └── env.ts               ← typed environment variables
│
├── models/         ← Mongoose schemas and models
│   ├── user.model.ts
│   ├── refreshToken.model.ts
│   ├── shop.model.ts
│   ├── job.model.ts
│   ├── listedProduct.model.ts
│   ├── requestedProduct.model.ts
│   └── cms.model.ts
│
├── services/       ← Business logic (one file per domain)
│   ├── auth.service.ts
│   ├── shop.service.ts
│   ├── job.service.ts
│   ├── listedProduct.service.ts
│   ├── requestedProduct.service.ts
│   ├── cms.service.ts
│   └── user.service.ts
│
└── validators/     ← Zod schemas for request body validation
    ├── auth.validator.ts
    ├── shop.validator.ts
    ├── job.validator.ts
    ├── listedProduct.validator.ts
    ├── requestedProduct.validator.ts
    └── cms.validator.ts
```

**When** do you add to each directory?

- New shared utility used by multiple Route Handlers → `src/backend/lib/`
- New MongoDB collection → `src/backend/models/`
- New business logic function → `src/backend/services/`
- New request body schema → `src/backend/validators/`

---

### 4.5 `connectDB()` — Mongoose Connection Caching

**What** is `connectDB()`?

It is a function in `src/backend/lib/db.ts` that connects Mongoose to MongoDB. Here is the actual implementation:

```typescript
// src/backend/lib/db.ts
import mongoose from 'mongoose'

declare global {
  var _mongooseConn: typeof mongoose | undefined
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not defined')
  }

  // Reuse existing connection (handles Next.js hot-reload)
  if (global._mongooseConn) {
    return global._mongooseConn
  }

  if (mongoose.connection.readyState >= 1) {
    global._mongooseConn = mongoose
    return mongoose
  }

  const conn = await mongoose.connect(uri)
  global._mongooseConn = conn
  return conn
}
```

**Why** is it called at the start of every service function instead of once at startup?

In a traditional Express server, you call `connectDB()` once when the server starts and the connection stays open forever. Next.js Route Handlers don't work that way. Each Route Handler is a serverless function — it can be cold-started at any time, and there is no persistent "server startup" phase. If you only called `connectDB()` once, a cold-started handler would have no connection.

The solution is to call `connectDB()` at the top of every service function. The caching logic (`global._mongooseConn`) ensures that only the first call actually opens a new connection. Every subsequent call returns the cached connection instantly.

**How** does the caching work?

```
First request (cold start):
  connectDB() called
        │
        ├── global._mongooseConn exists? NO
        ├── mongoose.connection.readyState >= 1? NO
        │
        ▼
  mongoose.connect(uri)  ──► opens new TCP connection to MongoDB
        │
        ▼
  global._mongooseConn = conn  ──► cached on the global object
        │
        ▼
  returns conn

Second request (warm):
  connectDB() called
        │
        ├── global._mongooseConn exists? YES
        │
        ▼
  returns global._mongooseConn immediately  (no new connection)

Next.js hot-reload (development):
  Module cache is cleared, but global object persists
  connectDB() finds global._mongooseConn → reuses it
  (prevents "too many connections" errors during development)
```

**When** do you call `connectDB()`?

At the very first line of every service function, before any database query. You will see this pattern in every service file:

```typescript
export async function loginUser(email: string, password: string) {
  await connectDB()   // ← always first
  const user = await UserModel.findOne({ email })
  // ...
}
```

---

### 4.6 `validate()` — Zod Request Validation

**What** is `validate()`?

It is a utility in `src/backend/lib/validate.ts` that runs a Zod schema against an unknown value and either returns the typed, validated data or throws an `AppError`. Here is the actual implementation:

```typescript
// src/backend/lib/validate.ts
import { ZodType, ZodError } from 'zod'
import { AppError } from './appError'

export function validate<T>(schema: ZodType<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (err) {
    if (err instanceof ZodError) {
      const details = err.issues.map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : 'value'
        return `${path}: ${issue.message}`
      })
      throw new AppError(details.join(', '), 400, 'VALIDATION_ERROR', details)
    }
    throw err
  }
}
```

**Why** validate before business logic?

Two reasons:

1. **Safety** — Business logic assumes the data is the right shape. If `loginUser` receives `undefined` for `email`, it will crash in an unpredictable way. `validate()` guarantees the data matches the schema before any service function runs.
2. **Consistent errors** — By throwing `AppError` with `VALIDATION_ERROR`, the error is caught by `withErrorHandler` and returned as a structured 400 response. The frontend always knows what to expect.

**How** does it work in a Route Handler?

```typescript
// In the login Route Handler:
const body = await req.json()          // body is `unknown` — could be anything
const data = validate(loginSchema, body) // data is now typed as { email: string, password: string }
                                         // if validation fails → AppError thrown → withErrorHandler returns 400
```

The Zod schema for login is defined in `src/backend/validators/auth.validator.ts`:

```
loginSchema validates:
  email   → must be a valid email string
  password → must be a non-empty string

If email is "not-an-email":
  ZodError thrown
        │
        ▼
  validate() catches it
        │
        ▼
  details = ["email: Invalid email"]
        │
        ▼
  throws AppError("email: Invalid email", 400, "VALIDATION_ERROR", details)
        │
        ▼
  withErrorHandler catches AppError
        │
        ▼
  returns: { code: 400, success: false, errorCode: "VALIDATION_ERROR", details: [...] }
```

**When** do you call `validate()`?

Always, immediately after `await req.json()`, before calling any service function. Never pass raw `req.json()` output directly to a service.

---

### 4.7 Standard API Response Shape

**What** is the standard response shape?

Every Route Handler in this project returns JSON in one of two shapes — success or error. This consistency means the frontend always knows how to parse a response.

**Why** standardise the shape?

Without a standard shape, every endpoint might return data differently. The frontend would need custom parsing logic for each endpoint. With a standard shape, one Axios interceptor handles all responses.

**How** do `sendSuccess` and `AppError` produce these shapes?

`sendSuccess` (from `src/backend/lib/response.ts`):

```typescript
export function sendSuccess<T>(data: T, message = 'OK', statusCode = 200): NextResponse {
  return NextResponse.json(
    { code: statusCode, success: true, message, data },
    { status: statusCode }
  )
}
```

`AppError` (from `src/backend/lib/appError.ts`):

```typescript
export class AppError extends Error {
  statusCode: number
  errorCode: string
  isOperational = true
  details?: unknown[]

  constructor(message: string, statusCode: number, errorCode = 'ERROR', details?: unknown[]) {
    super(message)
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.details = details
  }
}
```

When `withErrorHandler` catches an `AppError`, it formats it as:

```
Success response shape:
{
  "code": 200,
  "success": true,
  "message": "Login successful",
  "data": { "_id": "...", "name": "John", "email": "john@example.com", "role": "USER" }
}

Error response shape:
{
  "code": 400,
  "success": false,
  "message": "email: Invalid email",
  "errorCode": "VALIDATION_ERROR",
  "data": null,
  "details": ["email: Invalid email"]
}

401 error shape:
{
  "code": 401,
  "success": false,
  "message": "Invalid credentials",
  "errorCode": "INVALID_CREDENTIALS",
  "data": null
}
```

**When** do you use `sendSuccess` vs `AppError`?

- Operation succeeded → `return sendSuccess(data, 'message', statusCode)`
- Expected failure (wrong password, not found, forbidden) → `throw new AppError('message', statusCode, 'ERROR_CODE')`
- Unexpected failure → let it propagate as a regular `Error`; `withErrorHandler` returns 500

---

### 4.8 `getAuthUser()` with React `cache()`

**What** is `getAuthUser()`?

It is a server-side utility in `src/backend/lib/authGuard.ts` that reads the `accessToken` cookie, verifies the JWT, and returns the authenticated user from MongoDB — or `null` if the token is missing or invalid. Here is the actual implementation:

```typescript
// src/backend/lib/authGuard.ts
import { cache } from 'react'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { connectDB } from './db'
import { env } from './env'
import { UserModel } from '../models/user.model'
import type { IUser } from '../types/backend.types'

export const getAuthUser = cache(async (): Promise<IUser | null> => {
  try {
    await connectDB()
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value

    if (!accessToken) return null

    try {
      const decoded = jwt.verify(accessToken, env.JWT_ACCESS_SECRET) as { id: string }
      const user = await UserModel.findById(decoded.id).select('-password').lean()
      return user ? (user as unknown as IUser) : null
    } catch {
      return null
    }
  } catch {
    return null
  }
})
```

**Why** is it wrapped in React `cache()`?

React `cache()` deduplicates function calls within a single server request. If three different Route Handlers or Server Components call `getAuthUser()` during the same request, only one DB query runs. The result is shared across all three callers.

```
Single request with 3 callers of getAuthUser():

  Caller A: getAuthUser()  ──► DB query runs  ──► returns user
  Caller B: getAuthUser()  ──► cache hit       ──► returns same user (no DB query)
  Caller C: getAuthUser()  ──► cache hit       ──► returns same user (no DB query)

  Total DB queries: 1  (not 3)
```

**Why** does it return `null` instead of throwing?

Different callers need different behaviour when the user is not authenticated. A Route Handler for a protected endpoint might want to return 401. A Route Handler for a public endpoint might want to return different data for authenticated vs anonymous users. By returning `null`, `getAuthUser()` lets each caller decide what to do.

**Why** is silent refresh NOT done server-side?

The comment in the source file explains it directly: Next.js server components and Route Handlers cannot reliably set cookies mid-request. Token refresh requires setting new `accessToken` and `refreshToken` cookies on the response. This can only be done reliably in a Route Handler that controls the full response. The client-side Axios interceptor handles token refresh by calling `POST /api/auth/refresh` when it receives a 401 — that Route Handler CAN set cookies.

```
Access token expired — what happens:

Server-side (getAuthUser):
  jwt.verify() throws  ──► catch block  ──► return null
  (no refresh attempt — cannot set cookies here)

Client-side (Axios interceptor):
  API call returns 401
        │
        ▼
  interceptor calls POST /api/auth/refresh
        │
        ▼
  /api/auth/refresh Route Handler:
    reads refreshToken cookie
    generates new accessToken + refreshToken
    sets new cookies on response  ← this works because it's a Route Handler
        │
        ▼
  interceptor retries original request with new cookies
```

**When** do you use `getAuthUser()`?

In any Route Handler that needs to know who is making the request. Call it at the top of the handler, check if the result is `null`, and return 401 if authentication is required:

```typescript
export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser()
  if (!user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
  // user is now typed as IUser — safe to use
  return sendSuccess(user, 'Profile fetched')
})
```

---

### 4.9 All Route Handler Groups

**What** are the Route Handler groups?

Every API endpoint in this project lives under `src/app/api/`. They are organised into groups by domain. Here is the complete map:

```
src/app/api/
├── auth/
│   ├── login/route.ts           POST   — authenticate user, set cookies
│   ├── register/route.ts        POST   — create new account
│   ├── refresh/route.ts         POST   — rotate access + refresh tokens
│   ├── logout/route.ts          POST   — invalidate refresh token, clear cookies
│   ├── profile/route.ts         GET    — get current user
│   │                            PATCH  — update profile
│   ├── forgot-password/route.ts POST   — send reset email
│   └── reset-password/
│       └── [token]/route.ts     POST   — reset password with token
│
├── jobs/
│   ├── route.ts                 GET    — list all jobs (with filters)
│   │                            POST   — create job [ADMIN only]
│   └── [id]/route.ts            GET    — get job by ID
│                                PUT    — update job [ADMIN only]
│                                DELETE — delete job [ADMIN only]
│
├── shops/
│   ├── route.ts                 GET    — list all shops (with filters)
│   │                            POST   — create shop [ADMIN only]
│   └── [id]/route.ts            GET    — get shop by ID
│                                PUT    — update shop [ADMIN only]
│                                DELETE — delete shop [ADMIN only]
│
├── listed-products/
│   ├── route.ts                 GET    — list all marketplace listings
│   │                            POST   — create listing [USER only]
│   ├── my-products/route.ts     GET    — get current user's listings
│   └── [id]/route.ts            GET    — get listing by ID
│                                PUT    — update listing [USER, owner only]
│                                DELETE — delete listing [USER, owner only]
│
├── requested-products/
│   ├── route.ts                 GET    — list all product requests
│   │                            POST   — create request [USER only]
│   ├── my-requests/route.ts     GET    — get current user's requests
│   └── [id]/route.ts            GET    — get request by ID
│                                PUT    — update request [USER, owner only]
│                                DELETE — delete request [USER, owner only]
│
├── cms/
│   ├── route.ts                 GET    — list all CMS pages
│   │                            POST   — create CMS page [ADMIN only]
│   └── [type]/route.ts          GET    — get CMS page by type
│                                PUT    — update CMS page [ADMIN only]
│                                DELETE — delete CMS page [ADMIN only]
│
├── users/
│   └── route.ts                 GET    — list users [ADMIN only]
│
├── swagger/
│   └── route.ts                 GET    — serve OpenAPI spec JSON
│
└── health/
    └── route.ts                 GET    — health check (returns 200 OK)
```

**Why** are they grouped this way?

Each group maps to a domain (auth, jobs, shops, marketplace, CMS). This mirrors the service layer — `src/backend/services/auth.service.ts` handles all auth logic, `src/backend/services/job.service.ts` handles all job logic, and so on. When you need to add a new endpoint for jobs, you know exactly where to look.

**How** do role restrictions work?

Endpoints marked `[ADMIN only]` or `[USER only]` call `getAuthUser()` and check the user's role before running any business logic. If the role doesn't match, they throw `AppError('Forbidden', 403, 'FORBIDDEN')`. `withErrorHandler` catches it and returns 403.

**When** do you add a new endpoint?

1. Create the folder: `src/app/api/{domain}/route.ts`
2. Export the HTTP method function wrapped in `withErrorHandler`
3. Add the corresponding service function in `src/backend/services/{domain}.service.ts`
4. Add the Zod schema in `src/backend/validators/{domain}.validator.ts`

---

## Phase 5: Forms and Data Flow

Forms are where the frontend and backend meet. This phase traces the complete path from a user typing in a field to a server response updating the UI — using the login form as the primary example throughout.

---

### 5.1 Form Architecture Pattern

**What** is the form architecture pattern?

Every form in this project is built from four layers that each own a distinct responsibility. No layer does more than its job.

```
Layer 1: Yup schema (validation.ts)
  └── defines field rules: required, min length, email format

Layer 2: react-hook-form + yupResolver
  └── manages form state, tracks errors, handles submission

Layer 3: Custom form hook (useLoginForm.ts)
  └── wires layers 1 and 2 together, exposes register/handleSubmit/formState

Layer 4: Mutation hook (useLogin.ts)
  └── calls the API via React Query useMutation, handles onSuccess/onError
```

**Why** split into four layers?

Each layer is independently testable and reusable. The Yup schema can be used outside of forms (e.g., in tests). The mutation hook can be called from anywhere — not just from a form. The form hook can swap out the mutation without changing the schema. This separation prevents the "fat component" problem where a single component handles validation, API calls, error display, and navigation all at once.

**How** does each layer look in code?

Layer 1 — Yup schema in `src/modules/auth/validation.ts`:

```typescript
import * as yup from 'yup'

export const loginSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
})

export type LoginFormValues = yup.InferType<typeof loginSchema>
```

`yup.InferType<typeof loginSchema>` automatically derives the TypeScript type from the schema — you never write the type manually.

Layer 2 + Layer 3 — `useLoginForm.ts` in `src/modules/auth/hooks/useLoginForm.ts`:

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { loginSchema, type LoginFormValues } from '../validation'
import { useLogin } from './useLogin'

export function useLoginForm() {
  const mutation = useLogin()

  const { register, handleSubmit, formState } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit((data) => mutation.mutate(data))

  return { register, handleSubmit, formState, onSubmit, mutation }
}
```

`yupResolver(loginSchema)` is the bridge between Yup and react-hook-form. When the form is submitted, react-hook-form runs the Yup schema against the field values. If validation fails, `formState.errors` is populated and the `mutate` call never happens.

Layer 4 — `useLogin.ts` in `src/modules/auth/hooks/useLogin.ts`:

```typescript
'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import type { LoginCredentials } from '../types'

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const router = useRouter()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authApi.login(credentials).then((res) => res.data.data),
    onSuccess: (user) => {
      setAuth(user as unknown as Parameters<typeof setAuth>[0], '', '')
      toast.success('Welcome back!')
      router.push('/landing')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Login failed. Please try again.')
    },
  })
}
```

**When** do you use this pattern?

For every form in the project. The same four-layer structure applies to register, forgot-password, reset-password, update-profile, list-product, and request-product. When adding a new form, create a `validation.ts` entry, a `useXxxForm.ts` hook, and a `useXxx.ts` mutation hook — then wire them together.

---

### 5.2 Complete Login Data Flow

**What** is the complete login data flow?

From the moment a user types their email and password to the moment they land on `/landing`, the data passes through seven distinct layers. Here is the full trace:

```
User types email + password into the form
          │
          ▼
react-hook-form collects field values
          │
          ▼
Yup schema validates (email format, password min length)
  ├── FAIL → formState.errors populated, form shows inline errors, stops here
  └── PASS ↓
          │
          ▼
useLoginForm.onSubmit calls mutation.mutate({ email, password })
          │
          ▼
useLogin.mutationFn calls authApi.login(credentials)
          │
          ▼
authApi.login calls apiClient.post('/api/auth/login', body)
          │
          ▼
axiosClient sends POST /api/auth/login
  withCredentials: true → httpOnly cookies sent automatically
          │
          ▼
src/proxy.ts (middleware) — CORS check passes (same origin)
          │
          ▼
src/app/api/auth/login/route.ts (Route Handler)
  withErrorHandler wraps the handler
  validate(loginSchema, body) — Zod validates request body
  loginUser(email, password) called
          │
          ▼
src/backend/services/auth.service.ts — loginUser()
  connectDB() — ensures MongoDB connection
  UserModel.findOne({ email }) — finds user
  bcrypt.compare(password, user.password) — verifies password
  jwt.sign(...) — generates accessToken + refreshToken
  RefreshTokenModel.create({ token: hash }) — stores hashed refresh token
  setAuthCookies(response, accessToken, refreshToken) — sets httpOnly cookies
          │
          ▼
sendSuccess(user) — returns { code: 200, success: true, data: user }
          │
          ▼
Axios receives 200 response
          │
          ▼
useLogin.onSuccess(user) fires
  useAuthStore.setAuth(user, '', '') — updates Zustand store
  toast.success('Welcome back!') — shows toast notification
  router.push('/landing') — navigates to dashboard
          │
          ▼
User sees the /landing page
```

**Why** does the flow go through so many layers?

Each layer has a single job. react-hook-form handles form state. Yup handles client-side validation. The mutation hook handles the API call and side effects. The Route Handler handles server-side validation and orchestration. The service handles business logic. This separation means you can change any one layer without touching the others — for example, swapping Yup for Zod on the client, or changing the redirect destination, without touching the service layer.

**How** does the Zustand store update work?

`useAuthStore` is defined in `src/modules/auth/store/auth.store.ts`:

```typescript
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
)
```

After `setAuth` is called, `isAuthenticated` becomes `true` and the `user` object is available everywhere in the app via `useAuthStore((s) => s.user)`. The `persist` middleware saves this to `localStorage` so the session survives a page refresh.

**When** does this flow run?

Every time the login form is submitted successfully. The same pattern — form hook → mutation hook → API → store update → redirect — applies to register, update-profile, and any other write operation that requires navigation after success.

---

### 5.3 `apiFactory.ts` Pattern

**What** is `apiFactory.ts`?

It is a factory function in `src/lib/axios/apiFactory.ts` that generates a typed API object for a given base path. Here is the complete implementation:

```typescript
import { apiClient } from './axiosClient'

export function createApi(basePath: string) {
  return {
    get: <T>(path = '') => apiClient.get<T>(`${basePath}${path}`),
    post: <T>(path = '', data?: unknown) => apiClient.post<T>(`${basePath}${path}`, data),
    put: <T>(path = '', data?: unknown) => apiClient.put<T>(`${basePath}${path}`, data),
    patch: <T>(path = '', data?: unknown) => apiClient.patch<T>(`${basePath}${path}`, data),
    delete: <T>(path = '') => apiClient.delete<T>(`${basePath}${path}`),
  }
}
```

**Why** does this reduce boilerplate?

Without `createApi`, every module would repeat the same Axios call pattern:

```typescript
// Without apiFactory — repeated in every module:
const jobsApi = {
  getAll: () => apiClient.get('/api/jobs'),
  getById: (id: string) => apiClient.get(`/api/jobs/${id}`),
  create: (data: unknown) => apiClient.post('/api/jobs', data),
  update: (id: string, data: unknown) => apiClient.put(`/api/jobs/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/jobs/${id}`),
}
```

With `createApi`, the base path is declared once and the methods are generated:

```typescript
// With apiFactory — one line per module:
const jobsApi = createApi('/api/jobs')

// Usage:
jobsApi.get()                    // GET /api/jobs
jobsApi.get('/123')              // GET /api/jobs/123
jobsApi.post('', { title: '...' }) // POST /api/jobs
jobsApi.put('/123', { title: '...' }) // PUT /api/jobs/123
jobsApi.delete('/123')           // DELETE /api/jobs/123
```

**How** do modules use it?

Each module's `api/` file calls `createApi` with its base path:

```typescript
// src/modules/jobs/api/jobs.api.ts
import { createApi } from '@/lib/axios/apiFactory'
const jobsApi = createApi('/api/jobs')

// src/modules/marketplace/api/listedProducts.api.ts
const listedProductsApi = createApi('/api/listed-products')

// src/modules/shops/api/shops.api.ts
const shopsApi = createApi('/api/shops')
```

The `auth` module does NOT use `createApi` because its endpoints have non-standard shapes (e.g., `/api/auth/reset-password/[token]`) that don't fit the simple `basePath + path` pattern. It uses `authApi` with explicit Axios calls instead (see `src/modules/auth/api/auth.api.ts`).

```
createApi('/api/jobs') returns:
  {
    get:    (path?) => apiClient.get('/api/jobs' + path)
    post:   (path?, data?) => apiClient.post('/api/jobs' + path, data)
    put:    (path?, data?) => apiClient.put('/api/jobs' + path, data)
    patch:  (path?, data?) => apiClient.patch('/api/jobs' + path, data)
    delete: (path?) => apiClient.delete('/api/jobs' + path)
  }
```

**When** do you use `createApi`?

When adding a new module whose API follows the standard REST pattern (`GET /api/{resource}`, `POST /api/{resource}`, `GET /api/{resource}/{id}`, etc.). If the API has non-standard paths or requires custom request shapes, write explicit Axios calls instead.

---

### 5.4 Axios Client with Auto-Refresh

**What** is `axiosClient.ts`?

It is the single Axios instance used by every API call in the browser. It lives at `src/lib/axios/axiosClient.ts` and is configured with three key settings plus a 401 interceptor.

**Why** is it configured this way?

- `baseURL: '/'` — all requests go to the same Next.js app. There is no external API URL to configure. `apiClient.post('/api/auth/login')` resolves to `http://localhost:3000/api/auth/login` in development and to the deployed domain in production. No environment variable needed.
- `withCredentials: true` — tells the browser to include httpOnly cookies on every request automatically. Without this, the `accessToken` and `refreshToken` cookies would never be sent, and every request would return 401.
- The 401 interceptor — when a request fails with 401 (access token expired), the interceptor silently calls `POST /api/auth/refresh` to get a new access token, then replays the original request. The user never sees a login prompt.

**How** does the interceptor work?

Here is the actual interceptor code from `src/lib/axios/axiosClient.ts`:

```typescript
let isRefreshing = false
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (err: unknown) => void }> = []

function processQueue(error: unknown) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(null)))
  failedQueue = []
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(() => apiClient(originalRequest))
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      await axios.post('/api/auth/refresh', null, { withCredentials: true })
      processQueue(null)
      return apiClient(originalRequest)
    } catch (err) {
      processQueue(err)
      if (typeof window !== 'undefined') {
        import('@/modules/auth/store/auth.store')
          .then(({ useAuthStore }) => useAuthStore.getState().clearAuth())
          .catch(() => {})
        window.location.href = '/login'
      }
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
)
```

The `isRefreshing` + `failedQueue` pattern solves a race condition. If the user has three simultaneous API calls and all three return 401 at the same time, only ONE refresh call is made. The other two are queued in `failedQueue`. When the refresh succeeds, `processQueue(null)` resolves all queued promises and they replay their original requests. If the refresh fails, `processQueue(err)` rejects all queued promises.

```
Three simultaneous 401s:

  Request A: 401 → isRefreshing = false → starts refresh → isRefreshing = true
  Request B: 401 → isRefreshing = true  → pushed to failedQueue
  Request C: 401 → isRefreshing = true  → pushed to failedQueue

  Refresh succeeds:
    processQueue(null) → B and C resolve → B and C replay
    Request A replays
    isRefreshing = false

  All three requests complete successfully with one refresh call.
```

On `TOKEN_REUSE` (refresh token reused after rotation): the refresh endpoint returns an error, the catch block fires, `clearAuth()` wipes the Zustand store, and `window.location.href = '/login'` forces a hard redirect. All sessions have been revoked server-side at this point (see Phase 8 for the security model).

**When** do you need to modify `axiosClient.ts`?

Rarely. The only common change is adding a request interceptor to attach a custom header (e.g., a tenant ID or a locale). Never remove `withCredentials: true` — doing so breaks all authentication silently.

---

### 5.5 React Query Mutations vs Queries

**What** is the difference between mutations and queries?

React Query has two primitives for server interaction:

- `useQuery` — for READ operations. Data is fetched, cached, background-refetched, and deduplicated. Multiple components calling the same query share one network request.
- `useMutation` — for WRITE operations. No caching. Triggers side effects (toasts, redirects, cache invalidation). Each call is independent.

**Why** does the distinction matter?

Queries are safe to call multiple times — React Query deduplicates them. Mutations are not safe to call multiple times — calling `login` twice would attempt two logins. React Query enforces this distinction at the API level: `useQuery` is declarative (runs automatically), `useMutation` is imperative (you call `mutate()` explicitly).

**How** are queries used in this project?

Read operations use `useQuery` via the `createQuery` factory (see Phase 6):

```typescript
// Jobs list — data is cached for 5 minutes, background-refetched on focus
const useJobs = createQuery(
  queryKeys.jobs.all(),
  () => jobsApi.get().then((res) => res.data.data)
)

// In a component:
const { data: jobs, isLoading, error } = useJobs()
```

**How** are mutations used in this project?

Write operations use `useMutation` directly. The `useLogin` hook is the primary example:

```typescript
return useMutation({
  mutationFn: (credentials: LoginCredentials) =>
    authApi.login(credentials).then((res) => res.data.data),
  onSuccess: (user) => {
    setAuth(user as unknown as Parameters<typeof setAuth>[0], '', '')
    toast.success('Welcome back!')
    router.push('/landing')
  },
  onError: (err: unknown) => {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
    toast.error(msg ?? 'Login failed. Please try again.')
  },
})
```

`onSuccess` and `onError` are the side-effect hooks. They run after the `mutationFn` resolves or rejects. This is where toasts, redirects, and cache invalidation happen — never inside the `mutationFn` itself.

```
Query vs Mutation decision:

  Is this a READ operation?
    YES → useQuery (cached, deduplicated, background-refetched)
    NO  → useMutation (imperative, side effects in onSuccess/onError)

  Examples:
    GET /api/jobs          → useQuery
    GET /api/shops/123     → useQuery
    POST /api/auth/login   → useMutation
    PATCH /api/auth/profile → useMutation
    POST /api/listed-products → useMutation
```

**When** do you use `onSuccess` vs `onError`?

- `onSuccess` — redirect after successful form submission, update Zustand store, invalidate related queries (e.g., after creating a listing, invalidate the listings query so the list refreshes)
- `onError` — show a toast with the server error message, set field-level errors on the form

---

### 5.6 Toast Notifications

**What** is the toast notification pattern?

`react-hot-toast` is used for all user-facing feedback messages. Toasts appear as small pop-ups (bottom-center by default) and auto-dismiss after a few seconds.

**Why** use a toast library instead of inline error messages?

Toasts are for transient feedback that doesn't belong to a specific form field — "Welcome back!", "Login failed", "Profile updated". Inline errors (from `formState.errors`) are for field-level validation feedback. Both are used in this project: Yup handles inline errors, `react-hot-toast` handles operation-level feedback.

**How** are toasts triggered?

From inside mutation hooks, after the API call resolves:

```typescript
// Success toast — called in onSuccess
toast.success('Welcome back!')

// Error toast — called in onError
toast.error(msg ?? 'Login failed. Please try again.')
```

The `<Toaster />` component is mounted once in `src/app/providers.tsx`:

```typescript
// src/app/providers.tsx
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 14,
            fontWeight: 500,
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
          success: { iconTheme: { primary: '#3730d4', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#e53e3e', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  )
}
```

Because `<Toaster />` is mounted at the root provider level, `toast.success()` and `toast.error()` work from any component or hook anywhere in the app — no prop drilling, no context needed.

```
toast.success('Welcome back!') called in useLogin.onSuccess
          │
          ▼
react-hot-toast internal event bus
          │
          ▼
<Toaster /> in providers.tsx receives the event
          │
          ▼
Toast rendered at bottom-center of the screen
          │
          ▼
Auto-dismissed after ~2 seconds
```

**When** do you add a toast?

- After any mutation succeeds → `toast.success('...')`
- After any mutation fails → `toast.error(serverMessage ?? 'fallback message')`
- Never inside `mutationFn` — only in `onSuccess` and `onError`

---

### 5.7 Server Validation Errors

**What** are server validation errors?

When the server receives a request body that fails Zod validation, it returns a 400 response with `errorCode: 'VALIDATION_ERROR'` and a `details` array. Example:

```json
{
  "code": 400,
  "success": false,
  "message": "email: Invalid email",
  "errorCode": "VALIDATION_ERROR",
  "data": null,
  "details": ["email: Invalid email", "password: Required"]
}
```

**Why** does the server validate separately from the client?

Client-side Yup validation is a UX convenience — it gives instant feedback without a network round-trip. But it can be bypassed (e.g., via curl or Postman). Server-side Zod validation is the authoritative check. Both layers are necessary: Yup for UX, Zod for security.

**How** are server errors surfaced to the user?

The `onError` handler in `useLogin` reads the error message from the Axios error response:

```typescript
onError: (err: unknown) => {
  const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
  toast.error(msg ?? 'Login failed. Please try again.')
},
```

`err.response.data.message` contains the server's error message (e.g., `"email: Invalid email"`). This is shown as a toast.

For field-level server errors, the form hook can map server errors back to specific fields using react-hook-form's `setError`:

```typescript
onError: (err: unknown) => {
  const details = (err as { response?: { data?: { details?: string[] } } })?.response?.data?.details
  if (details) {
    details.forEach((detail) => {
      // detail format: "email: Invalid email"
      const [field, ...rest] = detail.split(': ')
      form.setError(field as keyof LoginFormValues, { message: rest.join(': ') })
    })
  }
}
```

This maps `"email: Invalid email"` to `formState.errors.email.message = 'Invalid email'`, which the form renders as an inline error under the email field.

```
Server returns 400 VALIDATION_ERROR:
  details: ["email: Invalid email"]
          │
          ▼
Axios rejects the promise (status 400)
          │
          ▼
useMutation.onError fires
          │
          ├── toast.error(err.response.data.message)
          │     └── shows "email: Invalid email" as a toast
          │
          └── form.setError('email', { message: 'Invalid email' })
                └── shows inline error under the email field
```

**When** do you use `toast.error` vs `form.setError`?

- `toast.error` — for general errors that don't map to a specific field (wrong password, account not found, server error)
- `form.setError` — for field-level errors that should appear inline next to the input (invalid email format, duplicate email on register)
- Both can be used together for the same error



---

## Phase 6: Reusable Architecture Patterns

Every project accumulates patterns — ways of doing things that get repeated across features. This phase documents the six core patterns in this project so you can follow them consistently when adding new features, rather than inventing your own approach.

---

### 6.1 Module Pattern — `src/modules/`

**What** is the module pattern?

Each feature in this project lives in its own folder under `src/modules/`. A module is a self-contained slice of the application — it owns everything that feature needs: API calls, React components, hooks, page-level views, state, types, and validation schemas.

The standard module structure is:

```
src/modules/{feature}/
├── api/            ← Axios API calls for this feature
├── components/     ← React components specific to this feature
├── hooks/          ← Custom hooks: form hooks, query hooks, mutation hooks
├── pages/          ← Page-level components (rendered by src/app/ pages)
├── store/          ← Zustand store (only if the feature needs client state)
├── types.ts        ← TypeScript types for this feature
└── validation.ts   ← Yup schemas for forms in this feature
```

The `src/modules/auth/` module is the most complete example in the project:

```
src/modules/auth/
├── api/
│   └── auth.api.ts          ← authApi.login(), authApi.register(), etc.
├── components/
│   └── (auth-specific UI)   ← e.g. PasswordStrengthBar, OAuthButton
├── hooks/
│   ├── useLogin.ts           ← mutation hook: calls authApi.login
│   ├── useLoginForm.ts       ← form hook: react-hook-form + Yup
│   ├── useRegister.ts
│   ├── useRegisterForm.ts
│   ├── useProfile.ts         ← query hook: fetches current user
│   ├── useUpdateProfile.ts
│   ├── useUpdateProfileForm.ts
│   ├── useForgotPassword.ts
│   ├── useForgotPasswordForm.ts
│   ├── useResetPassword.ts
│   ├── useResetPasswordForm.ts
│   └── useLogout.ts
├── pages/
│   └── LoginPage.tsx         ← full login page view (rendered by app/login/page.tsx)
├── store/
│   └── auth.store.ts         ← Zustand store for user session
├── types.ts                  ← AuthState, LoginFormValues, RegisterFormValues, etc.
└── validation.ts             ← loginSchema, registerSchema, resetPasswordSchema
```

**Why** co-locate everything in a module?

The alternative is to scatter files by type: all hooks in `src/hooks/`, all types in `src/types/`, all API calls in `src/api/`. This feels organised at first, but when you need to work on the "jobs" feature you end up jumping between five different directories. With the module pattern, everything for "jobs" is in `src/modules/jobs/` — one place to look, one place to change.

Co-location also makes it easy to delete a feature: remove `src/modules/jobs/` and the feature is gone. With scattered files, you'd need to hunt down every `jobs`-related file across the entire `src/` tree.

```
Without module pattern (scattered):          With module pattern (co-located):

src/
├── hooks/                                   src/modules/jobs/
│   ├── useJobs.ts          ←──────────────► ├── hooks/useJobs.ts
│   └── useJobDetail.ts     ←──────────────► │   └── useJobDetail.ts
├── api/                                     ├── api/jobs.api.ts
│   └── jobs.api.ts         ←──────────────► ├── components/JobCard.tsx
├── components/                              ├── pages/JobsPage.tsx
│   └── JobCard.tsx         ←──────────────► ├── types.ts
├── types/                                   └── validation.ts
│   └── jobs.types.ts       ←──────────────►
└── validation/
    └── jobs.validation.ts  ←──────────────►

To work on "jobs": jump 5 dirs        To work on "jobs": stay in 1 dir
```

**How** do you use a module?

The `src/app/` pages are thin wrappers — they import the page-level component from the module and render it:

```typescript
// src/app/(protected)/jobs/page.tsx  (Server Component)
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { makeServerQueryClient } from '@/lib/react-query/queryClient'
import { getJobs } from '@/backend/services/job.service'
import { queryKeys } from '@/lib/react-query/queryKeys'
import JobsPage from '@/modules/jobs/pages/JobsPage'

export default async function Page() {
  const qc = makeServerQueryClient()
  const jobs = await getJobs({})
  qc.setQueryData(queryKeys.jobs.all(), JSON.parse(JSON.stringify(jobs)))
  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <JobsPage />
    </HydrationBoundary>
  )
}
```

The actual UI, hooks, and logic all live in `src/modules/jobs/`. The `page.tsx` file just handles server-side data prefetching and hands off to the module.

**When** do you create a new module?

Whenever you add a new feature. If you're adding a "notifications" feature, create `src/modules/notifications/` with the standard sub-folders. Don't put feature-specific code directly in `src/app/` pages or in `src/components/common/`.

---

### 6.2 `createQuery` Factory

**What** is `createQuery`?

`createQuery` is a factory function in `src/lib/react-query/createQuery.ts` that creates a React Query hook from a query key and a query function. Instead of writing `useQuery({ queryKey, queryFn })` in every hook file, you call `createQuery(queryKey, queryFn)` and get back a ready-to-use hook.

Here is the actual source:

```typescript
// src/lib/react-query/createQuery.ts
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

export function createQuery<TData>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) {
  return () => useQuery({ queryKey, queryFn, ...options })
}
```

**Why** does this factory exist?

Without it, every query hook looks like this:

```typescript
// Without createQuery — repeated boilerplate in every hook
export function useProfile() {
  return useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: () => authApi.getProfile(),
  })
}
```

With `createQuery`, the same hook becomes:

```typescript
// With createQuery — one line
export const useProfile = createQuery(
  queryKeys.auth.profile,
  () => authApi.getProfile()
)
```

The factory enforces a consistent pattern: every query hook in the project has the same shape. It also makes it impossible to accidentally forget `queryKey` or `queryFn` — the factory requires both.

**How** does it work?

`createQuery` returns a function (the hook). When you call `useProfile()` in a component, you're calling that returned function, which calls `useQuery` internally with the pre-configured `queryKey` and `queryFn`. The optional `options` parameter lets you pass additional React Query options (like `enabled`, `select`, `staleTime`) for hooks that need them.

```
createQuery(queryKey, queryFn, options?)
      │
      └── returns () => useQuery({ queryKey, queryFn, ...options })
                              │
                              └── this is the hook you call in components
```

**When** do you use `createQuery`?

Use it for every read operation (GET request) that needs caching. If you're fetching a list of jobs, a single job by ID, the current user's profile, or any other server data — use `createQuery`. For write operations (POST, PATCH, DELETE), use `useMutation` directly (see Phase 5).

---

### 6.3 `queryKeys` Registry

**What** is the `queryKeys` registry?

`queryKeys` is a centralized object in `src/lib/react-query/queryKeys.ts` that defines every React Query cache key used in the application. Instead of writing `['jobs', params]` inline wherever you need a query key, you call `queryKeys.jobs.all(params)`.

Here is the actual source:

```typescript
// src/lib/react-query/queryKeys.ts
export const queryKeys = {
  auth: {
    profile: ['auth', 'profile'] as const,
  },
  jobs: {
    all: (params?: object) => ['jobs', params] as const,
    byId: (id: string) => ['jobs', id] as const,
  },
  shops: {
    all: (params?: object) => ['shops', params] as const,
    byId: (id: string) => ['shops', id] as const,
  },
  listedProducts: {
    all: (params?: object) => ['listed-products', params] as const,
    byId: (id: string) => ['listed-products', id] as const,
  },
  requestedProducts: {
    all: (params?: object) => ['requested-products', params] as const,
    byId: (id: string) => ['requested-products', id] as const,
  },
  users: {
    all: ['users'] as const,
    byId: (id: string) => ['users', id] as const,
  },
}
```

**Why** does a centralized registry prevent bugs?

React Query uses query keys to identify cached data. If two parts of the app use different key arrays for the same data, they get separate cache entries — one might be stale while the other is fresh, and invalidating one won't invalidate the other.

Consider what happens without the registry:

```typescript
// In useJobs.ts:
useQuery({ queryKey: ['jobs', filters], queryFn: ... })

// In JobsPage.tsx after a mutation:
queryClient.invalidateQueries({ queryKey: ['job', filters] })
//                                          ^^^^^ typo: 'job' not 'jobs'
// Result: the cache is NOT invalidated — stale data stays on screen
```

With the registry, both places use `queryKeys.jobs.all(filters)`. The key is defined once, used everywhere. A typo in the registry is caught immediately because TypeScript will complain about the missing property.

**How** are the keys used in practice?

```typescript
// Fetching all jobs with filters:
const { data } = useQuery({
  queryKey: queryKeys.jobs.all({ type: 'FULL_TIME' }),
  queryFn: () => jobsApi.getAll({ type: 'FULL_TIME' }),
})

// Fetching a single job by ID:
const { data } = useQuery({
  queryKey: queryKeys.jobs.byId(id),
  queryFn: () => jobsApi.getById(id),
})

// Invalidating all jobs after creating a new one:
queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all() })

// Server-side prefetch (in page.tsx):
qc.setQueryData(queryKeys.jobs.byId(id), jobData)
```

The same key that was used to store the data on the server is used to read it on the client — React Query matches them and skips the network request.

```
Server (page.tsx)                    Client (useJobDetail.ts)
─────────────────                    ────────────────────────
qc.setQueryData(                     useQuery({
  queryKeys.jobs.byId(id),  ──────►    queryKey: queryKeys.jobs.byId(id),
  jobData                              queryFn: () => jobsApi.getById(id),
)                                    })
                                     // queryFn is NOT called — data already in cache
```

**When** do you add a new key to the registry?

Every time you add a new query hook. Before writing the hook, add the key to `queryKeys.ts`. This is one of the "common mistakes to avoid" covered in Phase 11 — creating a query hook with an inline key array means the key can never be reliably invalidated from other parts of the app.

---

### 6.4 Zustand Store Factories

**What** are the Zustand store factories?

Two utility functions in `src/lib/zustand/` standardize how Zustand stores are created:

- `createStore` in `src/lib/zustand/createStore.ts` — a thin wrapper around Zustand's `create`
- `createPersistedStore` in `src/lib/zustand/persist.ts` — wraps `create` + `persist` middleware for stores that need to survive page refreshes

Here are the actual sources:

```typescript
// src/lib/zustand/createStore.ts
import { create, type StateCreator } from 'zustand'

export function createStore<T>(initializer: StateCreator<T>) {
  return create<T>(initializer)
}
```

```typescript
// src/lib/zustand/persist.ts
import { create, type StateCreator } from 'zustand'
import { persist as zustandPersist, type PersistOptions } from 'zustand/middleware'

export function createPersistedStore<T>(
  initializer: StateCreator<T>,
  options: PersistOptions<T>
) {
  return create<T>()(zustandPersist(initializer, options))
}
```

**Why** do these wrappers exist?

They enforce a consistent pattern for store creation across the project. Without them, each store file would need to import `create` and `persist` separately and wire them together manually — which is easy to get wrong (the `create<T>()()` double-call syntax for middleware is a common source of confusion). The factories hide that complexity.

`createPersistedStore` also makes the `options` parameter required, which forces every persisted store to explicitly declare its `name` (the localStorage key). This prevents two stores from accidentally using the same localStorage key and overwriting each other's data.

**How** does `useAuthStore` use persistence?

The auth store uses Zustand's `persist` middleware directly (not via `createPersistedStore`, but the pattern is identical):

```typescript
// src/modules/auth/store/auth.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState } from '../types'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
)
```

The `name: 'auth-storage'` option is the localStorage key. Open your browser's DevTools → Application → Local Storage → `localhost:3000` and you'll see an `auth-storage` entry containing the serialized store state. When the page reloads, Zustand reads this entry and rehydrates the store — so the user stays logged in across refreshes.

```
First login:
  useAuthStore.setAuth(user, accessToken, refreshToken)
        │
        ▼
  Zustand state updated in memory
        │
        ▼
  persist middleware serializes state → localStorage['auth-storage']

Page refresh:
  Browser loads page
        │
        ▼
  Zustand initializes with null defaults
        │
        ▼
  persist middleware reads localStorage['auth-storage']
        │
        ▼
  Store rehydrated: isAuthenticated = true, user = { ... }
        │
        ▼
  ProtectedLayout sees isAuthenticated = true → no redirect
```

**When** do you use `createStore` vs `createPersistedStore`?

- `createStore` — for transient UI state that should reset on page refresh (e.g., a modal open/close state, a filter panel state)
- `createPersistedStore` — for state that must survive page refreshes (e.g., user session, user preferences, shopping cart)

The auth store uses persistence because losing the user session on every page refresh would force the user to log in again constantly.

---

### 6.5 Component Split — `common/` vs `layouts/`

**What** is the component split?

Shared React components live in `src/components/` and are divided into two sub-directories:

```
src/components/
├── common/         ← Shared UI primitives used across many features
│   ├── AppFooter/
│   ├── AppHeader/
│   ├── BackButton/
│   ├── FormError/
│   ├── ImageUploader/
│   ├── Input/
│   ├── Loader/
│   ├── Modal/
│   ├── Pagination/
│   ├── PolicyModal/
│   ├── Search/
│   └── index.ts    ← barrel export
│
└── layouts/        ← Layout wrappers that define page structure
    ├── MainLayout.tsx        ← Full-page layout: AppHeader + children + AppFooter
    ├── MainLayout.module.css
    ├── UserLayout.tsx        ← Account pages: sidebar + content area
    └── UserLayout.module.css
```

**Why** separate `common/` from `layouts/`?

`common/` components are UI primitives — they render a piece of UI and don't care about page structure. `Input` renders an input field. `Modal` renders a dialog. `Pagination` renders page controls. They can appear anywhere.

`layouts/` components are structural wrappers — they define the skeleton of a page. `MainLayout` wraps a page with the site header and footer. `UserLayout` wraps account pages with a sidebar navigation. They are used at the page level, not inside other components.

Mixing them would make `common/` a dumping ground. Keeping them separate makes it immediately clear: "is this a UI primitive or a page structure?"

**How** are they used?

```typescript
// MainLayout wraps pages that need the standard header + footer
// Used in src/app/(protected)/layout.tsx
<MainLayout>
  {children}
</MainLayout>

// UserLayout wraps account pages that need the sidebar
// Used in src/app/(protected)/account/*/page.tsx
<UserLayout>
  <EditProfilePage />
</UserLayout>

// common/ components are used inside page components and module components
import { Input, Modal, Pagination, Loader } from '@/components/common'
```

```
Page structure with layouts:

┌─────────────────────────────────────┐
│  MainLayout                          │
│  ┌───────────────────────────────┐  │
│  │  AppHeader                    │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  {children}  (page content)   │  │
│  │                               │  │
│  │  ┌──────────────────────────┐ │  │
│  │  │  UserLayout (if account) │ │  │
│  │  │  ┌────────┬───────────┐  │ │  │
│  │  │  │Sidebar │  content  │  │ │  │
│  │  │  └────────┴───────────┘  │ │  │
│  │  └──────────────────────────┘ │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  AppFooter                    │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**When** do you add to `common/` vs `layouts/` vs a module's own `components/`?

| Where to add | When |
|---|---|
| `src/components/common/` | The component is a UI primitive used by 2+ features (e.g., a shared `Badge`, `Tooltip`, `Avatar`) |
| `src/components/layouts/` | The component defines a full-page structural skeleton (header + content + footer, or sidebar + content) |
| `src/modules/{feature}/components/` | The component is specific to one feature and won't be reused elsewhere (e.g., `JobCard`, `ShopHours`, `ProductBadge`) |

The rule of thumb: start in the module. If you find yourself copying the component to a second module, move it to `common/`.

---

### 6.6 CSS Architecture — `src/styles/`

**What** is the CSS architecture?

Global styles are split into four files in `src/styles/`:

```
src/styles/
├── variables.css   ← Design tokens: colors, spacing, radius, shadows, typography
├── utilities.css   ← Helper classes: flex, grid, truncate, visually-hidden, etc.
├── design.css      ← Component-level styles: cards, buttons, badges, forms
└── pages.css       ← Page-level layout styles: hero sections, grid layouts
```

All four files are imported in `src/app/globals.css`, which is imported once in `src/app/layout.tsx`.

**Why** use CSS variables for design tokens?

`variables.css` defines the entire design system as CSS custom properties (variables):

```css
/* src/styles/variables.css */
:root {
  /* Brand */
  --color-primary:        #2a14b4;
  --color-primary-dark:   #1e0e8a;
  --color-primary-light:  #e8eeff;

  /* Semantic */
  --color-error:          #ba1a1a;
  --color-success:        #166534;

  /* Spacing */
  --space-4:  16px;
  --space-6:  24px;
  --space-8:  32px;

  /* Radius */
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;

  /* Shadow */
  --shadow-md:  0 4px 16px rgba(11, 28, 48, 0.08);

  /* Layout */
  --header-height: 64px;
  --sidebar-width: 220px;
}
```

Without design tokens, every component that needs the primary color hardcodes `#2a14b4`. When the brand color changes, you search-and-replace across dozens of files and inevitably miss some. With CSS variables, you change `--color-primary` in one place and every component updates automatically.

Design tokens also make the design system self-documenting. A new developer can open `variables.css` and immediately understand the full color palette, spacing scale, and radius system — without reading every component file.

**How** does each file fit into the architecture?

| File | Purpose | Example content |
|---|---|---|
| `variables.css` | Design tokens — the single source of truth for all visual constants | `--color-primary: #2a14b4`, `--space-4: 16px`, `--radius-md: 12px` |
| `utilities.css` | Reusable helper classes for common patterns | `.flex-center { display: flex; align-items: center; justify-content: center; }` |
| `design.css` | Component-level styles for shared UI patterns | `.card { background: var(--color-surface); border-radius: var(--radius-md); }` |
| `pages.css` | Page-level layout styles for full-page sections | `.hero-grid { display: grid; grid-template-columns: 1fr 1fr; }` |

The split follows the cascade: tokens → utilities → components → pages. Each layer builds on the previous one using the variables defined in `variables.css`.

```
variables.css  ──► defines --color-primary, --space-4, --radius-md
      │
      ▼
design.css     ──► .btn-primary { background: var(--color-primary); padding: var(--space-4); }
      │
      ▼
pages.css      ──► .landing-hero { padding: var(--space-12) var(--space-6); }
      │
      ▼
Component CSS modules ──► .container { border-radius: var(--radius-md); }
```

**When** do you add to each file?

- New color, spacing value, or visual constant → `variables.css`
- New reusable layout helper (flex shorthand, truncation, screen-reader-only) → `utilities.css`
- New shared component style (card variant, button style, badge) → `design.css`
- New page-level layout (hero section, feature grid, full-bleed banner) → `pages.css`
- Styles specific to one component → a co-located `ComponentName.module.css` file (CSS Modules, not in `src/styles/`)

---

### 6.7 `globalStaticData.ts` Pattern

**What** is this pattern?

See Phase 3, section 3.7 for the full explanation of `globalStaticData.ts`. In brief: all static constants used across the application are centralized in `src/utils/globalStaticData.ts` and imported from there instead of being defined inline in components.

**Why** is this the frontend equivalent of CSS variables?

The CSS variables pattern (`variables.css`) and the `globalStaticData.ts` pattern solve the same problem in different domains:

- `variables.css` centralizes visual constants (colors, spacing, radius) so you never hardcode `#2a14b4` in a component
- `globalStaticData.ts` centralizes data constants (labels, links, arrays) so you never hardcode `'FULL_TIME'` or `'/account/my-profile'` in a component

Both patterns follow the same principle: **centralize constants, avoid magic values**. A magic value is any literal that appears in code without explanation — `'FULL_TIME'`, `['monday', 'tuesday', ...]`, `{ href: '/jobs' }`. When that value needs to change, you have to find every occurrence. When it's centralized, you change it once.

**How** are the constants used?

```typescript
// src/utils/globalStaticData.ts exports:
export const JOB_TYPE_LABEL: Record<string, string> = {
  FULL_TIME:  'Full-Time',
  PART_TIME:  'Part-Time',
  INTERNSHIP: 'Internship',
  CONTRACT:   'Contract',
}

export const SIDEBAR_LINKS = [
  { href: '/account/my-profile',      label: 'My Profile',   icon: '👤' },
  { href: '/account/manage-listing',  label: 'My Listings',  icon: '🛍'  },
  // ...
] as const

export const CATEGORY_BG: Record<string, string> = {
  ELECTRONICS: '#dcfce7',
  CLOTHING_FASHION: '#fce7f3',
  // ...
}
```

Usage in components:

```typescript
// JobCard.tsx — uses JOB_TYPE_LABEL instead of a hardcoded switch statement
import { JOB_TYPE_LABEL } from '@/utils/globalStaticData'

<span>{JOB_TYPE_LABEL[job.type] ?? job.type}</span>

// UserLayout.tsx — uses SIDEBAR_LINKS instead of an inline array
import { SIDEBAR_LINKS } from '@/utils/globalStaticData'

{SIDEBAR_LINKS.map((link) => (
  <NavLink key={link.href} href={link.href} icon={link.icon}>
    {link.label}
  </NavLink>
))}

// ProductCard.tsx — uses CATEGORY_BG for dynamic badge colors
import { CATEGORY_BG, CATEGORY_TEXT } from '@/utils/globalStaticData'

<span style={{ background: CATEGORY_BG[product.category], color: CATEGORY_TEXT[product.category] }}>
  {product.category}
</span>
```

**When** do you add to `globalStaticData.ts`?

When you find yourself writing a literal array, object, or string constant that:
- Is used in more than one component, OR
- Represents a domain value that might change (job types, category names, navigation links), OR
- Would be a "magic value" if left inline (a hardcoded color hex, a hardcoded URL path, a hardcoded label string)

If the constant is only used in one component and is unlikely to change, it's fine to keep it local. But when in doubt, centralize it.


---

## Phase 7: Admin Panel (Separate React App)

The Admin Panel is not part of this Next.js repository. It is a completely separate React SPA that uses the same `/api/*` Route Handlers as the Next.js frontend. This phase explains how that integration works, how CORS is configured to allow it, and how admin-only access is enforced.

---

### 7.1 What is the Admin Panel?

**What** is the Admin Panel?

The Admin Panel is a standalone React SPA — a completely separate project, not inside this Next.js repo. It runs on its own dev server (`localhost:5173` or `localhost:5174` in development) and is built and deployed independently from the Next.js app.

**Why** is it a separate app?

The Admin Panel has a different audience (internal staff, not end users), a different UI, and different feature requirements. Keeping it as a separate SPA means it can be developed, deployed, and scaled independently. It does not need Next.js's SSR or file-system routing — it is a pure client-side app.

**How** does it communicate with the backend?

There is no separate admin API. The Admin Panel calls the same `/api/*` Route Handlers that the Next.js frontend uses. The only difference is that the Admin Panel authenticates with an ADMIN-role account, which unlocks admin-only endpoints (see section 7.3).

```
┌──────────────────────────────────────────────────────────────────────┐
│                           BROWSER                                     │
│                                                                       │
│   Next.js React Pages          Admin Panel (separate React SPA)       │
│   src/app/(protected)/         localhost:5173 / localhost:5174        │
│         │                                  │                          │
│         │  same origin                     │  cross-origin            │
│         │  (no CORS needed)                │  (CORS required)         │
└─────────┼──────────────────────────────────┼──────────────────────────┘
          │                                  │
          ▼                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APP  (localhost:3000)                      │
│                                                                       │
│  src/proxy.ts ──► CORS guard (allows localhost:5173 / localhost:5174) │
│                                                                       │
│  src/app/api/  ──► Route Handlers (shared by both clients)           │
│    /api/auth   ──► login, logout, refresh, profile                   │
│    /api/shops  ──► admin: POST/PUT/DELETE; public: GET               │
│    /api/jobs   ──► admin: POST/PUT/DELETE; public: GET               │
│    /api/cms    ──► admin: POST/PUT/DELETE; public: GET               │
│    /api/users  ──► admin only: GET                                   │
└─────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    MONGODB  (via Mongoose)                            │
└─────────────────────────────────────────────────────────────────────┘
```

**When** does the Admin Panel matter to you as a Next.js developer?

When you add or modify a Route Handler that the Admin Panel uses. Any change to an admin-only endpoint affects both the Next.js frontend and the Admin Panel. The CORS config in `src/proxy.ts` must also be updated if the Admin Panel is deployed to a new origin.

---

### 7.2 CORS Configuration in `src/proxy.ts`

**What** is CORS?

CORS (Cross-Origin Resource Sharing) is a browser security mechanism. When a web page on `localhost:5173` tries to call an API on `localhost:3000`, the browser blocks the request unless the server explicitly says "I allow requests from `localhost:5173`." The server communicates this via `Access-Control-Allow-*` response headers.

**Why** is CORS needed for the Admin Panel but not for the Next.js frontend?

The Next.js frontend pages are served from `localhost:3000` and call `/api/*` on the same origin — no CORS needed. The Admin Panel is served from `localhost:5173` or `localhost:5174` — a different origin — so the browser requires CORS headers before it will send the request.

**How** is CORS configured in this project?

Here is the actual CORS setup from `src/proxy.ts`:

```typescript
// src/proxy.ts

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',  // Admin Panel primary dev port (Vite default)
  'http://localhost:5174',  // Admin Panel alt dev port (when 5173 is taken)
]

function setCorsHeaders(res: NextResponse, origin: string) {
  res.headers.set('Access-Control-Allow-Origin', origin)
  res.headers.set('Access-Control-Allow-Credentials', 'true')
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const origin = req.headers.get('origin') ?? ''

  if (pathname.startsWith('/api/')) {
    const isAllowed = ALLOWED_ORIGINS.includes(origin)

    // Preflight request — browser sends OPTIONS before the real request
    if (req.method === 'OPTIONS') {
      const res = new NextResponse(null, { status: 204 })
      if (isAllowed) setCorsHeaders(res, origin)
      return res
    }

    // Real request — attach CORS headers if origin is allowed
    const res = NextResponse.next()
    if (isAllowed) setCorsHeaders(res, origin)
    return res
  }
  // ...
}
```

Breaking down each piece:

**`ALLOWED_ORIGINS`** — an explicit whitelist. Only origins in this array receive CORS headers. Any other origin (e.g., a random third-party site) gets no CORS headers and the browser blocks the request. `localhost:5173` and `localhost:5174` are the Vite dev server ports used by the Admin Panel.

**`setCorsHeaders`** — sets four response headers:
- `Access-Control-Allow-Origin: <origin>` — tells the browser which origin is allowed. The value is the exact origin from the request (not `*`) because credentials are involved.
- `Access-Control-Allow-Credentials: true` — **critical for cookie-based auth**. Without this header, the browser will not send httpOnly cookies on cross-origin requests, even if `withCredentials: true` is set on the Axios client. The browser requires explicit server permission to include credentials.
- `Access-Control-Allow-Methods` — lists the HTTP methods the Admin Panel is allowed to use.
- `Access-Control-Allow-Headers` — lists the request headers the Admin Panel is allowed to send.

**Preflight (OPTIONS) requests** — before sending a non-simple request (e.g., a `POST` with a JSON body), the browser first sends an `OPTIONS` request to ask "are you willing to accept this?" The proxy intercepts `OPTIONS` requests, returns `204 No Content` with the CORS headers, and the browser proceeds with the real request.

```
CORS flow for Admin Panel calling POST /api/shops:

Admin Panel (localhost:5173)
      │
      │  1. Browser sends OPTIONS /api/shops
      │     Origin: http://localhost:5173
      ▼
src/proxy.ts
      │  2. method === 'OPTIONS' → return 204 + CORS headers
      │     Access-Control-Allow-Origin: http://localhost:5173
      │     Access-Control-Allow-Credentials: true
      │     Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
      ▼
Admin Panel (localhost:5173)
      │  3. Browser sees CORS headers — preflight passed
      │
      │  4. Browser sends real POST /api/shops
      │     Origin: http://localhost:5173
      │     Cookie: accessToken=...  (sent because Allow-Credentials: true)
      ▼
src/proxy.ts
      │  5. method !== 'OPTIONS' → NextResponse.next() + CORS headers
      ▼
Route Handler (src/app/api/shops/route.ts)
      │  6. Processes request, returns response
      ▼
Admin Panel receives response
```

**When** do you need to update the CORS config?

- Admin Panel is deployed to a new domain → add the production URL to `ALLOWED_ORIGINS`
- Admin Panel dev port changes → update `localhost:5173` / `localhost:5174`
- A new cross-origin client needs API access → add its origin to `ALLOWED_ORIGINS`

---

### 7.3 Admin-Only Endpoints

**What** is the `authorize` function?

`authorize` is a utility in `src/backend/lib/authorize.ts` that enforces role-based access control at the Route Handler level. It takes the current user and a list of allowed roles, and either returns the user (if authorized) or throws an error (if not).

Here is the actual code:

```typescript
// src/backend/lib/authorize.ts
import { AppError } from './appError'
import { IUser, UserRole } from '../types/backend.types'

export { UserRole }

export function authorize(user: IUser | null, ...roles: UserRole[]): IUser {
  if (user === null) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
  }
  if (!roles.includes(user.role)) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }
  return user
}
```

**Why** does `authorize` exist as a separate function?

It centralizes the role-check logic so every Route Handler enforces access control the same way. Without it, each handler would need its own `if (!user || user.role !== 'ADMIN') throw ...` block — duplicated, inconsistent, and easy to forget. With `authorize`, the check is one line and the intent is explicit.

**How** does it work?

1. Takes `user` (from `getAuthUser()`) and one or more `UserRole` values as rest parameters.
2. If `user` is `null` (not authenticated) → throws `AppError('Unauthorized', 401, 'UNAUTHORIZED')`. `withErrorHandler` catches this and returns a `401` response.
3. If `user.role` is not in the `roles` array → throws `AppError('Forbidden', 403, 'FORBIDDEN')`. `withErrorHandler` catches this and returns a `403` response.
4. If both checks pass → returns the user object (typed as `IUser`, not `IUser | null`).

Usage in a Route Handler:

```typescript
// src/app/api/shops/route.ts (POST — admin only)
export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser()
  authorize(user, UserRole.ADMIN)   // throws 401 or 403 if not an admin
  // ... rest of handler runs only if user is ADMIN
})
```

The Admin Panel logs in with an ADMIN-role account. After login, the httpOnly `accessToken` cookie is set. Every subsequent request from the Admin Panel includes that cookie (because `withCredentials: true` is set on its Axios client), and `getAuthUser()` reads it server-side to identify the user.

**When** are admin-only checks applied?

The following endpoint groups require `authorize(user, UserRole.ADMIN)` for write operations:

| Endpoint group | Admin-only operations |
|---|---|
| `/api/shops` | `POST` (create), `PUT` (update), `DELETE` (delete) |
| `/api/jobs` | `POST` (create), `PUT` (update), `DELETE` (delete) |
| `/api/cms` | `POST` (create), `PUT` (update), `DELETE` (delete) |
| `/api/users` | `GET` (list all users) |

Read operations (`GET`) on shops, jobs, and CMS are public — any authenticated user can read them. Only write operations and user management are restricted to ADMIN.

---

### 7.4 Role-Based Access Control Model

**What** is the RBAC model in this project?

There are exactly two roles, defined in the `UserRole` enum:

```typescript
// src/backend/types/backend.types.ts
enum UserRole {
  USER  = 'USER',
  ADMIN = 'ADMIN',
}
```

Every user in the database has a `role` field set to one of these values. New accounts default to `USER`.

**Why** only two roles?

The application has a clear split: regular users manage their own marketplace content, and admins manage the platform content (shops, jobs, CMS) and can view all users. A more granular RBAC system (e.g., moderator, editor) is not needed at this stage. Two roles keeps the authorization logic simple and auditable.

**How** does each role map to permissions?

| Role | What they can do | Endpoints |
|---|---|---|
| `USER` | Create, update, and delete their own marketplace listings | `POST/PUT/DELETE /api/listed-products` |
| `USER` | Create, update, and delete their own product requests | `POST/PUT/DELETE /api/requested-products` |
| `USER` | Read their own profile, update it | `GET/PUT /api/auth/profile` |
| `ADMIN` | All USER permissions, plus: | |
| `ADMIN` | Manage shops (create, update, delete) | `POST/PUT/DELETE /api/shops` |
| `ADMIN` | Manage jobs (create, update, delete) | `POST/PUT/DELETE /api/jobs` |
| `ADMIN` | Manage CMS content (create, update, delete) | `POST/PUT/DELETE /api/cms` |
| `ADMIN` | View all users | `GET /api/users` |

The Admin Panel logs in with an ADMIN-role account and uses the same httpOnly cookie authentication mechanism as the Next.js frontend. There is no separate admin token or admin login endpoint — the same `POST /api/auth/login` Route Handler is used, and the resulting cookie grants access to admin endpoints because the account's `role` is `ADMIN`.

```
Role check flow:

Admin Panel sends POST /api/shops
      │
      ▼
src/proxy.ts  ──► CORS headers attached (origin: localhost:5173)
      │
      ▼
withErrorHandler wraps the Route Handler
      │
      ▼
getAuthUser()  ──► reads accessToken cookie ──► looks up user in MongoDB
      │                                          returns IUser { role: 'ADMIN' }
      ▼
authorize(user, UserRole.ADMIN)
      │
      ├── user is null?  ──► throw 401 UNAUTHORIZED
      ├── user.role not in ['ADMIN']?  ──► throw 403 FORBIDDEN
      └── user.role === 'ADMIN'  ──► return user ✓
      │
      ▼
Route Handler business logic executes
      │
      ▼
sendSuccess(data, 'Shop created')  ──► 200 response to Admin Panel
```

**When** do you need to think about roles?

When adding a new endpoint: decide whether it should be public (no auth), user-only (any authenticated user), or admin-only. Apply `authorize(user, UserRole.ADMIN)` for admin-only operations. For user-owned resources (like listed products), use `getAuthUser()` without `authorize` and then check that the resource belongs to the requesting user.

---

### 7.5 Data Flow: Admin Panel → Next.js → MongoDB

**What** is the data flow?

When the Admin Panel performs an operation (e.g., creating a new shop), the request travels from the Admin Panel's browser → through CORS → to a Next.js Route Handler → through the backend service layer → to MongoDB. The response travels back the same way.

**Why** does the Admin Panel call Next.js Route Handlers instead of MongoDB directly?

Three reasons:

1. **Security** — MongoDB credentials (the connection string in `.env`) never leave the Next.js server. The Admin Panel never has direct database access. If the Admin Panel is compromised, the attacker cannot reach MongoDB.
2. **Consistency** — The same validation (Zod schemas), business logic (service functions), and error handling (`withErrorHandler`, `AppError`) applies to both the Next.js frontend and the Admin Panel. There is no risk of the Admin Panel bypassing validation that the frontend enforces.
3. **Single source of truth** — One API serves both clients. Bug fixes, new validations, and business rule changes in the Route Handlers automatically apply to both the Next.js frontend and the Admin Panel. There is no duplication.

**How** does the full data flow look?

```
Admin Panel (localhost:5173)
      │
      │  POST /api/shops
      │  Headers: Origin: http://localhost:5173
      │  Cookie: accessToken=<jwt>  (httpOnly, sent automatically)
      │  Body: { name: "Tech Shop", ... }
      ▼
src/proxy.ts
      │  CORS check: localhost:5173 is in ALLOWED_ORIGINS ✓
      │  setCorsHeaders(res, 'http://localhost:5173')
      │  NextResponse.next()  ──► passes to Route Handler
      ▼
src/app/api/shops/route.ts  (POST handler)
      │  withErrorHandler wraps everything
      │  getAuthUser()  ──► reads accessToken cookie ──► IUser { role: 'ADMIN' }
      │  authorize(user, UserRole.ADMIN)  ──► passes ✓
      │  validate(createShopSchema, body)  ──► Zod validates input ✓
      │  createShop(data)  ──► calls service
      ▼
src/backend/services/shop.service.ts
      │  connectDB()  ──► ensures Mongoose connection
      │  ShopModel.create(data)  ──► inserts document
      ▼
MongoDB
      │  { _id: "...", name: "Tech Shop", ... }
      ▼
shop.service.ts  ──► returns new shop document
      ▼
Route Handler  ──► sendSuccess(shop, 'Shop created', 201)
      ▼
src/proxy.ts  ──► CORS headers on response
      ▼
Admin Panel receives { success: true, data: { _id: "...", name: "Tech Shop" } }
```

**When** does this data flow matter?

When debugging Admin Panel issues. If the Admin Panel gets a `401`, the cookie is missing or expired — check that `withCredentials: true` is set on the Admin Panel's Axios client. If it gets a `403`, the logged-in account does not have the `ADMIN` role. If it gets a `400`, the request body failed Zod validation in the Route Handler. If it gets a CORS error in the browser console, the origin is not in `ALLOWED_ORIGINS` or the preflight failed.


---

## Phase 8: Security Design

Security is not an afterthought in this project — it is baked into every layer. This phase explains every security decision: why tokens live in httpOnly cookies, how refresh token rotation detects theft, why hashes are stored instead of raw tokens, and what the client must do when the server signals a compromise.

---

### 8.1 httpOnly Cookie Strategy

**What** is the httpOnly cookie strategy?

Instead of storing `accessToken` and `refreshToken` in `localStorage` or `sessionStorage`, this project stores them in **httpOnly cookies** — cookies that the browser manages automatically and that JavaScript cannot read.

Here is the actual `setAuthCookies` function from `src/backend/lib/cookies.ts`:

```typescript
// src/backend/lib/cookies.ts
import { cookies } from 'next/headers'

const IS_PROD = process.env.NODE_ENV === 'production'

export async function setAuthCookies(accessToken: string, refreshToken: string): Promise<void> {
  const store = await cookies()
  store.set('accessToken', accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: 900, // 15 minutes — matches JWT expiry
  })
  store.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: 604800,
  })
}
```

Each flag has a specific security purpose:

| Flag | Value | What it does |
|---|---|---|
| `httpOnly: true` | always | JavaScript **cannot** read this cookie. `document.cookie` will not show it. XSS scripts cannot steal it. |
| `secure: IS_PROD` | `true` in production | Cookie is only sent over HTTPS. In development (`IS_PROD = false`) it works over HTTP for convenience. |
| `sameSite: 'lax'` | always | Cookie is sent on same-site requests and top-level cross-site navigations (e.g., clicking a link), but NOT on cross-site sub-resource requests. This blocks CSRF attacks while allowing normal navigation. |
| `maxAge: 900` | accessToken | Expires in 15 minutes. Short-lived to limit the damage window if somehow intercepted. |
| `maxAge: 604800` | refreshToken | Expires in 7 days. Long-lived so users stay logged in, but rotation (section 8.2) limits the risk. |

**Why** cookies instead of `localStorage`?

```
localStorage tokens vs httpOnly cookies
────────────────────────────────────────────────────────────────────────
                    localStorage            httpOnly cookie
────────────────────────────────────────────────────────────────────────
JS readable?        YES — any script        NO — browser only
XSS risk?           HIGH — attacker JS      NONE — JS cannot access
                    can read the token
CSRF risk?          LOW — JS must           LOW — sameSite: 'lax'
                    manually attach         blocks cross-site POSTs
Sent automatically? NO — must set           YES — browser attaches
                    Authorization header    automatically
Works cross-origin? YES                     YES (with withCredentials)
────────────────────────────────────────────────────────────────────────
```

The critical difference: if an attacker injects a malicious script into the page (XSS), that script can call `localStorage.getItem('accessToken')` and steal the token. With httpOnly cookies, the same script gets nothing — the browser refuses to expose the cookie to JavaScript.

**How** does it work in practice?

After a successful login, `setAuthCookies` is called server-side inside the Route Handler. The browser receives the `Set-Cookie` headers and stores the cookies. On every subsequent request, the browser automatically attaches the cookies — no JavaScript involvement needed.

**When** are cookies set and cleared?

- Set: after `POST /api/auth/login` and `POST /api/auth/refresh`
- Cleared: after `POST /api/auth/logout` (via `clearAuthCookies()` which sets `maxAge: 0`)

---

### 8.2 Refresh Token Rotation

**What** is refresh token rotation?

Every time the client calls `POST /api/auth/refresh`, the server:
1. Validates the current refresh token
2. Issues a **brand new** refresh token (and a new access token)
3. **Invalidates** the old refresh token in the database
4. Returns the new tokens as httpOnly cookies

The old refresh token is gone — it can never be used again.

**Why** rotate refresh tokens?

Rotation enables **token theft detection**. If an attacker steals a refresh token and uses it after the legitimate user has already rotated it, the server sees a token that no longer exists in the database. This is the `TOKEN_REUSE` signal — the server immediately revokes ALL sessions for that user.

**How** does the rotation logic work?

Here is the relevant section from `src/backend/services/auth.service.ts`:

```typescript
export async function refreshUserToken(
  token: string,
  deviceInfo?: { ip?: string; name?: string }
): Promise<{ accessToken: string; refreshToken: string }> {
  await connectDB()

  let decoded: { id: string }
  try {
    decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string }
  } catch {
    throw new AppError('Invalid token', 401, 'INVALID_TOKEN')
  }

  const hashedToken = hashToken(token)
  const storedToken = await RefreshTokenModel.findOne({ token: hashedToken })

  if (!storedToken) {
    // Token not found — it was already used or never existed
    // Revoke ALL sessions for this user immediately
    await RefreshTokenModel.deleteMany({ userId: decoded.id })
    throw new AppError('Token reuse detected', 401, 'TOKEN_REUSE')
  }

  const newAccessToken = generateAccessToken(decoded.id)
  const newRefreshToken = generateRefreshToken(decoded.id)

  // Replace old token hash with new token hash in-place
  storedToken.token = hashToken(newRefreshToken)
  storedToken.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  if (deviceInfo) storedToken.deviceInfo = deviceInfo
  await storedToken.save()

  return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}
```

**Normal rotation flow:**

```
Client                          Server                        MongoDB
  │                               │                              │
  │  POST /api/auth/refresh        │                              │
  │  Cookie: refreshToken=T1       │                              │
  │ ─────────────────────────────► │                              │
  │                               │  hashToken(T1) = H1          │
  │                               │ ──────────────────────────► │
  │                               │  findOne({ token: H1 })      │
  │                               │ ◄────────────────────────── │
  │                               │  found ✓                     │
  │                               │                              │
  │                               │  generate T2, H2             │
  │                               │  storedToken.token = H2      │
  │                               │ ──────────────────────────► │
  │                               │  save (H1 replaced by H2)    │
  │                               │ ◄────────────────────────── │
  │  Set-Cookie: refreshToken=T2   │                              │
  │ ◄───────────────────────────── │                              │
  │  (T1 is now dead)              │                              │
```

**TOKEN_REUSE detection flow (attacker scenario):**

```
Legitimate user rotates T1 → T2 (T1 is now dead in DB)

Attacker (who stole T1) tries to use it:

Attacker                        Server                        MongoDB
  │                               │                              │
  │  POST /api/auth/refresh        │                              │
  │  Cookie: refreshToken=T1       │                              │
  │ ─────────────────────────────► │                              │
  │                               │  hashToken(T1) = H1          │
  │                               │ ──────────────────────────► │
  │                               │  findOne({ token: H1 })      │
  │                               │ ◄────────────────────────── │
  │                               │  NOT FOUND (H1 was replaced) │
  │                               │                              │
  │                               │  TOKEN_REUSE detected!       │
  │                               │  deleteMany({ userId })      │
  │                               │ ──────────────────────────► │
  │                               │  ALL sessions deleted        │
  │  401 TOKEN_REUSE               │ ◄────────────────────────── │
  │ ◄───────────────────────────── │                              │
```

**When** does rotation happen?

Every time `POST /api/auth/refresh` is called — whether triggered automatically by the Axios interceptor (on a 401 response) or manually by the client. The rotation is atomic: the old token is replaced in the same database document.

---

### 8.3 Token Hashing

**What** is token hashing?

Refresh tokens and password reset tokens are never stored as plain text in MongoDB. Only their **SHA-256 hashes** are stored. The plain token is sent to the client (in the httpOnly cookie or via email) and immediately discarded server-side.

Here is the `hashToken` function from `src/backend/lib/jwt.ts`:

```typescript
// src/backend/lib/jwt.ts
import crypto from 'crypto'

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}
```

**Why** store hashes instead of plain tokens?

If the MongoDB database is breached, the attacker gets the `RefreshToken` collection. Without hashing, they would have valid refresh tokens they could use to impersonate any logged-in user. With SHA-256 hashing:

- The attacker gets a list of 64-character hex strings (hashes)
- SHA-256 is a **one-way function** — you cannot reverse a hash to get the original token
- The hashes are useless without the original tokens, which were only ever sent to the client over HTTPS

```
Token lifecycle:

Server generates refreshToken (plain JWT string)
      │
      ├── plain token ──► Set-Cookie: refreshToken=<plain>  (httpOnly)
      │                   (sent to client, never stored)
      │
      └── hashToken(plain) ──► SHA-256 hex string
                               stored in RefreshToken.token in MongoDB

On next refresh:
Client sends plain token in cookie
      │
      ▼
Server: hashToken(received) ──► compare to stored hash
      │
      ├── match ✓ ──► valid session, rotate
      └── no match ──► TOKEN_REUSE or invalid token
```

**How** does this protect against a database breach?

| Scenario | Without hashing | With SHA-256 hashing |
|---|---|---|
| DB breached | Attacker has valid tokens → can impersonate users | Attacker has hashes → useless without originals |
| Token intercepted in transit | Attacker can use it until expiry | Same risk — but HTTPS + httpOnly minimise this |
| Brute force hash reversal | N/A | Computationally infeasible for SHA-256 |

**When** is `hashToken` called?

- On login: `hashToken(refreshToken)` stored in `RefreshToken.token`
- On refresh: `hashToken(incomingToken)` compared to stored hash; `hashToken(newToken)` stored
- On logout: `hashToken(refreshToken)` used to find and delete the record
- On forgot-password: `hashToken(plainToken)` stored in `user.resetPasswordToken`
- On reset-password: `hashToken(urlToken)` used to find the user

---

### 8.4 Password Reset Security

**What** is the password reset security model?

The password reset flow uses a time-limited, single-use, hashed token that is only ever transmitted via email — never returned in an API response.

**Why** this design?

- The plain token is never in the API response body, so it cannot be intercepted by logging middleware, browser history, or response caching
- The SHA-256 hash in the database is useless to an attacker who breaches the DB (same reasoning as section 8.3)
- The 15-minute expiry limits the window of opportunity if the email is intercepted
- After use, the token fields are cleared — the same token cannot be used twice

**How** does it work?

Here is the relevant code from `src/backend/services/auth.service.ts`:

```typescript
export async function forgotPassword(email: string): Promise<string> {
  await connectDB()

  const user = await UserModel.findOne({ email })
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }

  // Generate 32 random bytes → 64-character hex string
  const plainToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex')

  user.resetPasswordToken = hashedToken          // only the hash is stored
  user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000)  // 15 min
  await user.save()

  await sendResetPasswordEmail(email, plainToken) // plain token goes ONLY to email

  return plainToken  // returned to Route Handler, which does NOT include it in the response
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await connectDB()

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  // Find user where hash matches AND expiry is in the future
  const user = await UserModel.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: new Date() },
  })

  if (!user) {
    throw new AppError('Invalid or expired token', 400, 'INVALID_OR_EXPIRED_TOKEN')
  }

  user.password = await bcrypt.hash(newPassword, 10)
  user.resetPasswordToken = undefined   // clear — token is now consumed
  user.resetPasswordExpire = undefined  // clear — expiry no longer needed
  await user.save()
}
```

**Password reset flow diagram:**

```
User                    Next.js Server              MongoDB           Email
  │                          │                         │                │
  │  POST /api/auth/          │                         │                │
  │  forgot-password          │                         │                │
  │  { email }                │                         │                │
  │ ────────────────────────► │                         │                │
  │                          │  randomBytes(32) → T     │                │
  │                          │  hashToken(T) → H        │                │
  │                          │  user.resetPasswordToken = H              │
  │                          │  user.resetPasswordExpire = now+15min     │
  │                          │ ──────────────────────► │                │
  │                          │  save user               │                │
  │                          │ ◄────────────────────── │                │
  │                          │  sendEmail(email, T) ──────────────────► │
  │  { success: true }        │  (T is NOT in response)  │                │
  │ ◄──────────────────────── │                         │                │
  │                          │                         │                │
  │  (user clicks email link) │                         │                │
  │  /reset-password?token=T  │                         │                │
  │                          │                         │                │
  │  POST /api/auth/          │                         │                │
  │  reset-password/T         │                         │                │
  │  { password: "new" }      │                         │                │
  │ ────────────────────────► │                         │                │
  │                          │  hashToken(T) → H        │                │
  │                          │  findOne({               │                │
  │                          │    resetPasswordToken: H  │                │
  │                          │    resetPasswordExpire:   │                │
  │                          │      { $gt: now }         │                │
  │                          │  }) ──────────────────► │                │
  │                          │ ◄────────────────────── │                │
  │                          │  user found ✓            │                │
  │                          │  bcrypt.hash(newPassword) │               │
  │                          │  clear token fields      │                │
  │                          │ ──────────────────────► │                │
  │  { success: true }        │  save user               │                │
  │ ◄──────────────────────── │ ◄────────────────────── │                │
```

**When** does the token expire?

The `resetPasswordExpire` field is set to `Date.now() + 15 * 60 * 1000` (15 minutes). The MongoDB query in `resetPassword` includes `resetPasswordExpire: { $gt: new Date() }` — if the token is expired, the query returns no user and the request fails with `INVALID_OR_EXPIRED_TOKEN`.

---

### 8.5 CORS Configuration

**What** is the CORS configuration?

See section 7.2 for the full CORS walkthrough. This section focuses on the security angle.

**Why** does `Access-Control-Allow-Credentials: true` require an explicit origin?

The HTTP spec forbids `Access-Control-Allow-Origin: *` when `Access-Control-Allow-Credentials: true` is also set. The browser will reject such a response. This is intentional: wildcard origins with credentials would mean any website on the internet could make authenticated requests to your API using the visitor's cookies — a severe CSRF vulnerability.

By using an explicit origin whitelist (`ALLOWED_ORIGINS`), the server says: "I trust requests from these specific origins to carry credentials." Any other origin gets CORS headers without credentials, or no CORS headers at all.

**How** does the whitelist approach improve security?

```
Wildcard approach (NOT used here):
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Credentials: true
  → Browser REJECTS this combination
  → Even if it worked: any site could make credentialed requests

Whitelist approach (used here):
  ALLOWED_ORIGINS = [
    'http://localhost:3000',  // Next.js itself
    'http://localhost:5173',  // Admin Panel
    'http://localhost:5174',  // Admin Panel alt port
    ...
  ]
  → Only listed origins receive CORS + credentials headers
  → Unlisted origins: no CORS headers → browser blocks the request
  → Attacker's site (evil.com) is not in the list → blocked
```

**When** do you update `ALLOWED_ORIGINS`?

When deploying the Admin Panel to a new domain or port. Add the production URL to `ALLOWED_ORIGINS` in `src/proxy.ts`. Never add `*` — always use explicit origins when credentials are involved.

---

### 8.6 `authorize` Middleware

**What** is the `authorize` middleware?

See section 7.3 for the full `authorize` walkthrough. This section focuses on the security angle.

**Why** do role checks happen before business logic?

The `authorize` function is called at the very top of every admin Route Handler, before any business logic runs:

```typescript
// src/backend/lib/authorize.ts
export function authorize(user: IUser | null, ...roles: UserRole[]): IUser {
  if (user === null) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
  }
  if (!roles.includes(user.role)) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }
  return user
}
```

This placement is a security guarantee: there is **no code path** through which a `USER`-role account can reach admin business logic. The function throws before any database writes, reads, or business decisions happen. You cannot accidentally expose admin functionality by forgetting to add a role check later in the handler — the check is always first.

**How** does this prevent privilege escalation?

```
Route Handler execution order:

withErrorHandler
  └── getAuthUser()          ← identifies who is calling
        └── authorize(user, UserRole.ADMIN)  ← throws if not ADMIN
              └── validate(schema, body)     ← only reached if ADMIN
                    └── service function     ← only reached if ADMIN
                          └── MongoDB write  ← only reached if ADMIN
```

A `USER`-role account hits `authorize` and gets a `403 FORBIDDEN` response. The service function and MongoDB write never execute.

**When** do you add `authorize`?

Any time you add an endpoint that should be restricted to a specific role. Call `authorize(user, UserRole.ADMIN)` immediately after `getAuthUser()`, before any other logic.

---

### 8.7 `withCredentials: true` Requirement

**What** is `withCredentials: true`?

It is an Axios (and XMLHttpRequest) flag that tells the browser: "include cookies, HTTP authentication headers, and TLS client certificates on this cross-origin request."

Here is the actual `axiosClient.ts` configuration:

```typescript
// src/lib/axios/axiosClient.ts
export const apiClient: AxiosInstance = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,   // ← this flag
  timeout: 10_000,
})
```

**Why** is it required?

Without `withCredentials: true`, the browser does NOT send cookies on cross-origin requests. The `accessToken` and `refreshToken` cookies would never reach the server, and every API call would return `401 UNAUTHORIZED`.

```
withCredentials behaviour:

Same-origin request (Next.js frontend → Next.js API, both localhost:3000):
  withCredentials: true  → cookies sent ✓
  withCredentials: false → cookies sent ✓  (same-origin always sends cookies)

Cross-origin request (Admin Panel localhost:5173 → Next.js API localhost:3000):
  withCredentials: true  → cookies sent ✓  (REQUIRED)
  withCredentials: false → cookies NOT sent → 401 on every request
```

**How** does the Axios interceptor use it?

The refresh interceptor also passes `withCredentials: true` explicitly when calling the refresh endpoint:

```typescript
// src/lib/axios/axiosClient.ts (refresh interceptor)
try {
  await axios.post('/api/auth/refresh', null, { withCredentials: true })
  processQueue(null)
  return apiClient(originalRequest)
} catch (err) {
  processQueue(err)
  if (typeof window !== 'undefined') {
    import('@/modules/auth/store/auth.store')
      .then(({ useAuthStore }) => useAuthStore.getState().clearAuth())
      .catch(() => {})
    window.location.href = '/login'
  }
  return Promise.reject(err)
}
```

**When** does this matter?

- For the Next.js frontend (same-origin): `withCredentials: true` is technically redundant but harmless — cookies are sent either way.
- For the Admin Panel (cross-origin): `withCredentials: true` is **mandatory**. Without it, the Admin Panel cannot authenticate at all — every request returns 401 because the `accessToken` cookie is never sent.

If you ever see a pattern like `axios.create({ baseURL: '...' })` without `withCredentials: true` in a cross-origin client, that client will not work with this cookie-based auth system.

---

### 8.8 TOKEN_REUSE Handling

**What** is `TOKEN_REUSE`?

`TOKEN_REUSE` is an error code returned by `POST /api/auth/refresh` when the server detects that a refresh token has already been used (or was never valid). When this happens, the server has already revoked ALL sessions for that user — every active `RefreshToken` document for that `userId` has been deleted from MongoDB.

**Why** must the client respond immediately?

When `TOKEN_REUSE` is detected, it means one of two things:
1. An attacker stole a refresh token and used it after the legitimate user already rotated it
2. A network glitch caused the same token to be sent twice (rare, but possible)

In either case, the server has already terminated all sessions as a precaution. The client's current session is gone — the `refreshToken` cookie it holds is no longer valid. Continuing to use the app would result in every request returning 401. More importantly, if the account is compromised, the user needs to know immediately so they can change their password.

**How** does the Axios interceptor handle `TOKEN_REUSE`?

Here is the full response interceptor from `src/lib/axios/axiosClient.ts`:

```typescript
// src/lib/axios/axiosClient.ts
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(() => apiClient(originalRequest))
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      await axios.post('/api/auth/refresh', null, { withCredentials: true })
      processQueue(null)
      return apiClient(originalRequest)
    } catch (err) {
      processQueue(err)
      if (typeof window !== 'undefined') {
        import('@/modules/auth/store/auth.store')
          .then(({ useAuthStore }) => useAuthStore.getState().clearAuth())
          .catch(() => {})
        window.location.href = '/login'
      }
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
)
```

The key path for `TOKEN_REUSE`:

```
API call returns 401
      │
      ▼
interceptor catches it
      │
      ▼
_retry not set → attempt refresh
      │
      ▼
POST /api/auth/refresh
      │
      ├── success → retry original request (normal 401 flow)
      │
      └── failure (TOKEN_REUSE or INVALID_TOKEN)
            │
            ▼
      processQueue(err)  ← reject all queued requests
            │
            ▼
      useAuthStore.getState().clearAuth()  ← wipe local auth state
            │
            ▼
      window.location.href = '/login'  ← force redirect
```

**When** does `TOKEN_REUSE` occur in practice?

- An attacker steals a refresh token (e.g., via a compromised device) and uses it after the legitimate user has already rotated it
- A bug causes the same refresh token to be sent in two concurrent requests (the second one will see `TOKEN_REUSE` because the first already rotated it)
- A user's session data is replayed from a backup or snapshot

In all cases, the correct response is the same: clear local state and redirect to login. The user must re-authenticate to get a fresh session.

```
TOKEN_REUSE response flow:

Client                          Server
  │                               │
  │  POST /api/auth/refresh        │
  │  Cookie: refreshToken=T_old    │
  │ ─────────────────────────────► │
  │                               │  hashToken(T_old) not found in DB
  │                               │  deleteMany({ userId })  ← all sessions gone
  │  401 { errorCode: TOKEN_REUSE }│
  │ ◄───────────────────────────── │
  │                               │
  │  clearAuth()                   │
  │  redirect → /login             │
```



---

## Phase 9: Real Feature Walkthroughs

This phase traces five complete features from the user's action all the way through to the database and back. Each walkthrough names every file involved, explains what each layer does, and answers WHAT, WHY, HOW, and WHEN.

---

### 9.1 Walkthrough 1 — Authentication Flow

**What** is this walkthrough?

The complete lifecycle of a user's session: from creating an account, through logging in, accessing a protected page, having a token silently refreshed, and finally logging out.

**Why** does this flow exist?

Every other feature in the app depends on authentication. Understanding this flow end-to-end means you understand how identity is established, how it is maintained across requests, and how it is cleanly terminated.

**How** does each step work?

**Step 1 — Register**

```
User fills register form
      │
      ▼
src/app/(auth)/register/page.tsx  (Server Component)
  └── renders <RegisterPage />  (from src/modules/auth/pages/)
        │
        ▼
useRegisterForm hook  (react-hook-form + Yup validation)
        │
        ▼
useRegister mutation hook  →  authApi.register(data)
        │
        ▼
POST /api/auth/register
        │
        ▼
src/app/api/auth/register/route.ts
  └── withErrorHandler wraps the handler
  └── validate(registerSchema, body)  ← Zod
  └── registerUser(data)  ← src/backend/services/auth.service.ts
        │
        ▼
MongoDB: User collection  ← bcrypt hashes password, inserts document
        │
        ▼
sendSuccess(user, 'Registered successfully', 201)  →  201 response
```

**Step 2 — Login**

```
User fills login form
      │
      ▼
src/app/(auth)/login/page.tsx  (Server Component)
  └── <LoginClient />  (next/dynamic, ssr: false)
        └── <LoginPage />  (src/modules/auth/pages/LoginPage.tsx)
              │
              ▼
        useLoginForm  (react-hook-form + Yup)
              │
              ▼
        useLogin mutation  →  authApi.login({ email, password })
              │
              ▼
        axiosClient.post('/api/auth/login')  (withCredentials: true)
              │
              ▼
POST /api/auth/login  (src/app/api/auth/login/route.ts)
  └── withErrorHandler
  └── validate(loginSchema, body)
  └── loginUser(email, password)
        │
        ▼
MongoDB: find user, bcrypt.compare password
        │
        ▼
setAuthCookies(res, accessToken, refreshToken)
  ← accessToken cookie: httpOnly, 59 min
  ← refreshToken cookie: httpOnly, 7 days
        │
        ▼
sendSuccess(user)  →  200 response
        │
        ▼
Browser: cookies set automatically
        │
        ▼
useAuthStore.setAuth(user)  ← Zustand store updated
        │
        ▼
router.replace('/landing')  ← redirect to protected area
```

**Step 3 — Protected page access**

```
User navigates to /jobs
      │
      ▼
src/proxy.ts  ← not /api/*, not /, passes through
      │
      ▼
src/app/(protected)/layout.tsx  (Client Component, 'use client')
  └── ProtectedGuard component
        │
        ├── hydrated === false?  →  render <PageLoader />
        │
        ▼
  useEffect: setHydrated(true)  ← runs after first browser render
        │
        ▼
  hydrated === true, isAuthenticated === false?
        └── router.replace('/login')
        │
        ▼
  hydrated === true, isAuthenticated === true?
        └── render children  ← /jobs page renders
```

**Step 4 — Token refresh**

```
Axios request returns 401
      │
      ▼
axiosClient response interceptor  (src/lib/axios/axiosClient.ts)
      │
      ▼
_retry not set → set _retry = true, isRefreshing = true
      │
      ▼
POST /api/auth/refresh  (src/app/api/auth/refresh/route.ts)
  └── refreshUserToken()  ← reads refreshToken cookie
  └── verifies hash in MongoDB
  └── issues new accessToken + refreshToken cookies
      │
      ▼
processQueue(null)  ← resolve all queued requests
      │
      ▼
retry original request  ← transparent to the caller
```

**Step 5 — Logout**

```
User clicks logout
      │
      ▼
authApi.logout()  →  POST /api/auth/logout
      │
      ▼
src/app/api/auth/logout/route.ts
  └── logoutUser()  ← invalidates refreshToken in MongoDB
  └── clearAuthCookies(res)  ← clears accessToken + refreshToken cookies
      │
      ▼
sendSuccess(null, 'Logged out')  →  200 response
      │
      ▼
useAuthStore.clearAuth()  ← Zustand store wiped
      │
      ▼
router.replace('/login')
```

**Full lifecycle ASCII diagram:**

```
REGISTER          LOGIN             PROTECTED PAGE    REFRESH           LOGOUT
────────          ─────             ──────────────    ───────           ──────
POST /register    POST /login       layout.tsx        POST /refresh     POST /logout
      │                 │           ProtectedGuard          │                 │
      ▼                 ▼                 │                 ▼                 ▼
registerUser()    loginUser()       hydrated?         refreshUserToken() logoutUser()
      │                 │           isAuthenticated?        │                 │
      ▼                 ▼                 │                 ▼                 ▼
MongoDB insert    setAuthCookies    render page       new cookies       clearAuthCookies
      │                 │                                                     │
      ▼                 ▼                                                     ▼
201 response      setAuth(user)                                         clearAuth()
                  redirect /landing                                     redirect /login
```

**When** do you need to understand this flow?

Any time you add a new protected page, change the auth cookie strategy, debug a "user gets logged out unexpectedly" issue, or add a new auth endpoint.

---

### 9.2 Walkthrough 2 — Jobs Feature

**What** is this walkthrough?

The complete path for loading the jobs list page: from the Next.js route file through the React component, the data-fetching hook, the API client, the Route Handler, the service, and MongoDB — and back to the rendered UI.

**Why** does this walkthrough matter?

The jobs feature is the canonical example of the read-data pattern used across the entire app (shops, marketplace, etc.). Once you understand this flow, you understand how every list page works.

**How** does each layer work?

```
User navigates to /jobs
      │
      ▼
src/app/(protected)/jobs/page.tsx
  export const dynamic = 'force-dynamic'  ← never cached at the CDN level
  export default function Page() { return <JobsPage /> }
      │
      ▼
src/modules/jobs/pages/JobsPage.tsx  (Client Component, 'use client')
  └── calls useJobs() hook
      │
      ▼
src/modules/jobs/hooks/useJobs.ts
  └── createQuery(queryKeys.jobs.all(), () => jobsApi.get())
      │  staleTime: 5 min, gcTime: 10 min (from queryClient defaults)
      │
      ▼
src/modules/jobs/api/jobs.api.ts
  └── jobsApi.get()  →  apiClient.get('/api/jobs')
      │  (axiosClient, withCredentials: true)
      │
      ▼
GET /api/jobs  (src/app/api/jobs/route.ts)
  └── withErrorHandler
  └── getAuthUser()  ← verifies accessToken cookie, returns user or null
  └── getJobs(filters)  ← src/backend/services/job.service.ts
      │
      ▼
src/backend/services/job.service.ts
  └── connectDB()
  └── Job.find(query).sort(...).lean()  ← Mongoose query
      │
      ▼
MongoDB: jobs collection
      │
      ▼
sendSuccess(jobs)  →  200 { success: true, data: [...] }
      │
      ▼
React Query caches the result for 5 minutes
      │
      ▼
JobsPage renders the job list
  └── subsequent navigations to /jobs use the cache (no network request)
  └── after 5 min staleTime, background refetch on next visit
```

**ASCII flow diagram:**

```
Browser /jobs
      │
      ▼
jobs/page.tsx  (force-dynamic, Server Component)
      │
      ▼
<JobsPage />  (Client Component)
      │
      ▼
useJobs()
  └── createQuery(queryKeys.jobs.all(), fetcher)
        │
        ├── cache hit? ──► return cached data immediately
        │
        └── cache miss / stale?
              │
              ▼
        jobsApi.get()
              │
              ▼
        GET /api/jobs  (Route Handler)
              │
              ▼
        getAuthUser() → getJobs() → MongoDB
              │
              ▼
        sendSuccess(jobs)
              │
              ▼
        React Query stores result
              │
              ▼
        JobsPage re-renders with data
```

**When** do you need to understand this flow?

When adding a new list page (shops, marketplace), debugging stale data, changing the cache duration, or adding filters to the jobs query.

---

### 9.3 Walkthrough 3 — Marketplace Listing Flow

**What** is this walkthrough?

The complete path for a user creating a new product listing: from filling the form through validation, the mutation hook, the Route Handler, authorization, service, and MongoDB insert — including the cache invalidation that refreshes the list.

**Why** does this walkthrough matter?

This is the canonical example of the write-data (mutation) pattern. It shows how form validation, role authorization, and cache invalidation all work together.

**How** does each layer work?

```
User navigates to /account/list-product
      │
      ▼
src/app/(protected)/account/list-product/page.tsx
  └── renders <ListProductPage />  (from src/modules/marketplace/pages/)
      │
      ▼
ListProductView  (form UI component)
  └── useListProductForm hook
        └── react-hook-form + Yup schema validation
        └── validates: title, description, price, category, images
      │
      ▼
User submits form → useListedProducts mutation hook
  └── listedProductsApi.post('', data)
        └── apiClient.post('/api/listed-products', data)
      │
      ▼
POST /api/listed-products  (src/app/api/listed-products/route.ts)
  └── withErrorHandler
  └── getAuthUser()  ← must be authenticated
  └── authorize(user, UserRole.USER)  ← must have USER role
  └── validate(createListedProductSchema, body)  ← Zod server-side validation
  └── createListedProduct(data, userId)  ← src/backend/services/listedProduct.service.ts
      │
      ▼
src/backend/services/listedProduct.service.ts
  └── connectDB()
  └── ListedProduct.create({ ...data, seller: userId })
      │
      ▼
MongoDB: listedProducts collection  ← document inserted
      │
      ▼
sendSuccess(product, 'Listed', 201)  →  201 response
      │
      ▼
onSuccess callback in useListedProducts:
  └── toast.success('Product listed!')
  └── queryClient.invalidateQueries(queryKeys.listedProducts.all())
        └── React Query marks the listedProducts cache as stale
        └── next render of the listings page triggers a background refetch
        └── list refreshes automatically
```

**ASCII flow diagram:**

```
ListProductView (form)
      │  submit
      ▼
useListProductForm  (react-hook-form + Yup)
      │  valid?
      ▼
useListedProducts mutation
      │
      ▼
listedProductsApi.post('/api/listed-products', data)
      │
      ▼
POST /api/listed-products  (Route Handler)
  ├── getAuthUser()  ──► 401 if not logged in
  ├── authorize(USER) ──► 403 if wrong role
  ├── validate(schema) ──► 400 if invalid body
  └── createListedProduct(data, userId)
        │
        ▼
      MongoDB insert
        │
        ▼
      201 response
      │
      ▼
onSuccess:
  toast.success()
  invalidateQueries(listedProducts.all)
      │
      ▼
Listings page refetches  ──► updated list rendered
```

**When** do you need to understand this flow?

When adding a new create/update form, debugging a 403 authorization error, changing validation rules, or understanding why the list doesn't refresh after a mutation.

---

### 9.4 Walkthrough 4 — Password Reset Flow

**What** is this walkthrough?

The complete path for resetting a forgotten password: from submitting the forgot-password form, through email delivery, clicking the reset link, reading the token from the URL, and submitting the new password.

**Why** does this walkthrough matter?

The password reset flow involves several Next.js-specific patterns: a `Suspense` boundary to safely use `useSearchParams()`, a dynamic route segment `[token]` in the Route Handler, and SHA-256 token hashing for security. Understanding this flow teaches all three patterns at once.

**How** does each step work?

**Step 1 — Forgot password form**

```
User navigates to /forgot-password
      │
      ▼
src/app/(auth)/forgot-password/page.tsx  (Server Component, force-static)
  └── renders <ForgotPasswordPage />  (src/modules/auth/pages/)
      │
      ▼
User submits email  →  forgotPasswordApi.post({ email })
      │
      ▼
POST /api/auth/forgot-password  (src/app/api/auth/forgot-password/route.ts)
  └── withErrorHandler
  └── validate(forgotPasswordSchema, body)
  └── forgotPassword(email)  ← src/backend/services/auth.service.ts
        │
        ▼
  generates crypto.randomBytes(32) plain token
  stores SHA-256 hash in user.resetPasswordToken
  stores expiry (now + 15 min) in user.resetPasswordExpire
  saves user to MongoDB
        │
        ▼
  Nodemailer sends email:
    Link: {FRONTEND_URL}/reset-password?token=<plainToken>
        │
        ▼
sendSuccess(null, 'Reset email sent')  →  200 response
```

**Step 2 — User clicks email link**

```
User clicks link in email:
  /reset-password?token=abc123plaintoken
      │
      ▼
src/app/(auth)/reset-password/page.tsx  (Server Component, force-static)
  └── wraps <ResetPasswordInner /> in <Suspense fallback={null}>
        │
        WHY Suspense?
        useSearchParams() requires a Suspense boundary in Next.js App Router.
        Without it, the build fails with a static generation error.
```

**Step 3 — ResetPasswordInner reads the token**

```
src/app/(auth)/reset-password/ResetPasswordInner.tsx  ('use client')
  └── const params = useSearchParams()
  └── const token = params.get('token') ?? ''
  └── renders <ResetPasswordPage token={token} />
        │
        ▼
src/modules/auth/pages/ResetPasswordPage.tsx
  └── useResetPasswordForm hook  (react-hook-form + Yup)
  └── useResetPassword mutation  →  authApi.resetPassword(token, { password })
```

**Step 4 — Submit new password**

```
User submits new password
      │
      ▼
POST /api/auth/reset-password/[token]
  (src/app/api/auth/reset-password/[token]/route.ts)
  └── withErrorHandler
  └── const { token } = await params  ← dynamic segment
  └── validate(resetPasswordSchema, body)
  └── resetPassword(token, newPassword)  ← src/backend/services/auth.service.ts
        │
        ▼
  SHA-256 hash the plain token
  find user where resetPasswordToken === hash
    AND resetPasswordExpire > now
        │
        ├── not found / expired → throw AppError(400, INVALID_OR_EXPIRED_TOKEN)
        │
        └── found:
              bcrypt.hash(newPassword)
              user.password = hashedPassword
              user.resetPasswordToken = undefined
              user.resetPasswordExpire = undefined
              user.save()
        │
        ▼
sendSuccess(null, 'Password reset successful')  →  200 response
```

**ASCII flow diagram:**

```
ForgotPasswordPage
      │  POST /api/auth/forgot-password
      ▼
forgotPassword(email)
  ├── generate plain token
  ├── store SHA-256 hash in DB
  └── send email with plain token
      │
      ▼
User inbox  ──► clicks link  ──► /reset-password?token=abc123
      │
      ▼
reset-password/page.tsx
  └── <Suspense>
        └── <ResetPasswordInner />  ('use client')
              └── useSearchParams() → token
              └── <ResetPasswordPage token={token} />
                    │  POST /api/auth/reset-password/[token]
                    ▼
              resetPassword(token, newPassword)
                ├── hash token → find in DB
                ├── check expiry
                ├── bcrypt new password
                └── clear token fields
                    │
                    ▼
              200 success
```

**When** do you need to understand this flow?

When debugging "invalid or expired token" errors, changing the token expiry window, or understanding why `ResetPasswordInner` is a separate `'use client'` file instead of being inline in `page.tsx`.

---

### 9.5 Walkthrough 5 — `src/proxy.ts` Request Lifecycle

**What** is this walkthrough?

The path every incoming HTTP request takes through `src/proxy.ts` before it reaches any page or Route Handler — including CORS handling, preflight responses, and the root redirect.

**Why** does this walkthrough matter?

`src/proxy.ts` is the first code that runs for every request. Misunderstanding it leads to mysterious CORS errors, broken redirects, or security gaps. Understanding it means you know exactly where to add global request logic.

**How** does each branch work?

Here is the complete `proxy` function from `src/proxy.ts`:

```typescript
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const origin = req.headers.get('origin') ?? ''

  // Branch 1: API routes — CORS handling
  if (pathname.startsWith('/api/')) {
    const isAllowed = ALLOWED_ORIGINS.includes(origin)

    // Branch 1a: Preflight (OPTIONS)
    if (req.method === 'OPTIONS') {
      const res = new NextResponse(null, { status: 204 })
      if (isAllowed) setCorsHeaders(res, origin)
      return res  // ← short-circuit, never reaches Route Handler
    }

    // Branch 1b: Normal API request
    const res = NextResponse.next()
    if (isAllowed) setCorsHeaders(res, origin)
    return res
  }

  // Branch 2: Root redirect
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/landing', req.url))
  }

  // Branch 3: Everything else — pass through
  return NextResponse.next()
}
```

The `matcher` config controls which requests enter `proxy()` at all:

```typescript
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
```

Static assets (`_next/static`, `_next/image`, `favicon.ico`, `public/`) bypass the proxy entirely — they are served directly by Next.js without running any middleware code.

**Why is the file named `proxy.ts` instead of `middleware.ts`?**

Next.js looks for a file named exactly `middleware.ts` (or `middleware.js`) at the `src/` root to run as middleware. This project exports the function as `proxy` and names the file `proxy.ts` — but Next.js still picks it up because the `config.matcher` export is present and the file is at the correct location (`src/proxy.ts`). The name `proxy` better describes what the file actually does: it acts as a reverse proxy layer that intercepts requests, applies CORS headers, and redirects the root path. It is a naming convention choice for clarity, not a functional difference.

**ASCII flow diagram:**

```
Incoming request
      │
      ▼
Does path match matcher?
  (excludes _next/static, _next/image, favicon.ico, public/)
      │
      ├── NO  ──► Next.js serves static asset directly (proxy never runs)
      │
      └── YES
            │
            ▼
      proxy(req) runs
            │
            ├── pathname starts with /api/ ?
            │     │
            │     ├── method === OPTIONS (preflight)?
            │     │     └── return 204 + CORS headers  ──► done
            │     │
            │     └── other method
            │           └── NextResponse.next() + CORS headers if origin allowed
            │
            ├── pathname === '/' ?
            │     └── redirect to /landing  ──► done
            │
            └── everything else
                  └── NextResponse.next()  ──► Next.js routing continues
                        │
                        ▼
                  page.tsx or route.ts handles the request
```

**When** do you need to modify `proxy.ts`?

- Adding a new allowed origin (e.g., a new Admin Panel deployment URL) → add to `ALLOWED_ORIGINS`
- Changing the root redirect destination → update the `NextResponse.redirect` call
- Adding global request headers or auth checks that apply to all routes → add logic before the `return NextResponse.next()` calls
- Debugging CORS errors from the Admin Panel → check that the origin is in `ALLOWED_ORIGINS` and that `withCredentials: true` is set on the Admin Panel's requests


---

## Phase 10: React Developer → Next.js Transition Guide

If you've built React SPAs before, you already know components, hooks, props, and state. This phase maps what you already know to the Next.js equivalents used in this project — so you can stop translating and start building.

---

### 10.1 React SPA vs Next.js App Router — Comparison Table

**What** is this comparison?

A direct mapping from the React SPA mental model to the Next.js App Router equivalents used in this project.

**Why** does this matter?

When you come from React SPAs, you carry assumptions: "routing is a library I install," "data fetching goes in `useEffect`," "auth tokens live in `localStorage`." In Next.js, all of those assumptions are wrong — and the replacements are built in. This table shows you the one-to-one swap.

**How** do the concepts map?

| React SPA | Next.js App Router | Notes |
|---|---|---|
| `index.html` | `src/app/layout.tsx` | Root HTML shell — fonts, providers, `<html>` and `<body>` tags |
| `react-router` routes | File-system routing | Folder structure IS the route config — no `<Routes>` needed |
| `<Route path="/jobs">` | `src/app/(protected)/jobs/page.tsx` | The file IS the route — drop a `page.tsx` and the route exists |
| `useEffect` data fetching | React Query + Route Handlers | Cached, deduplicated, background-refetched automatically |
| `localStorage` auth tokens | httpOnly cookies | XSS-safe — JavaScript cannot read httpOnly cookies |
| `BrowserRouter` | App Router | Built into Next.js — no install, no `<BrowserRouter>` wrapper |
| `react-helmet` | Metadata API | Built into Next.js — export `metadata` from any `page.tsx` |
| `axios.create({ baseURL: 'https://api.example.com' })` | `axios.create({ baseURL: '/' })` | API is same-origin — Route Handlers live at `/api/*` |
| Manual loading states | `loading.tsx` + React Query | `loading.tsx` handles route-level loading; React Query handles data loading |
| Manual error boundaries | `error.tsx` | Drop an `error.tsx` file and Next.js wires it up automatically |

**When** do you use this table?

Every time you reach for a React SPA pattern out of habit. Before writing `useEffect` for data fetching, check the "React Query + Route Handlers" row. Before installing `react-router`, remember routing is already handled by the file system.

```
React SPA mental model          Next.js App Router reality
─────────────────────────────   ──────────────────────────────────────
index.html                  ──► src/app/layout.tsx
react-router + <Routes>     ──► src/app/ folder structure
<Route path="/jobs">        ──► src/app/(protected)/jobs/page.tsx
useEffect + fetch           ──► React Query hooks + Route Handlers
localStorage tokens         ──► httpOnly cookies (server-set)
BrowserRouter wrapper       ──► built-in App Router
react-helmet                ──► export metadata from page.tsx
external API baseURL        ──► baseURL: '/' (same-origin BFF)
manual loading spinner      ──► loading.tsx + isLoading from React Query
manual error boundary       ──► error.tsx
```

---

### 10.2 The Server/Client Mental Model Shift

**What** is the mental model shift?

In a React SPA, ALL code runs in the browser. There is no server-side code — your `index.html` is served as a static file and React takes over entirely in the browser.

In Next.js, code runs in two places:
- **Server Components** run on the server. They can access the database, read environment variables, and import server-only packages. They produce HTML. They cannot use hooks or browser APIs.
- **Client Components** run in the browser (and also during SSR for the initial render). They can use hooks, browser APIs, and event handlers. They cannot directly access the database.

**Why** does this split exist?

Performance and security. Server Components produce HTML that the browser can display immediately — no JavaScript bundle needed for the initial render. Sensitive logic (database queries, secret keys) stays on the server and never reaches the browser.

**How** does the boundary work in this project?

The `'use client'` directive is the boundary marker. Any file that starts with `'use client'` is a Client Component. Everything else is a Server Component by default.

The actual boundary in this project:

```
src/app/layout.tsx  (Server Component — no 'use client')
  │
  │  renders
  ▼
<Providers>  (Client Component — 'use client')
  │  wraps React Query QueryClientProvider + Zustand
  │
  │  renders
  ▼
page children  (Server or Client, depending on the page)
```

Here is the actual `src/app/layout.tsx`:

```typescript
// src/app/layout.tsx — Server Component (no 'use client')
import Providers from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

`<Providers>` is a Client Component because it sets up React Query and Zustand — both of which need browser context. But `layout.tsx` itself stays a Server Component because it only renders HTML structure and imports.

**ASCII diagram — server/client boundary:**

```
┌─────────────────────────────────────────────────────────────┐
│                        SERVER                                │
│                                                              │
│   src/app/layout.tsx          (Server Component)            │
│   src/app/(auth)/login/page.tsx  (Server Component)         │
│   src/app/api/*/route.ts      (Route Handlers — server only)│
│   src/backend/**              (services, models — server only│
│                                                              │
│   ✓ Can access: DB, env vars, secrets, file system          │
│   ✗ Cannot use: useState, useEffect, browser APIs           │
│                                                              │
│              │  'use client' boundary                        │
│              ▼                                               │
├─────────────────────────────────────────────────────────────┤
│                        CLIENT (BROWSER)                      │
│                                                              │
│   src/app/providers.tsx       ('use client')                 │
│   src/app/(protected)/layout.tsx  ('use client')            │
│   src/app/(auth)/login/LoginClient.tsx  ('use client')       │
│   src/modules/*/pages/**      (most page components)        │
│                                                              │
│   ✓ Can use: useState, useEffect, hooks, browser APIs       │
│   ✗ Cannot directly access: DB, env vars, secrets           │
└─────────────────────────────────────────────────────────────┘
```

**When** do you need to think about this boundary?

Every time you create a new component. Ask: does this component need hooks or browser APIs? If yes, add `'use client'`. If no, leave it as a Server Component and enjoy the performance benefits.

---

### 10.3 Why `useEffect` for Data Fetching is Replaced

**What** is the replacement?

In this project, data fetching is done with React Query hooks (e.g., `useJobs()`, `useShops()`) instead of `useEffect` + `fetch` or `useEffect` + `axios`.

**Why** is `useEffect` data fetching replaced?

`useEffect` data fetching has four well-known problems:

1. **No caching** — every component mount triggers a new network request, even if the data was fetched 2 seconds ago.
2. **No deduplication** — if two components on the same page both call `fetch('/api/jobs')`, you get two identical network requests.
3. **Manual loading/error state** — you write `const [loading, setLoading] = useState(true)` and `const [error, setError] = useState(null)` in every component that fetches data.
4. **Race conditions** — if the user navigates away and back quickly, a slow response from the first navigation can overwrite the data from the second navigation.

React Query solves all four problems automatically.

**How** does the before/after look?

```typescript
// React SPA (useEffect approach) — what you might write coming from SPAs
const [jobs, setJobs] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  fetch('/api/jobs')
    .then(r => r.json())
    .then(data => {
      setJobs(data)
      setLoading(false)
    })
    .catch(err => {
      setError(err)
      setLoading(false)
    })
}, [])

// This project (React Query approach) — what you actually write
const { data: jobs, isLoading } = useJobs()
```

The `useJobs` hook is defined in `src/modules/jobs/hooks/useJobs.ts` and uses the `createQuery` factory from `src/lib/react-query/createQuery.ts`. Under the hood, React Query:
- Caches the result for `staleTime: 5 minutes` (configured in `src/lib/react-query/queryClient.ts`)
- Deduplicates concurrent requests to the same query key
- Manages `isLoading`, `isError`, and `data` states automatically
- Refetches in the background when the cache expires

**When** should you still use `useEffect` for data fetching?

Almost never in this project. The only legitimate use of `useEffect` for data-related work is for side effects that are not data fetching — for example, the `hydrated` flag pattern in `ProtectedGuard` (covered in section 10.4). For any actual API call, use a React Query hook.

```
useEffect data fetching problems:
  ┌──────────────────────────────────────────────────────┐
  │  Component A mounts → fetch('/api/jobs') → request 1 │
  │  Component B mounts → fetch('/api/jobs') → request 2 │
  │  (same data, two requests — no deduplication)        │
  │                                                      │
  │  User navigates away → component unmounts            │
  │  Response arrives → setState on unmounted component  │
  │  → React warning or stale data                       │
  └──────────────────────────────────────────────────────┘

React Query solution:
  ┌──────────────────────────────────────────────────────┐
  │  Component A mounts → useJobs() → request 1          │
  │  Component B mounts → useJobs() → no new request     │
  │  (same query key → deduplicated, served from cache)  │
  │                                                      │
  │  Cache expires after staleTime (5 min)               │
  │  → background refetch, no loading flash              │
  └──────────────────────────────────────────────────────┘
```

---

### 10.4 Hydration — What It Is and Why It Matters

**What** is hydration?

Hydration is the process where React takes server-rendered HTML and "attaches" event handlers, state, and interactivity to it in the browser. The server sends HTML that looks correct, and then React runs in the browser and makes it interactive.

A **hydration mismatch** occurs when the HTML the server rendered differs from what React renders in the browser on the first pass. React throws an error and falls back to a full client-side render, which can cause a flash of incorrect content.

**Why** does the `hydrated` flag exist in `ProtectedGuard`?

Zustand's `persist` middleware stores auth state in `localStorage`. `localStorage` does not exist on the server. This creates a timing problem:

1. Server renders `ProtectedGuard` — `isAuthenticated` is `false` (no `localStorage` on server)
2. Browser receives HTML — `isAuthenticated` is still `false` (Zustand hasn't rehydrated yet)
3. Zustand reads `localStorage` and sets `isAuthenticated` to `true`
4. React re-renders — `isAuthenticated` is now `true`

Without the `hydrated` flag, step 2 would trigger `router.replace('/login')` — redirecting the user to the login page on every page load, even when they are authenticated. The `hydrated` flag prevents any auth check until after Zustand has had a chance to rehydrate from `localStorage`.

**How** does the `hydrated` flag work?

Here is the actual code from `src/app/(protected)/layout.tsx`:

```typescript
function ProtectedGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const router = useRouter()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace('/login')
  }, [hydrated, isAuthenticated, router])

  if (!hydrated) return <PageLoader />
  if (!isAuthenticated) return null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f0f2f8', fontFamily: "'Inter',sans-serif" }}>
      <AppHeader />
      <main style={{ flex: 1 }}>{children}</main>
      <AppFooter />
    </div>
  )
}
```

The `useEffect(() => { setHydrated(true) }, [])` runs only in the browser, after the first render. Until it runs, `hydrated` is `false` and the component renders `<PageLoader />` — a neutral loading state that matches on both server and client, preventing any hydration mismatch.

**ASCII timeline — server render → hydration → Zustand rehydration:**

```
Timeline:
─────────────────────────────────────────────────────────────────────────►

[Server]
  │
  ├── Renders ProtectedGuard
  │     hydrated = false (useState initial value)
  │     isAuthenticated = false (no localStorage on server)
  │     → returns <PageLoader />
  │
  └── Sends HTML: <PageLoader /> markup

[Browser receives HTML]
  │
  ├── React hydrates — matches <PageLoader /> ✓ (no mismatch)
  │
  ├── useEffect fires: setHydrated(true)
  │     → hydrated = true
  │
  ├── Zustand persist middleware reads localStorage
  │     → isAuthenticated = true (if user was logged in)
  │
  └── Re-render:
        hydrated = true, isAuthenticated = true
        → renders full layout (AppHeader + children + AppFooter)

Without hydrated flag (broken):
  │
  ├── Server: isAuthenticated = false → would render redirect logic
  ├── Browser first render: isAuthenticated = false → router.replace('/login')
  └── User gets redirected to /login even though they are authenticated ✗
```

**When** do you need the `hydrated` pattern?

Any time a Client Component reads from `localStorage` (directly or via Zustand `persist`) and makes a decision based on that value on the first render. If the decision could differ between server and browser, you need the `hydrated` flag.

---

### 10.5 `router.push` vs `router.replace`

**What** is the difference?

Both `router.push` and `router.replace` navigate to a new URL. The difference is what they do to the browser's history stack:

- `router.push('/landing')` — **adds** a new entry to the history stack. The user can press the browser's back button to return to the previous page.
- `router.replace('/login')` — **replaces** the current history entry. The user cannot press back to return to the page they were on.

**Why** does `ProtectedGuard` use `router.replace` for the auth redirect?

When an unauthenticated user tries to access `/jobs`, `ProtectedGuard` redirects them to `/login`. Using `router.replace` means `/jobs` is removed from the history stack. If the user logs in and then presses back, they go to whatever was before `/jobs` — not back to `/jobs` itself (which would trigger another redirect loop).

Using `router.push` here would create a confusing experience: the user logs in, presses back, lands on `/jobs` again, gets redirected to `/login` again — an infinite loop.

**How** is it used in this project?

Here is the actual redirect logic from `src/app/(protected)/layout.tsx`:

```typescript
// src/app/(protected)/layout.tsx
useEffect(() => {
  if (hydrated && !isAuthenticated) router.replace('/login')
  //                                ^^^^^^^^^^^^^^^^^^^^^^^^
  //                                replace — user cannot go "back" to the
  //                                protected page they weren't authorized to see
}, [hydrated, isAuthenticated, router])
```

And after a successful login (in `src/modules/auth/hooks/useLogin.ts`):

```typescript
// After successful login — push so user can go back to login page if needed
router.push('/landing')
// push — adds /landing to history, user can press back to return to /login
```

**ASCII diagram — history stack comparison:**

```
router.replace('/login'):
  Before:  [/home] [/jobs]          ← user was on /jobs
  After:   [/home] [/login]         ← /jobs replaced by /login
  Back:    goes to /home            ← /jobs is gone from history

router.push('/landing'):
  Before:  [/home] [/login]         ← user was on /login
  After:   [/home] [/login] [/landing]  ← /landing added
  Back:    goes to /login           ← user can return to login page
```

**When** do you use each?

- `router.replace` — when the current page should not be in the history (auth redirects, post-form-submission redirects where going back would re-submit)
- `router.push` — when the user should be able to press back to return (normal navigation, post-login redirect)

---

### 10.6 `Suspense` Boundaries and `loading.tsx`

**What** are Suspense boundaries and `loading.tsx`?

`Suspense` is a React feature that lets you show a fallback UI while a component is loading (waiting for data, lazy imports, etc.). `loading.tsx` is Next.js's file-system equivalent — drop a `loading.tsx` file in a folder and Next.js automatically wraps the page in a `<Suspense>` boundary using that file as the fallback.

**Why** does `ProtectedLayout` use an explicit `Suspense` wrapper?

`ProtectedGuard` uses `useRouter()` from `next/navigation`. In some Next.js versions, `useRouter` requires a `Suspense` boundary to be present in the component tree above it — otherwise Next.js throws a warning or error during SSR. The explicit `<Suspense fallback={<PageLoader />}>` wrapper satisfies this requirement.

**How** is it implemented?

Here is the actual `ProtectedLayout` from `src/app/(protected)/layout.tsx`:

```typescript
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProtectedGuard>{children}</ProtectedGuard>
    </Suspense>
  )
}
```

The difference between `loading.tsx` and `<Suspense>` in components:

| | `loading.tsx` | `<Suspense>` in component |
|---|---|---|
| Scope | Page-level (entire route) | Component-level (part of a page) |
| Trigger | Route transition (navigating to a new page) | Component suspending (lazy import, async data) |
| Configuration | Drop a file — no code needed | Explicit JSX wrapper |
| Fallback | The entire `loading.tsx` file content | The `fallback` prop |
| Example in this project | `src/app/(protected)/jobs/loading.tsx` | `ProtectedLayout` wrapping `ProtectedGuard` |

**ASCII diagram — Suspense boundary layers:**

```
URL: /jobs

┌─────────────────────────────────────────────────────────────┐
│  src/app/layout.tsx  (root layout — no Suspense)            │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  src/app/(protected)/layout.tsx                       │  │
│  │                                                       │  │
│  │  <Suspense fallback={<PageLoader />}>  ◄── explicit   │  │
│  │    <ProtectedGuard>                                   │  │
│  │                                                       │  │
│  │      ┌─────────────────────────────────────────────┐  │  │
│  │      │  Next.js auto-Suspense from loading.tsx     │  │  │
│  │      │  (src/app/(protected)/jobs/loading.tsx)     │  │  │
│  │      │                                             │  │  │
│  │      │  <jobs/page.tsx>                            │  │  │
│  │      └─────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │    </ProtectedGuard>                                  │  │
│  │  </Suspense>                                          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Loading sequence:
  1. User navigates to /jobs
  2. ProtectedGuard's Suspense shows <PageLoader /> while ProtectedGuard mounts
  3. ProtectedGuard hydrates → checks auth → renders layout
  4. jobs/loading.tsx Suspense shows loading skeleton while jobs/page.tsx loads
  5. jobs/page.tsx renders with data
```

**When** do you use `loading.tsx` vs explicit `<Suspense>`?

- `loading.tsx` — for page-level loading states during route transitions. Drop the file and you're done.
- Explicit `<Suspense>` — for component-level loading within a page (lazy-loaded components, components that suspend on data), or when you need a Suspense boundary for a specific technical reason (like `useRouter` in `ProtectedGuard`).

---

## Phase 11: Learning Roadmap

You have read through 10 phases of architecture, patterns, and walkthroughs. This final phase is a mentorship-style guide: where to go next, what to read first, what mistakes to avoid, and how to add a new feature from scratch.

---

### 11.1 4-Stage Learning Roadmap

**What** is this roadmap?

A structured 4-stage progression that takes you from "I can run the project" to "I can extend the backend independently." Each stage builds on the previous one and has a concrete time estimate.

**Why** follow a staged approach?

Jumping straight to adding new features before understanding the existing ones leads to copy-paste errors, broken cache invalidation, and security holes. The stages are ordered so that each one gives you the mental model you need for the next.

**How** does each stage work?

```
┌─────────────────────────────────────────────────────────────────────┐
│                    4-STAGE LEARNING ROADMAP                          │
│                                                                      │
│  Stage 1          Stage 2          Stage 3          Stage 4          │
│  Week 1           Week 2           Week 3–4         Week 5+          │
│                                                                      │
│  Understand  ──►  Small       ──►  New Module  ──►  Backend          │
│  & Run            Changes          (full stack)     Extension        │
│                                                                      │
│  Clone repo       Add a field      Create           Read auth        │
│  Read layouts     Change cache     notifications    service fully    │
│  Navigate app     Add toast        module           Add new model    │
│  Read backend     Modify links     Wire up UI       Write service    │
└─────────────────────────────────────────────────────────────────────┘
```

**Stage 1 — Understand and Run the Project (Week 1)**

Goal: get the app running and read the most important files before writing a single line of code.

1. Clone the repo, copy `.env.example` to `.env`, fill in `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `EMAIL_*` values.
2. Run `npm install` then `npm run dev`. Confirm the app loads at `http://localhost:3000`.
3. Navigate the app as a user: register an account, log in, browse the jobs list, open a job detail, browse the marketplace, list a product.
4. Read `src/proxy.ts` — understand what runs on every request (CORS guard, root redirect).
5. Read `src/app/layout.tsx` — understand the root layout: fonts, providers, metadata.
6. Read `src/app/(protected)/layout.tsx` — understand the auth guard: how `ProtectedGuard` checks `isAuthenticated`, the `hydrated` flag, and the `router.replace` redirect.
7. Read `src/backend/lib/` — skim all files: `withErrorHandler.ts`, `authGuard.ts`, `validate.ts`, `response.ts`, `db.ts`, `cookies.ts`. These are the building blocks of every Route Handler.

**Stage 2 — Make Small Changes to Existing Features (Week 2)**

Goal: build confidence by modifying existing code without breaking anything.

1. Add a `location` field to the job filter form in `src/modules/jobs/`. Add the field to the Yup schema in `validation.ts`, add the input in the filter component, and pass it to the API call. Observe how the query key changes and how React Query re-fetches.
2. Change the `staleTime` in `src/lib/react-query/queryClient.ts` from 5 minutes to 10 seconds. Navigate between pages and watch the network tab — you will see React Query re-fetching data more aggressively. Change it back.
3. Add a new toast message to an existing mutation hook (e.g., add a "Copied to clipboard" toast in a hook that currently only shows success/error). Use `toast.success()` from `react-hot-toast`.
4. Modify `SIDEBAR_LINKS` in `src/utils/globalStaticData.ts` — add a new entry, change an icon, reorder items. Observe how the sidebar updates everywhere without touching any component.

**Stage 3 — Add a New Module Following Existing Patterns (Week 3–4)**

Goal: build a complete feature end-to-end by following the existing module pattern.

Use the notifications feature as your practice target:

1. Create `src/modules/notifications/` with the standard structure: `api/`, `components/`, `hooks/`, `pages/`, `types.ts`, `validation.ts`.
2. Add a Route Handler at `src/app/api/notifications/route.ts` — export `GET` and `POST` functions, wrap both in `withErrorHandler`.
3. Add a service at `src/backend/services/notification.service.ts` — start every function with `await connectDB()`, use `AppError` for business logic errors.
4. Add a Mongoose model at `src/backend/models/notification.model.ts` — define the schema, add timestamps, export the model with the `models.Notification || model(...)` pattern to avoid re-registration.
5. Add query keys to `src/lib/react-query/queryKeys.ts` — add a `notifications` key group following the existing pattern.
6. Create `src/modules/notifications/api/notifications.api.ts` using `createApi('/api/notifications')`.
7. Wire up the UI: create a `useNotifications` query hook using `createQuery`, create a `useCreateNotification` mutation hook using `useMutation`, build a simple `NotificationsPage` component.

**Stage 4 — Understand and Extend the Backend (Week 5+)**

Goal: read the most complex backend code and make meaningful changes to it.

1. Read `src/backend/services/auth.service.ts` in full — this is the most complex service in the project. Understand every function: `registerUser`, `loginUser`, `refreshAccessToken`, `logoutUser`, `forgotPassword`, `resetPassword`.
2. Understand the refresh token rotation logic: when `refreshAccessToken` is called, it verifies the incoming token hash, deletes the old `RefreshToken` document, creates a new one, and sets new cookies. If the incoming token hash is not found, it means token reuse — all sessions for that user are revoked.
3. Add a new field to an existing Mongoose model (e.g., add `bio?: string` to the `User` model). Update the TypeScript interface, the Mongoose schema, and the Zod validator. Run the app and confirm the field is accepted by the API.
4. Write a new service function with proper `connectDB()` + error handling. For example, add `getUserStats()` to `auth.service.ts` that returns the count of users registered in the last 30 days. Add a Route Handler at `/api/users/stats` that calls it.

**When** should you move to the next stage?

Move to the next stage when you can complete all the tasks in the current stage without looking at the spec. If you get stuck, re-read the relevant phase in this document before asking for help.

---

### 11.2 Recommended File Reading Order

**What** is this list?

A numbered reading order for the most important files in the project, ranked by how much understanding each one unlocks.

**Why** does reading order matter?

Some files are prerequisites for understanding others. Reading `axiosClient.ts` before understanding `proxy.ts` means you won't know why `withCredentials: true` is set. This order is designed so each file builds on the previous one.

**How** to use this list?

Read each file in order. For each file, ask: what does this do, why does it exist, and how does it connect to the files I've already read?

**When** to use this list?

Use it during Stage 1 of the learning roadmap. After Stage 1, use it as a reference when you need to re-read a specific file.

```
Recommended Reading Order:

  1. src/proxy.ts
  2. src/app/layout.tsx
  3. src/app/(protected)/layout.tsx
  4. src/backend/lib/withErrorHandler.ts
  5. src/backend/lib/authGuard.ts
  6. src/app/api/auth/login/route.ts
  7. src/backend/services/auth.service.ts
  8. src/modules/auth/hooks/useLogin.ts
  9. src/modules/auth/hooks/useLoginForm.ts
 10. src/lib/axios/axiosClient.ts
 11. src/lib/react-query/queryKeys.ts
 12. src/utils/globalStaticData.ts
```

1. **`src/proxy.ts`** — The entry point for every request. Understand CORS, the `ALLOWED_ORIGINS` whitelist, and the root redirect before anything else. Every request passes through this file.

2. **`src/app/layout.tsx`** — The root layout. Understand how fonts are loaded, how `<Providers>` wraps the entire app, and how the `Metadata` API sets the document title template.

3. **`src/app/(protected)/layout.tsx`** — The auth guard. Understand how `ProtectedGuard` uses the `hydrated` flag to avoid hydration mismatches, how `isAuthenticated` is read from Zustand, and why `router.replace` is used instead of `router.push`.

4. **`src/backend/lib/withErrorHandler.ts`** — The error boundary for every Route Handler. Understand how it catches `AppError` vs unknown errors and returns structured JSON responses. Every Route Handler in the project is wrapped in this.

5. **`src/backend/lib/authGuard.ts`** — The server-side auth check. Understand how `getAuthUser()` uses React `cache()` to deduplicate DB lookups per request, and why it returns `null` instead of throwing.

6. **`src/app/api/auth/login/route.ts`** — A complete Route Handler example. Understand the full request lifecycle: `withErrorHandler` → `validate` → service → `setAuthCookies` → `sendSuccess`. This is the template for every other Route Handler.

7. **`src/backend/services/auth.service.ts`** — A complete service example. Understand `connectDB()`, Mongoose queries, `AppError`, token generation, and cookie setting. This is the most complex service — reading it unlocks understanding of all other services.

8. **`src/modules/auth/hooks/useLogin.ts`** — A complete mutation hook example. Understand how `useMutation` calls the API, handles success (Zustand update + redirect), and handles errors (toast notification).

9. **`src/modules/auth/hooks/useLoginForm.ts`** — A complete form hook example. Understand how `react-hook-form` + `yupResolver` + a custom hook encapsulate form logic. This is the template for every other form hook.

10. **`src/lib/axios/axiosClient.ts`** — The Axios client and interceptors. Understand why `withCredentials: true` is set globally, how the response interceptor catches 401 errors, and how it triggers a token refresh before retrying the original request.

11. **`src/lib/react-query/queryKeys.ts`** — The query key registry. Understand why all query keys are centralized here and how the factory functions (`byId`, `byFilter`) generate consistent cache keys.

12. **`src/utils/globalStaticData.ts`** — The static data pattern. Understand how `SIDEBAR_LINKS`, `JOB_TYPE_LABEL`, and `CATEGORY_BG` centralize magic values and enable tree-shaking.

---

### 11.3 Common Mistakes to Avoid

**What** are these mistakes?

Seven specific errors that are easy to make in this codebase and hard to debug because they fail silently or produce misleading error messages.

**Why** document them?

Each of these mistakes has been encountered in real development. They are not obvious from reading the code once — they require understanding the interaction between layers.

**How** to avoid them?

Read each mistake, understand why it happens, and add the corresponding check to your code review checklist.

**When** are you most likely to make these mistakes?

During Stage 2 and Stage 3 of the learning roadmap — when you are making your first changes and adding your first new features.

```
Common Mistakes — Quick Reference:

  ✗  Missing withCredentials: true  →  silent 401 on every request
  ✗  No withErrorHandler wrapper    →  unhandled exceptions, no useful body
  ✗  Inline query key arrays        →  silent cache invalidation failures
  ✗  Logic in page.tsx              →  untestable, non-reusable code
  ✗  router.push for auth redirect  →  back-button loops
  ✗  Import src/backend/ in client  →  server code leaks to browser bundle
  ✗  connectDB() once at module     →  cold-start failures in serverless
```

**Mistake 1 — Forgetting `withCredentials: true` on Axios calls**

Every Axios request must include `withCredentials: true`. Without it, the browser does not send the httpOnly cookies that contain the access and refresh tokens. The server receives a request with no auth cookies, returns a 401, and the error message gives no indication that cookies are missing. The `axiosClient.ts` sets this globally — but if you create a new Axios instance without using `axiosClient`, you will hit this silently.

```typescript
// ✗ Wrong — creates a new Axios instance without withCredentials
const res = await axios.get('/api/jobs')

// ✓ Correct — uses the shared axiosClient which has withCredentials: true globally
import axiosClient from '@/lib/axios/axiosClient'
const res = await axiosClient.get('/api/jobs')
```

**Mistake 2 — Not wrapping Route Handlers in `withErrorHandler`**

Every Route Handler must be wrapped in `withErrorHandler`. Without it, any unhandled exception (thrown `AppError`, Mongoose validation error, network error) returns a generic 500 response with no useful body. The browser receives `Internal Server Error` with no `errorCode`, no `message`, and no `details`. Debugging becomes guesswork.

```typescript
// ✗ Wrong — no withErrorHandler, exceptions return empty 500
export async function GET(req: NextRequest) {
  const jobs = await getJobs()
  return sendSuccess(jobs, 'Jobs fetched')
}

// ✓ Correct — withErrorHandler catches AppError and unknown errors
export const GET = withErrorHandler(async (req: NextRequest) => {
  const jobs = await getJobs()
  return sendSuccess(jobs, 'Jobs fetched')
})
```

**Mistake 3 — Creating new query keys as inline arrays instead of adding them to `queryKeys.ts`**

React Query uses query keys to identify cached data. If you write `useQuery({ queryKey: ['notifications'] })` inline in one hook and `queryClient.invalidateQueries({ queryKey: ['notifications'] })` inline in another, they will match — until someone changes the spelling in one place. Cache invalidation breaks silently: mutations succeed but the UI does not refresh. Always add new keys to `src/lib/react-query/queryKeys.ts`.

```typescript
// ✗ Wrong — inline key, easy to misspell, hard to invalidate
useQuery({ queryKey: ['notifications', userId], queryFn: ... })

// ✓ Correct — centralized key, consistent across hooks
// In queryKeys.ts:
notifications: {
  all: ['notifications'] as const,
  byUser: (userId: string) => ['notifications', userId] as const,
}
// In the hook:
useQuery({ queryKey: queryKeys.notifications.byUser(userId), queryFn: ... })
```

**Mistake 4 — Bypassing the module pattern by putting logic directly in `page.tsx` files**

It is tempting to write `useQuery` calls, form handlers, and API calls directly inside a `page.tsx` file. This works initially but makes the code impossible to test (page files are hard to unit test), impossible to reuse (the logic is locked inside one route), and hard to maintain (the file grows without bound). Always put logic in `src/modules/{feature}/hooks/` and components in `src/modules/{feature}/components/`. The `page.tsx` should only render the module's page component.

```typescript
// ✗ Wrong — logic in page.tsx
export default function Page() {
  const { data } = useQuery({ queryKey: ['jobs'], queryFn: jobsApi.getAll })
  return <div>{data?.map(j => <div key={j._id}>{j.title}</div>)}</div>
}

// ✓ Correct — page.tsx delegates to the module's page component
export default function Page() {
  return <JobsPage />
}
// All logic lives in src/modules/jobs/pages/JobsPage.tsx and hooks/
```

**Mistake 5 — Using `router.push` instead of `router.replace` for auth redirects**

When redirecting an unauthenticated user from `/jobs` to `/login`, use `router.replace`, not `router.push`. `router.push` adds `/login` to the browser history stack. When the user logs in and is redirected back to `/jobs`, pressing the back button takes them to `/login` again — which immediately redirects them to `/jobs` again. This creates an infinite back-button loop. `router.replace` replaces the current history entry instead of adding a new one, so the back button works correctly.

```typescript
// ✗ Wrong — creates back-button loop
router.push('/login')

// ✓ Correct — replaces history entry, back button works
router.replace('/login')
```

**Mistake 6 — Importing from `src/backend/` in a Client Component**

`src/backend/` contains server-only code: Mongoose models, service functions, database connections, and secret-reading utilities. If you import anything from `src/backend/` in a file marked `'use client'`, Next.js will bundle that server code into the browser JavaScript bundle. This leaks server secrets to the browser and increases bundle size. The browser cannot run Mongoose or connect to MongoDB anyway — the import will fail at runtime.

```typescript
// ✗ Wrong — imports server-only code into a Client Component
'use client'
import { getJobs } from '@/backend/services/job.service'  // ← server-only!

// ✓ Correct — Client Components call Route Handlers via Axios
'use client'
import axiosClient from '@/lib/axios/axiosClient'
const res = await axiosClient.get('/api/jobs')
```

**Mistake 7 — Calling `connectDB()` only once at module level instead of at the start of each service function**

It is tempting to call `connectDB()` once at the top of a service file to avoid repeating it. In a long-running server this would work — but Next.js Route Handlers run in a serverless-style environment where each invocation may start a cold process. If `connectDB()` is only called at module load time and the module is re-loaded in a new process, the connection is never established. Always call `connectDB()` at the start of each service function. Mongoose's connection caching (via `global._mongooseConnection`) ensures the actual TCP connection is reused — the call is cheap.

```typescript
// ✗ Wrong — connectDB() at module level, fails on cold start
await connectDB()  // ← called once when module loads

export async function getJobs() {
  return Job.find({})  // ← may fail if connection was not established
}

// ✓ Correct — connectDB() at the start of each function
export async function getJobs() {
  await connectDB()  // ← always called, Mongoose caching makes it cheap
  return Job.find({})
}
```

---

### 11.4 How to Add a New Feature — Checklist

**What** is this checklist?

A step-by-step guide for adding a complete new feature to the project, following the existing module pattern from end to end.

**Why** follow this checklist?

The project has a consistent pattern across all features (jobs, shops, marketplace, auth). Following the same pattern means your new feature will be maintainable by anyone who has read this document, and it will pass the same structural tests.

**How** to use it?

Work through the steps in order. Each step references the existing pattern you should follow. Replace `{feature}` with your feature name (e.g., `notifications`, `events`, `reviews`).

**When** to use this checklist?

During Stage 3 of the learning roadmap — when you are adding your first complete new module.

```
New Feature Checklist:

  Step  1  ── Create src/modules/{feature}/ folder structure
  Step  2  ── Create {feature}.api.ts using createApi
  Step  3  ── Add query keys to queryKeys.ts
  Step  4  ── Create query hooks using createQuery
  Step  5  ── Create mutation hooks using useMutation
  Step  6  ── Create form validation schemas (Yup)
  Step  7  ── Create form hooks using react-hook-form + yupResolver
  Step  8  ── Create Route Handler (wrap with withErrorHandler)
  Step  9  ── Create service (start with connectDB())
  Step 10  ── Create Mongoose model
  Step 11  ── Create Zod validator
  Step 12  ── Create page component
  Step 13  ── Wire up Next.js page
```

**Step 1 — Create the module folder structure**

```
src/modules/{feature}/
├── api/
│   └── {feature}.api.ts
├── components/
├── hooks/
├── pages/
│   └── {Feature}Page.tsx
├── types.ts
└── validation.ts
```

**Step 2 — Create the API module**

```typescript
// src/modules/{feature}/api/{feature}.api.ts
import { createApi } from '@/lib/axios/apiFactory'

export const {feature}Api = createApi('/api/{feature}')
// Gives you: {feature}Api.getAll(), {feature}Api.getById(id),
//            {feature}Api.create(data), {feature}Api.update(id, data),
//            {feature}Api.delete(id)
```

**Step 3 — Add query keys**

```typescript
// src/lib/react-query/queryKeys.ts — add to the existing object:
{feature}: {
  all: ['{feature}'] as const,
  byId: (id: string) => ['{feature}', id] as const,
  byFilter: (filter: object) => ['{feature}', 'filter', filter] as const,
},
```

**Step 4 — Create query hooks**

```typescript
// src/modules/{feature}/hooks/use{Feature}s.ts
import { createQuery } from '@/lib/react-query/createQuery'
import { queryKeys } from '@/lib/react-query/queryKeys'
import { {feature}Api } from '../api/{feature}.api'

export const use{Feature}s = createQuery({
  queryKey: queryKeys.{feature}.all,
  queryFn: {feature}Api.getAll,
})
```

**Step 5 — Create mutation hooks**

```typescript
// src/modules/{feature}/hooks/useCreate{Feature}.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/react-query/queryKeys'
import { {feature}Api } from '../api/{feature}.api'
import toast from 'react-hot-toast'

export function useCreate{Feature}() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: {feature}Api.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.{feature}.all })
      toast.success('{Feature} created successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Something went wrong')
    },
  })
}
```

**Step 6 — Create form validation schemas**

```typescript
// src/modules/{feature}/validation.ts
import * as yup from 'yup'

export const create{Feature}Schema = yup.object({
  title: yup.string().required('Title is required'),
  // ... add fields
})

export type Create{Feature}FormValues = yup.InferType<typeof create{Feature}Schema>
```

**Step 7 — Create form hooks**

```typescript
// src/modules/{feature}/hooks/useCreate{Feature}Form.ts
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { create{Feature}Schema, type Create{Feature}FormValues } from '../validation'
import { useCreate{Feature} } from './useCreate{Feature}'

export function useCreate{Feature}Form() {
  const { mutate, isPending } = useCreate{Feature}()
  const form = useForm<Create{Feature}FormValues>({
    resolver: yupResolver(create{Feature}Schema),
  })
  const onSubmit = form.handleSubmit((data) => mutate(data))
  return { form, onSubmit, isPending }
}
```

**Step 8 — Create the Route Handler**

```typescript
// src/app/api/{feature}/route.ts
import { NextRequest } from 'next/server'
import { withErrorHandler } from '@/backend/lib/withErrorHandler'
import { sendSuccess } from '@/backend/lib/response'
import { getAll{Feature}s, create{Feature} } from '@/backend/services/{feature}.service'
import { validate } from '@/backend/lib/validate'
import { create{Feature}Schema } from '@/backend/validators/{feature}.validator'

export const GET = withErrorHandler(async (_req: NextRequest) => {
  const items = await getAll{Feature}s()
  return sendSuccess(items, '{Feature}s fetched successfully')
})

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json()
  const data = validate(create{Feature}Schema, body)
  const item = await create{Feature}(data)
  return sendSuccess(item, '{Feature} created successfully', 201)
})
```

**Step 9 — Create the service**

```typescript
// src/backend/services/{feature}.service.ts
import connectDB from '@/backend/lib/db'
import { AppError } from '@/backend/lib/withErrorHandler'
import {Feature}Model from '@/backend/models/{feature}.model'

export async function getAll{Feature}s() {
  await connectDB()
  return {Feature}Model.find({}).sort({ createdAt: -1 }).lean()
}

export async function create{Feature}(data: { title: string }) {
  await connectDB()
  const item = await {Feature}Model.create(data)
  return item.toObject()
}
```

**Step 10 — Create the Mongoose model**

```typescript
// src/backend/models/{feature}.model.ts
import mongoose, { Schema, model, models } from 'mongoose'

export interface I{Feature} {
  _id: string
  title: string
  createdAt: Date
  updatedAt: Date
}

const {feature}Schema = new Schema<I{Feature}>(
  {
    title: { type: String, required: true },
  },
  { timestamps: true }
)

const {Feature}Model = models.{Feature} || model<I{Feature}>('{Feature}', {feature}Schema)
export default {Feature}Model
```

**Step 11 — Create the Zod validator**

```typescript
// src/backend/validators/{feature}.validator.ts
import { z } from 'zod'

export const create{Feature}Schema = z.object({
  title: z.string().min(1, 'Title is required'),
})

export type Create{Feature}Input = z.infer<typeof create{Feature}Schema>
```

**Step 12 — Create the page component**

```typescript
// src/modules/{feature}/pages/{Feature}Page.tsx
'use client'
import { use{Feature}s } from '../hooks/use{Feature}s'

export default function {Feature}Page() {
  const { data, isLoading } = use{Feature}s()
  if (isLoading) return <div>Loading...</div>
  return (
    <div>
      {data?.map((item) => (
        <div key={item._id}>{item.title}</div>
      ))}
    </div>
  )
}
```

**Step 13 — Wire up the Next.js page**

```typescript
// src/app/(protected)/{feature}/page.tsx
import {Feature}Page from '@/modules/{feature}/pages/{Feature}Page'

export default function Page() {
  return <{Feature}Page />
}
```

---

### 11.5 Next.js vs External CollageCampus Express API — Boundary Clarification

**What** is the boundary?

This project contains two separate backends: the Next.js Route Handlers (inside this repo) and an optional external CollageCampus Express API (a separate Node.js/Express server, not in this repo). Understanding which logic lives where prevents you from accidentally duplicating code or calling the wrong backend.

**Why** does this boundary matter?

If you add a new feature to the wrong backend, it will either not be accessible from the browser (if you add it to the external API and the browser tries to call it directly) or it will duplicate logic that already exists (if you re-implement in Next.js something that the external API already handles).

**How** is the boundary defined?

```
┌─────────────────────────────────────────────────────────────────────┐
│                    THIS NEXT.JS PROJECT                              │
│                                                                      │
│  Owns:                                                               │
│  ├── Authentication (login, register, refresh, logout, reset)        │
│  ├── Marketplace listings  (/api/listed-products)                    │
│  ├── Marketplace requests  (/api/requested-products)                 │
│  ├── Shops                 (/api/shops)                              │
│  ├── Jobs                  (/api/jobs)                               │
│  ├── CMS                   (/api/cms)                                │
│  └── Users (admin)         (/api/users)                              │
│                                                                      │
│  Rule: The browser ONLY calls /api/* on localhost:3000.              │
│        It NEVER calls the external Express API directly.             │
└─────────────────────────────────────────────────────────────────────┘
          │
          │  If additional business logic is needed from
          │  the external API, call it from a Route Handler
          │  or service function — never from the browser.
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│              EXTERNAL CollageCampus Express API (optional)           │
│                                                                      │
│  May own:                                                            │
│  ├── Additional business logic not yet migrated to Next.js           │
│  ├── Legacy endpoints from before the Next.js migration              │
│  └── Any feature explicitly delegated to the Express backend         │
│                                                                      │
│  Rule: The browser NEVER calls this API directly.                    │
│        Only Route Handlers or service functions call it.             │
└─────────────────────────────────────────────────────────────────────┘
```

The key rule: **the browser never calls the external API directly**. If you need data from the external API, create a Route Handler in this Next.js project that calls the external API server-side and returns the result to the browser. This keeps the BFF pattern intact — the browser always has a single entry point at `localhost:3000/api/*`.

**When** do you need to call the external API?

Only when the feature you are building requires data or logic that lives exclusively in the external Express backend and has not been migrated to Next.js. In that case:

1. Create a Route Handler in `src/app/api/{feature}/route.ts`.
2. In the Route Handler (or a service function it calls), use a server-side HTTP client (e.g., `fetch` or a server-side Axios instance without `withCredentials`) to call the external API.
3. Return the result to the browser via `sendSuccess`.
4. The browser calls your Next.js Route Handler — it never knows the external API exists.

```
Browser
  │
  │  GET /api/external-feature  (calls Next.js Route Handler)
  ▼
Next.js Route Handler
  │
  │  server-side fetch to external Express API
  ▼
External CollageCampus Express API
  │
  │  returns data
  ▼
Next.js Route Handler  ──►  sendSuccess(data, 'Fetched')
  │
  ▼
Browser receives clean response
```
