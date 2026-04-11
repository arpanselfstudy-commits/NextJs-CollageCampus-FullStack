# Design Document: Next.js Frontend Optimization

## Overview

This document describes the technical design for optimizing the `collage-campus-app` Next.js 16 frontend. The application is a pure frontend — the backend is a separate service accessed via `/api/*` rewrites in `next.config.ts`. The optimization targets rendering strategy per route, image and font optimization, code splitting, React Query cache tuning, metadata/SEO, bundle size, loading UI, and error boundaries.

The design follows the principle of minimal change: only what is necessary to meet each requirement is changed. Existing patterns (module-based page organization, Zustand auth store, React Query hooks) are preserved.

---

## Architecture

### Current State

```
Browser → Next.js App (frontend only)
                ↓ /api/* rewrites
         External Backend (separate service)
```

All pages currently render client-side. The `(protected)/layout.tsx` uses a `'use client'` guard that reads from Zustand's persisted auth store. The landing page, list pages, and detail pages all fetch data via React Query hooks inside `'use client'` components.

### Target State

```
                    ┌─────────────────────────────────────────────┐
                    │           Next.js App Router                │
                    │                                             │
  (auth) routes ────┤ SSG (force-static) — CDN edge              │
                    │                                             │
  /landing ─────────┤ ISR (revalidate=60) + HydrationBoundary    │
                    │                                             │
  /marketplace,     │                                             │
  /shops, /jobs ────┤ CSR (force-dynamic) — unchanged            │
                    │                                             │
  /[id] detail ─────┤ SSR (revalidate=300) + generateMetadata    │
                    │                                             │
  /account/* ───────┤ CSR (force-dynamic) — user-specific        │
                    └─────────────────────────────────────────────┘
                                    ↓ /api/* rewrites
                             External Backend
```

### Key Architectural Decisions

1. **Protected layout stays `'use client'`** — The `ProtectedGuard` reads `isAuthenticated` from Zustand (localStorage). Server components cannot access localStorage, so the guard must remain a client component. Server components inside `(protected)` can still be async RSCs because the guard wraps them at the layout level.

2. **Server-side prefetch uses a per-request QueryClient** — The shared singleton `queryClient` in `src/lib/react-query/queryClient.ts` is for the browser. Server-side prefetching must use a fresh `QueryClient` per request to avoid cross-request data leakage.

3. **Dynamic imports for browser-only components** — Components that reference `window`, `localStorage`, or browser APIs (modals, ImageUploader, auth page modules) are wrapped in `next/dynamic` with `{ ssr: false }`.

---

## Components and Interfaces

### Rendering Strategy Per Route

| Route | Strategy | Export | Rationale |
|---|---|---|---|
| `(auth)/login` | SSG | `dynamic = 'force-static'` | Static shell, no server data |
| `(auth)/register` | SSG | `dynamic = 'force-static'` | Static shell, no server data |
| `(auth)/forgot-password` | SSG | `dynamic = 'force-static'` | Static shell, no server data |
| `(auth)/reset-password` | SSG | `dynamic = 'force-static'` | Static shell, no server data |
| `(protected)/landing` | ISR | `revalidate = 60` | Fresh preview data, cacheable |
| `(protected)/marketplace` | CSR | `dynamic = 'force-dynamic'` | Interactive filters |
| `(protected)/shops` | CSR | `dynamic = 'force-dynamic'` | Interactive filters |
| `(protected)/jobs` | CSR | `dynamic = 'force-dynamic'` | Interactive filters |
| `(protected)/marketplace/[id]` | SSR | `revalidate = 300` | SEO metadata + fresh data |
| `(protected)/shops/[id]` | SSR | `revalidate = 300` | SEO metadata + fresh data |
| `(protected)/jobs/[id]` | SSR | `revalidate = 300` | SEO metadata + fresh data |
| `(protected)/account/*` | CSR | `dynamic = 'force-dynamic'` | User-specific, auth-gated |

### Server-Side Prefetch Pattern (Landing + Detail Pages)

```typescript
// Per-request QueryClient factory (new file: src/lib/react-query/serverQueryClient.ts)
import { QueryClient } from '@tanstack/react-query'

export function makeServerQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000 },
    },
  })
}
```

```typescript
// Landing page server component pattern
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { makeServerQueryClient } from '@/lib/react-query/serverQueryClient'

export const revalidate = 60

export default async function Page() {
  const qc = makeServerQueryClient()
  await Promise.allSettled([
    qc.prefetchQuery({ queryKey: queryKeys.jobs.all({ limit: 6 }), queryFn: ... }),
    qc.prefetchQuery({ queryKey: queryKeys.shops.all({ limit: 4 }), queryFn: ... }),
    // ...
  ])
  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <LandingPage />
    </HydrationBoundary>
  )
}
```

### Dynamic Import Pattern

```typescript
// Modal dynamic import
const ConfirmModal = dynamic(() => import('@/components/common/Modal/ConfirmModal'), {
  ssr: false,
  loading: () => <div className="modal-skeleton" />,
})

// ImageUploader dynamic import
const ImageUploader = dynamic(() => import('@/components/common/ImageUploader/ImageUploader'), {
  ssr: false,
  loading: () => <div className="uploader-skeleton" />,
})
```

### generateMetadata Pattern (Detail Pages)

```typescript
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const item = await fetchItemById(params.id)
    return {
      title: item.name,
      description: item.description?.slice(0, 160) ?? '',
    }
  } catch {
    return { title: 'Item Not Found' }
  }
}
```

### React Query Client Updates

The `queryClient.ts` singleton gains two new defaults:

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 min (existing)
      gcTime: 1000 * 60 * 10,     // 10 min (new)
      retry: 1,                    // existing
      refetchOnWindowFocus: false, // new
    },
  },
})
```

User-specific hooks override `staleTime`:

```typescript
export function useMyListedProducts(params?) {
  return useQuery({
    queryKey: ['listed-products', 'mine', params],
    queryFn: ...,
    staleTime: 0, // always refetch user-owned data
  })
}
```

Logout clears the cache:

```typescript
// In auth logout handler
clearAuth()
queryClient.clear()
```

### next.config.ts Changes

```typescript
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })

const nextConfig: NextConfig = {
  compress: true,
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: { remotePatterns: [...] },
  async rewrites() { ... },
}

export default withBundleAnalyzer(nextConfig)
```

---

## Data Models

No new data models are introduced. The optimization works with existing API response shapes. The relevant types for server-side prefetching are already defined in each module's `types.ts`.

### Query Key Alignment

Server-side prefetch query keys must exactly match client-side hook query keys so React Query's hydration deduplicates correctly:

| Data | Server prefetch key | Client hook key |
|---|---|---|
| Jobs list | `queryKeys.jobs.all({ limit: 6 })` | `queryKeys.jobs.all(params)` |
| Shops list | `queryKeys.shops.all({ limit: 4 })` | `queryKeys.shops.all(params)` |
| Listed products | `queryKeys.listedProducts.all({ limit: 8 })` | `queryKeys.listedProducts.all(params)` |
| Requested products | `queryKeys.requestedProducts.all({ limit: 8 })` | `queryKeys.requestedProducts.all(params)` |
| Product detail | `queryKeys.listedProducts.byId(id)` | `queryKeys.listedProducts.byId(id)` |
| Shop detail | `queryKeys.shops.byId(id)` | `queryKeys.shops.byId(id)` |
| Job detail | `queryKeys.jobs.byId(id)` | `queryKeys.jobs.byId(id)` |

### Metadata Shape

```typescript
// Root layout metadata (src/app/layout.tsx)
export const metadata: Metadata = {
  title: { template: '%s | Campus App', default: 'Campus App' },
  description: 'The campus marketplace for students.',
  openGraph: {
    title: 'Campus App',
    description: 'The campus marketplace for students.',
  },
}

// Auth page metadata (each auth route)
export const metadata: Metadata = {
  title: 'Login', // or 'Register', etc.
  robots: { index: false, follow: false },
}

// Detail page metadata (generated)
export async function generateMetadata({ params }): Promise<Metadata> {
  const item = await fetchItem(params.id)
  return {
    title: item.name,
    description: item.description?.slice(0, 160),
    openGraph: { title: item.name, description: item.description?.slice(0, 160) },
  }
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

The testing library for property-based tests in this TypeScript/React project is **fast-check** (`npm install --save-dev fast-check`). Each property test runs a minimum of 100 iterations.

### Property 1: React Query dehydration/hydration round-trip

For any set of query data prefetched into a server-side QueryClient, dehydrating that client and then hydrating a fresh client with the dehydrated state should result in the same query data being available in the new client without triggering additional network requests.

**Validates: Requirements 2.4**

### Property 2: List query staleTime is at least 5 minutes

For any list query hook (jobs, shops, listed products, requested products) called with any valid params object, the effective `staleTime` used by the query should be greater than or equal to 300,000 ms (5 minutes).

**Validates: Requirements 3.4, 8.1**

### Property 3: User-specific query staleTime is 0

For any user-owned data query hook (useMyListedProducts, useMyRequestedProducts, auth profile), the `staleTime` option should be exactly 0, ensuring the data is always considered stale and refetched on mount.

**Validates: Requirements 8.3**

### Property 4: generateMetadata produces valid title and truncated description

For any item object with a non-empty `name` and any `description` string, `generateMetadata` should return a `Metadata` object where `title` contains the item name and `description` has a length of at most 160 characters.

**Validates: Requirements 4.1, 9.4**

### Property 5: Next_Image remote usage always includes a sizes prop

For any component that renders a `Next_Image` (`next/image`) with a remote `src` URL, the rendered output should include a non-empty `sizes` attribute so the browser can select the correct image size.

**Validates: Requirements 5.2**

### Property 6: Card images always have blur placeholder

For any product or shop card image rendered with `Next_Image`, the component should have `placeholder="blur"` and a non-empty `blurDataURL` string to prevent layout shift during load.

**Validates: Requirements 5.4**

### Property 7: Dynamic imports always provide a loading fallback

For any `dynamic()` call in the application, the options object should include a `loading` function that returns a non-null React element, ensuring no blank flash while the component chunk loads.

**Validates: Requirements 7.3**

### Property 8: Error boundaries render a reset button for any error

For any `error.tsx` component, rendering it with any `Error` object and a `reset` callback should produce a UI that contains a "Try again" button which, when clicked, invokes the `reset` function.

**Validates: Requirements 12.2**

### Property 9: Loading boundaries render PageLoader

For any `loading.tsx` file in the application, rendering the default export should produce the `PageLoader` component, ensuring consistent loading UI across all route segments.

**Validates: Requirements 11.2**

---

## Error Handling

### Server-Side Prefetch Failures

Server components use `Promise.allSettled` for prefetching so that a single failing API call does not prevent the page from rendering. Failed prefetches result in the client-side React Query hooks fetching data normally on mount.

```typescript
await Promise.allSettled([
  qc.prefetchQuery(...),
  qc.prefetchQuery(...),
])
// Page always renders — client hooks handle missing data
```

### Detail Page 404

When a detail page server component receives a 404 from the backend, it calls Next.js `notFound()`:

```typescript
const item = await fetchItem(id).catch((err) => {
  if (err.response?.status === 404) notFound()
  throw err
})
```

### Error Boundaries

Each major route group gets an `error.tsx`:

- `src/app/error.tsx` — already exists (root)
- `src/app/(protected)/error.tsx` — new
- `src/app/(protected)/marketplace/error.tsx` — new (optional, for detail page errors)
- `src/app/(protected)/shops/error.tsx` — new
- `src/app/(protected)/jobs/error.tsx` — new

All `error.tsx` files are `'use client'` components (required by Next.js). They render a user-friendly message and a "Try again" button that calls `reset()`. Detail page error UIs include a link back to the parent list page.

### Auth Page Hydration Errors

Auth page module components (`LoginPage`, `RegisterPage`, etc.) that reference browser APIs are wrapped in `dynamic(..., { ssr: false })` in their route `page.tsx` files. This prevents hydration mismatches when the static shell is served from the CDN.

---

## Testing Strategy

### Approach

This feature is primarily a refactoring and configuration optimization. The testing strategy uses:

- **Unit tests** for specific behavioral requirements (metadata generation, error boundary rendering, logout cache clearing)
- **Property-based tests** (fast-check) for universal properties that hold across all inputs
- **Smoke tests** (build-time checks, static analysis) for configuration requirements

### Property-Based Tests (fast-check)

Each property from the Correctness Properties section maps to one property-based test. Minimum 100 iterations per test.

Tag format: `// Feature: nextjs-frontend-optimization, Property {N}: {property_text}`

```typescript
// Example: Property 4 — generateMetadata truncates description
import fc from 'fast-check'
import { generateMetadataForProduct } from '@/modules/marketplace/utils/metadata'

test('generateMetadata truncates description to 160 chars', () => {
  // Feature: nextjs-frontend-optimization, Property 4: generateMetadata produces valid title and truncated description
  fc.assert(
    fc.property(
      fc.record({ name: fc.string({ minLength: 1 }), description: fc.string() }),
      (item) => {
        const meta = generateMetadataForProduct(item)
        expect(meta.title).toContain(item.name)
        expect((meta.description ?? '').length).toBeLessThanOrEqual(160)
      }
    ),
    { numRuns: 100 }
  )
})
```

### Unit Tests

- `queryClient` configuration: verify `gcTime`, `refetchOnWindowFocus`, `staleTime` values
- Logout handler: mock `queryClient.clear()`, verify it is called on `clearAuth()`
- `generateMetadata` for each detail page: mock API, verify returned `Metadata` shape
- Error boundary components: render with mock error, verify "Try again" button and `reset` call
- Loading components: render and verify `PageLoader` is present
- `ConfirmModal`, `ContactModal` dynamic imports: verify `ssr: false` and loading prop

### Smoke / Build Checks

- `export const dynamic` values in auth and list route files
- `export const revalidate` values in landing and detail route files
- `robots` metadata in auth pages
- `next.config.ts` contains `optimizePackageImports`, `compress`, `output: 'standalone'`
- No `@import url(...)` for Google Fonts in CSS files
- `loading.tsx` and `error.tsx` files exist at required paths

### Integration Tests

- Landing page server component: mock API calls, verify `HydrationBoundary` receives dehydrated state with correct query keys
- Detail page server component: mock API returning 404, verify `notFound()` is called
- Detail page server component: mock API success, verify `HydrationBoundary` wraps page content
