# Requirements Document

## Introduction

This feature optimizes the existing Next.js 16 frontend-only application (collage-campus-app) using Next.js-specific capabilities. The backend is a separate service; Next.js handles only the frontend and proxies API calls via `next.config.ts` rewrites. The optimization covers rendering strategy selection per page/route, image optimization, font optimization, React Query caching alignment with Next.js data lifecycle, code splitting, bundle optimization, and performance-related metadata.

The application has the following route groups:
- `(auth)` — login, register, forgot-password, reset-password (public, no auth required)
- `(protected)` — landing, marketplace, shops, jobs, account pages (requires authentication via Zustand-persisted auth store)
- API routes — proxy to the external backend

## Glossary

- **Next.js_App**: The Next.js 16 frontend application being optimized.
- **RSC**: React Server Component — a component that renders on the server with no client-side JavaScript bundle cost.
- **CSR**: Client-Side Rendering — rendering that happens entirely in the browser using React hooks and state.
- **SSR**: Server-Side Rendering — per-request server rendering using `async` Server Components or `dynamic = 'force-dynamic'`.
- **SSG**: Static Site Generation — pages pre-rendered at build time with no per-request server work.
- **ISR**: Incremental Static Regeneration — SSG pages that revalidate in the background after a configurable time interval.
- **Dynamic_Import**: Next.js `dynamic()` wrapper that lazy-loads a component and optionally disables SSR for it.
- **Next_Image**: The `next/image` `<Image>` component that provides automatic resizing, format conversion (WebP/AVIF), lazy loading, and blur placeholders.
- **Next_Font**: The `next/font` module that self-hosts Google Fonts and eliminates external font network requests.
- **React_Query**: `@tanstack/react-query` v5 used for server-state management and caching.
- **Auth_Store**: The Zustand-persisted store (`auth-storage` in `localStorage`) that holds `accessToken`, `refreshToken`, and `isAuthenticated`.
- **Protected_Guard**: The client component in `(protected)/layout.tsx` that redirects unauthenticated users to `/login`.
- **Rewrite_Proxy**: The `rewrites()` rule in `next.config.ts` that forwards `/api/*` requests to the external backend.
- **Metadata_API**: Next.js `generateMetadata` / `export const metadata` for per-page SEO and Open Graph tags.
- **Bundle_Analyzer**: `@next/bundle-analyzer` package that visualizes the client-side JavaScript bundle.

---

## Requirements

### Requirement 1: Rendering Strategy — Auth Pages (SSG)

**User Story:** As a developer, I want auth pages (login, register, forgot-password, reset-password) to be statically generated, so that they load instantly from the CDN edge with no server compute per request.

#### Acceptance Criteria

1. THE Next.js_App SHALL export `export const dynamic = 'force-static'` (or rely on the default static behavior) from each auth route segment (`login`, `register`, `forgot-password`, `reset-password`).
2. WHEN the Next.js build runs, THE Next.js_App SHALL pre-render all auth pages as static HTML with no server-side data fetching.
3. THE Next.js_App SHALL keep auth page module components (`LoginPage`, `RegisterPage`, etc.) as `'use client'` components loaded via `Dynamic_Import` with `ssr: false` where they contain `localStorage`-dependent logic, so the static shell renders without hydration errors.
4. IF an auth page component references `window` or `localStorage` at module scope, THEN THE Next.js_App SHALL wrap that component in a `Dynamic_Import` with `{ ssr: false }` to prevent server-side reference errors.

---

### Requirement 2: Rendering Strategy — Landing Page (SSR with short revalidation)

**User Story:** As a developer, I want the landing page to render with fresh data on the server, so that users see up-to-date jobs, shops, and marketplace previews without a client-side loading flash.

#### Acceptance Criteria

1. THE Next.js_App SHALL convert the landing page route (`(protected)/landing/page.tsx`) to use an `async` Server Component that prefetches jobs, shops, listed products, and requested products via `React_Query` server-side prefetching (using `HydrationBoundary`).
2. WHEN the landing page is requested, THE Next.js_App SHALL fetch preview data (limit 6 jobs, 4 shops, 8 listed products, 8 requested products) on the server before sending HTML to the client.
3. THE Next.js_App SHALL set `export const revalidate = 60` on the landing page route so that the server-rendered HTML is cached and revalidated every 60 seconds (ISR behavior).
4. WHEN hydrated data is available from the server, THE React_Query client SHALL use the dehydrated state so that no duplicate network requests are made on the client for the initial data.
5. IF the server-side prefetch fails, THEN THE Next.js_App SHALL still render the page shell and allow the client-side `React_Query` hooks to fetch data normally.

---

### Requirement 3: Rendering Strategy — List Pages (CSR with React Query, no change needed / document intent)

**User Story:** As a developer, I want marketplace, shops, and jobs list pages to remain client-side rendered, so that interactive filters, search, and pagination work without full page reloads.

#### Acceptance Criteria

1. THE Next.js_App SHALL keep `MarketplacePage`, `ShopsPage`, and `JobsPage` as `'use client'` components because they manage interactive filter state that changes on every user interaction.
2. THE Next.js_App SHALL set `export const dynamic = 'force-dynamic'` on the list page route segments to prevent Next.js from attempting static generation of pages that depend on runtime user state.
3. WHILE a list page is loading data, THE Next.js_App SHALL display the existing `SectionLoader` component so users receive visual feedback.
4. THE React_Query client SHALL maintain a `staleTime` of at least 5 minutes for list queries so that navigating back to a list page does not trigger a redundant network request within the same session.

---

### Requirement 4: Rendering Strategy — Detail Pages (SSR + generateMetadata)

**User Story:** As a developer, I want product, shop, and job detail pages to render on the server with correct metadata, so that each item has accurate page titles and descriptions for sharing.

#### Acceptance Criteria

1. THE Next.js_App SHALL add `export async function generateMetadata({ params })` to each detail page route (`marketplace/[id]`, `shops/[id]`, `jobs/[id]`) that fetches the item name/title from the backend and returns a `Metadata` object with `title` and `description`.
2. WHEN a detail page is server-rendered, THE Next.js_App SHALL prefetch the item data on the server and pass it to the client via `HydrationBoundary` so the page renders with content immediately.
3. THE Next.js_App SHALL set `export const revalidate = 300` on detail page routes so that cached server renders are refreshed every 5 minutes.
4. IF the backend returns a 404 for a detail page item, THEN THE Next.js_App SHALL call Next.js `notFound()` to render the built-in 404 page.
5. THE Next.js_App SHALL keep the interactive parts of detail pages (contact modal, image gallery state) as `'use client'` child components loaded via `Dynamic_Import`.

---

### Requirement 5: Image Optimization — Replace `<img>` with `Next_Image`

**User Story:** As a developer, I want all product, shop, and user images to use the Next.js Image component, so that images are automatically resized, converted to WebP/AVIF, and lazy-loaded.

#### Acceptance Criteria

1. THE Next.js_App SHALL replace every `<img>` tag that renders remote URLs (product images, shop photos, user avatars from the backend) with the `Next_Image` component.
2. WHEN `Next_Image` renders a remote image, THE Next.js_App SHALL provide a `sizes` prop appropriate to the layout context (e.g., `"(max-width: 768px) 100vw, 300px"` for grid cards).
3. THE Next.js_App SHALL add `priority` prop to the first visible image on each page (hero images on landing, first product image on detail pages) so that it is preloaded and does not block LCP.
4. THE Next.js_App SHALL add `placeholder="blur"` with a `blurDataURL` (a base64 low-quality placeholder) to product and shop card images to prevent layout shift during load.
5. THE `next.config.ts` SHALL retain the existing `remotePatterns` configuration and add any additional backend image hostnames required.
6. THE `ImageUploader` component SHALL continue using a local `URL.createObjectURL` preview (not `Next_Image`) because the preview is a local blob URL, not a remote optimizable URL.

---

### Requirement 6: Font Optimization

**User Story:** As a developer, I want Google Fonts to be self-hosted through Next.js, so that there are no external font network requests that block rendering.

#### Acceptance Criteria

1. THE Next.js_App SHALL use `next/font/google` for all Google Font imports (Geist, Geist_Mono are already using this; any additional fonts added in the future SHALL also use `next/font/google`).
2. THE Next.js_App SHALL pass `display: 'swap'` to all `next/font/google` font configurations so that text remains visible during font load.
3. THE Next.js_App SHALL define all font variables in the root `layout.tsx` and apply them via CSS variables so that fonts are loaded once for the entire application.
4. THE Next.js_App SHALL NOT import fonts via `@import url(...)` in any CSS file, as this bypasses Next.js font optimization.

---

### Requirement 7: Code Splitting and Dynamic Imports

**User Story:** As a developer, I want heavy or conditionally rendered components to be code-split, so that the initial JavaScript bundle is smaller and pages load faster.

#### Acceptance Criteria

1. THE Next.js_App SHALL wrap modal components (`ConfirmModal`, `ContactModal`, `ContactModalWithPhoto`) in `Dynamic_Import` with `{ ssr: false }` so their code is only loaded when a modal is opened.
2. THE Next.js_App SHALL wrap the `ImageUploader` component in `Dynamic_Import` with `{ ssr: false }` on pages where it is used (list-product, request-product, edit-profile) because it depends on browser APIs.
3. WHEN a dynamically imported component is loading, THE Next.js_App SHALL provide a `loading` prop to `dynamic()` that renders a minimal inline placeholder (spinner or skeleton) so there is no blank flash.
4. THE Next.js_App SHALL NOT apply `Dynamic_Import` to small utility components (icons, buttons, inputs) as the overhead of dynamic loading outweighs the bundle savings for small modules.

---

### Requirement 8: React Query Cache and Stale-Time Optimization

**User Story:** As a developer, I want React Query cache settings tuned to the application's data freshness requirements, so that unnecessary refetches are avoided without serving stale data.

#### Acceptance Criteria

1. THE React_Query client SHALL set `staleTime: 1000 * 60 * 5` (5 minutes) as the global default, which is already configured and SHALL be preserved.
2. THE React_Query client SHALL set `gcTime: 1000 * 60 * 10` (10 minutes) as the global default so that inactive query data is kept in memory for 10 minutes before garbage collection.
3. WHERE a query fetches user-specific data (my-products, my-requests, profile), THE React_Query hook SHALL override `staleTime` to `0` so that user-owned data is always considered stale and refetched on focus.
4. THE React_Query client SHALL set `refetchOnWindowFocus: false` globally to prevent refetches when the user switches browser tabs, since the backend data does not change at high frequency.
5. WHEN the user logs out, THE Next.js_App SHALL call `queryClient.clear()` to remove all cached query data so that no previous user's data is visible to the next user.

---

### Requirement 9: Next.js Metadata and SEO

**User Story:** As a developer, I want each page to have accurate metadata, so that browser tabs, search engines, and social sharing show meaningful titles and descriptions.

#### Acceptance Criteria

1. THE Next.js_App SHALL export a `metadata` object or `generateMetadata` function from every page route segment that does not already have one.
2. THE Next.js_App SHALL set a `title` template in the root `layout.tsx` metadata (e.g., `{ template: '%s | Campus App', default: 'Campus App' }`) so that child pages only need to provide the page-specific title segment.
3. THE Next.js_App SHALL set `description`, `openGraph.title`, and `openGraph.description` in the root metadata as fallback values.
4. WHEN a detail page generates metadata, THE Next.js_App SHALL include the item name in the `title` and a truncated item description (max 160 characters) in the `description` field.
5. THE Next.js_App SHALL add `robots: { index: false, follow: false }` to all `(auth)` route metadata so that login and register pages are not indexed by search engines.

---

### Requirement 10: Bundle and Build Optimization

**User Story:** As a developer, I want the production bundle to be as small as possible, so that the application loads quickly on slow network connections.

#### Acceptance Criteria

1. THE `next.config.ts` SHALL enable `experimental.optimizePackageImports` for `lucide-react` so that only the icons actually used are included in the bundle instead of the entire icon library.
2. THE Next.js_App SHALL add `@next/bundle-analyzer` as a dev dependency and configure it in `next.config.ts` so that developers can run `ANALYZE=true npm run build` to inspect bundle composition.
3. THE Next.js_App SHALL NOT import entire libraries when only specific exports are needed (e.g., import `{ useQuery }` from `@tanstack/react-query`, not the default export).
4. THE `next.config.ts` SHALL set `compress: true` (which is the default) to ensure gzip/brotli compression is applied to all responses when running `next start`.
5. THE Next.js_App SHALL configure `output: 'standalone'` in `next.config.ts` WHERE the deployment target is a containerized environment (Docker), so that the production build includes only the necessary files.

---

### Requirement 11: Loading UI and Streaming

**User Story:** As a developer, I want each route segment to have a loading boundary, so that users see a skeleton or spinner immediately while server data is being fetched.

#### Acceptance Criteria

1. THE Next.js_App SHALL ensure a `loading.tsx` file exists at the root app level (already present) and SHALL add `loading.tsx` files to the `(protected)` route group and each major sub-route (`marketplace`, `shops`, `jobs`) that performs server-side data fetching.
2. WHEN a route segment is loading, THE Next.js_App SHALL render the existing `PageLoader` component as the loading fallback so the UI is consistent.
3. THE Next.js_App SHALL wrap server-fetched sections within a page in `<Suspense>` boundaries with appropriate fallbacks so that non-critical sections stream in after the critical content.

---

### Requirement 12: Error Boundaries

**User Story:** As a developer, I want each major route to have an error boundary, so that a data-fetching failure on one page does not crash the entire application.

#### Acceptance Criteria

1. THE Next.js_App SHALL ensure an `error.tsx` file exists at the root app level (already present) and SHALL add `error.tsx` files to the `(protected)` route group so that errors in protected pages are caught without affecting auth pages.
2. WHEN an unhandled error occurs in a route segment, THE Next.js_App SHALL render the error boundary UI with a "Try again" button that calls the `reset` function provided by Next.js.
3. THE `error.tsx` components SHALL be `'use client'` components as required by Next.js.
4. IF a detail page fetch returns an error, THEN THE Next.js_App SHALL display a user-friendly error message with a link back to the list page rather than a blank screen.
