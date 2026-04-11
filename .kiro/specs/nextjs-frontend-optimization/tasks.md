# Implementation Plan: Next.js Frontend Optimization

## Overview

Optimize the `collage-campus-app` Next.js 16 frontend by applying per-route rendering strategies, image/font optimization, code splitting, React Query cache tuning, metadata/SEO, bundle optimization, loading UI, and error boundaries. All changes follow the minimal-change principle — existing module structure, Zustand auth store, and React Query hooks are preserved.

## Tasks

- [x] 1. Configure `next.config.ts` and install bundle analyzer
  - Add `@next/bundle-analyzer` as a dev dependency (`npm install --save-dev @next/bundle-analyzer`)
  - Wrap `nextConfig` with `withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })`
  - Add `compress: true`, `output: 'standalone'`, and `experimental.optimizePackageImports: ['lucide-react']` to `nextConfig`
  - Preserve existing `images.remotePatterns` and `rewrites()` config
  - _Requirements: 10.1, 10.2, 10.4, 10.5_

- [x] 2. Update root layout metadata and font configuration
  - [x] 2.1 Update `src/app/layout.tsx` metadata export
    - Replace the existing `metadata` export with a title template (`{ template: '%s | Campus App', default: 'Campus App' }`), `description`, and `openGraph` fallback fields
    - Ensure both `Geist` and `Geist_Mono` font configs include `display: 'swap'`
    - _Requirements: 9.2, 9.3, 6.2_

  - [ ]* 2.2 Write unit test for root metadata shape
    - Import the `metadata` export from `src/app/layout.tsx` and assert `title.template`, `title.default`, `description`, and `openGraph` fields are present
    - _Requirements: 9.2, 9.3_

- [x] 3. Apply SSG rendering strategy to auth pages
  - [x] 3.1 Add `export const dynamic = 'force-static'` and `metadata` to each auth route segment
    - Update `src/app/(auth)/login/page.tsx`, `register/page.tsx`, `forgot-password/page.tsx`, `reset-password/page.tsx`
    - Each file exports `export const dynamic = 'force-static'` and a `metadata` object with `title` and `robots: { index: false, follow: false }`
    - _Requirements: 1.1, 1.2, 9.1, 9.5_

  - [x] 3.2 Wrap auth page module components in `dynamic()` with `ssr: false`
    - In each auth `page.tsx`, replace the static import of `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage` with `next/dynamic` imports using `{ ssr: false, loading: () => <PageLoader /> }`
    - _Requirements: 1.3, 1.4_

  - [ ]* 3.3 Write unit test for auth page dynamic export
    - Verify that each auth route file exports `dynamic === 'force-static'` and that `metadata.robots.index === false`
    - _Requirements: 1.1, 9.5_

- [x] 4. Apply CSR rendering strategy to list pages and account pages
  - [x] 4.1 Add `export const dynamic = 'force-dynamic'` to list page route segments
    - Update `src/app/(protected)/marketplace/page.tsx`, `shops/page.tsx`, `jobs/page.tsx`
    - Update all `src/app/(protected)/account/*/page.tsx` files
    - _Requirements: 3.2_

  - [ ]* 4.2 Write unit test for list page dynamic export
    - Verify each list route file exports `dynamic === 'force-dynamic'`
    - _Requirements: 3.2_

- [x] 5. Create server-side QueryClient factory
  - Create `src/lib/react-query/serverQueryClient.ts` that exports `makeServerQueryClient()` returning a fresh `QueryClient` with `staleTime: 60 * 1000`
  - This factory is used by server components to avoid cross-request data leakage
  - _Requirements: 2.1, 4.2_

- [x] 6. Convert landing page to ISR server component with prefetching
  - [x] 6.1 Rewrite `src/app/(protected)/landing/page.tsx` as an async Server Component
    - Export `export const revalidate = 60`
    - Use `makeServerQueryClient()` to prefetch jobs (limit 6), shops (limit 4), listed products (limit 8), requested products (limit 8) via `Promise.allSettled`
    - Wrap `<LandingPage />` in `<HydrationBoundary state={dehydrate(qc)}>`
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [ ]* 6.2 Write property test for dehydration/hydration round-trip
    - **Property 1: React Query dehydration/hydration round-trip**
    - **Validates: Requirements 2.4**
    - Use `fast-check` to generate arbitrary query data, dehydrate a `QueryClient`, hydrate a fresh client, and assert the same data is available without triggering additional fetches
    - _Requirements: 2.4_

  - [ ]* 6.3 Write integration test for landing page server component
    - Mock the four API calls, render the server component, and verify `HydrationBoundary` receives a dehydrated state containing the correct query keys
    - _Requirements: 2.1, 2.4_

- [x] 7. Convert detail pages to SSR with `generateMetadata`
  - [x] 7.1 Rewrite `src/app/(protected)/marketplace/[id]/page.tsx`
    - Export `export const revalidate = 300`
    - Add `export async function generateMetadata({ params })` that fetches the product by ID and returns `{ title: product.name, description: product.description?.slice(0, 160), openGraph: { ... } }`; return `{ title: 'Product Not Found' }` on error
    - Prefetch product data server-side with `makeServerQueryClient()` and wrap `<ProductDetailPage />` in `<HydrationBoundary>`
    - Call `notFound()` when the backend returns 404
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 7.2 Rewrite `src/app/(protected)/shops/[id]/page.tsx`
    - Same pattern as 7.1 but for shop data (`shop.name`, `shop.description`)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 7.3 Rewrite `src/app/(protected)/jobs/[id]/page.tsx`
    - Same pattern as 7.1 but for job data (`job.title`, `job.description`)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 7.4 Write property test for `generateMetadata` title and description
    - **Property 4: generateMetadata produces valid title and truncated description**
    - **Validates: Requirements 4.1, 9.4**
    - Extract the metadata generation logic into a pure utility function (e.g., `src/modules/marketplace/utils/metadata.ts`) and use `fast-check` to assert `title` contains the item name and `description.length <= 160` for any input
    - _Requirements: 4.1, 9.4_

  - [ ]* 7.5 Write integration tests for detail page 404 and success paths
    - Mock API returning 404 → verify `notFound()` is called
    - Mock API success → verify `HydrationBoundary` wraps page content
    - _Requirements: 4.4, 4.2_

- [x] 8. Add metadata to remaining page routes
  - [x] 8.1 Add `metadata` exports to list page route segments
    - Add `export const metadata: Metadata = { title: 'Marketplace' }` (and similarly for Shops, Jobs) to the respective `page.tsx` files
    - _Requirements: 9.1_

  - [x] 8.2 Add `metadata` exports to account page route segments
    - Add `metadata` with appropriate titles to all `src/app/(protected)/account/*/page.tsx` files
    - _Requirements: 9.1_

- [x] 9. Tune React Query client defaults
  - [x] 9.1 Update `src/lib/react-query/queryClient.ts`
    - Add `gcTime: 1000 * 60 * 10` and `refetchOnWindowFocus: false` to the `defaultOptions.queries` config
    - Preserve existing `staleTime: 1000 * 60 * 5` and `retry: 1`
    - _Requirements: 8.2, 8.4_

  - [x] 9.2 Add `staleTime: 0` override to user-specific query hooks
    - In `src/modules/marketplace/hooks/useListedProducts.ts`, add `staleTime: 0` to `useMyListedProducts`
    - In `src/modules/marketplace/hooks/useRequestedProducts.ts`, add `staleTime: 0` to `useMyRequestedProducts`
    - In the auth profile query hook (wherever `queryKeys.auth.profile` is used), add `staleTime: 0`
    - _Requirements: 8.3_

  - [ ]* 9.3 Write unit test for queryClient configuration
    - Assert `queryClient.getDefaultOptions().queries` has `staleTime === 300000`, `gcTime === 600000`, `refetchOnWindowFocus === false`
    - _Requirements: 8.1, 8.2, 8.4_

  - [ ]* 9.4 Write property test for list query staleTime
    - **Property 2: List query staleTime is at least 5 minutes**
    - **Validates: Requirements 3.4, 8.1**
    - Use `fast-check` to generate arbitrary valid params objects and assert that calling `useJobs`, `useShops`, `useListedProducts`, `useRequestedProducts` with those params results in an effective `staleTime >= 300000`
    - _Requirements: 3.4, 8.1_

  - [ ]* 9.5 Write property test for user-specific query staleTime
    - **Property 3: User-specific query staleTime is 0**
    - **Validates: Requirements 8.3**
    - Assert that `useMyListedProducts` and `useMyRequestedProducts` always use `staleTime === 0` regardless of params
    - _Requirements: 8.3_

- [x] 10. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement dynamic imports for modals and ImageUploader
  - [x] 11.1 Create dynamic import wrappers for modal components
    - In each component file or page that imports `ConfirmModal`, `ContactModal`, or `ContactModalWithPhoto`, replace the static import with `dynamic(() => import(...), { ssr: false, loading: () => <div className="modal-skeleton" /> })`
    - Identify all usage sites: `AppHeader` (logout confirm), `ProductDetailView`, `JobDetailView`, `ShopDetailView`
    - _Requirements: 7.1, 7.3_

  - [x] 11.2 Create dynamic import wrapper for `ImageUploader`
    - In `src/modules/user/pages/ListProductPage.tsx`, `RequestProductPage.tsx`, and `EditProfilePage.tsx`, replace the static `ImageUploader` import with a `dynamic()` import using `{ ssr: false, loading: () => <div className="uploader-skeleton" /> }`
    - _Requirements: 7.2, 7.3_

  - [ ]* 11.3 Write property test for dynamic import loading fallback
    - **Property 7: Dynamic imports always provide a loading fallback**
    - **Validates: Requirements 7.3**
    - For each `dynamic()` call, assert the options object includes a `loading` function that returns a non-null React element
    - _Requirements: 7.3_

- [x] 12. Replace `<img>` tags with `next/image` `<Image>` component
  - [x] 12.1 Audit and replace remote `<img>` tags in marketplace components
    - In product card and detail view components under `src/modules/marketplace/components/`, replace `<img src={...}>` with `<Image src={...} sizes="..." alt="..." />`
    - Add `priority` prop to the first/hero image in `ProductDetailView`
    - Add `placeholder="blur"` and `blurDataURL` to product card images
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 12.2 Replace remote `<img>` tags in shops components
    - In `src/modules/shops/components/`, replace `<img>` with `<Image>` using appropriate `sizes` prop
    - Add `priority` to the first shop image on detail pages
    - Add `placeholder="blur"` and `blurDataURL` to shop card images
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 12.3 Replace remote `<img>` tags in jobs and user/profile components
    - Replace any `<img>` rendering backend URLs in `src/modules/jobs/components/` and `src/modules/user/components/` (user avatars, etc.)
    - _Requirements: 5.1, 5.2_

  - [ ]* 12.4 Write property test for Next_Image sizes prop
    - **Property 5: Next_Image remote usage always includes a sizes prop**
    - **Validates: Requirements 5.2**
    - Render each image component with arbitrary remote `src` strings and assert the rendered `<img>` element has a non-empty `sizes` attribute
    - _Requirements: 5.2_

  - [ ]* 12.5 Write property test for card image blur placeholder
    - **Property 6: Card images always have blur placeholder**
    - **Validates: Requirements 5.4**
    - Render product and shop card components with arbitrary data and assert `placeholder="blur"` and a non-empty `blurDataURL` are present
    - _Requirements: 5.4_

- [x] 13. Add `loading.tsx` files to route segments
  - Create `src/app/(protected)/loading.tsx` rendering `<PageLoader />`
  - Create `src/app/(protected)/marketplace/loading.tsx` rendering `<PageLoader />`
  - Create `src/app/(protected)/shops/loading.tsx` rendering `<PageLoader />`
  - Create `src/app/(protected)/jobs/loading.tsx` rendering `<PageLoader />`
  - _Requirements: 11.1, 11.2_

  - [ ]* 13.1 Write property test for loading boundary renders PageLoader
    - **Property 9: Loading boundaries render PageLoader**
    - **Validates: Requirements 11.2**
    - For each new `loading.tsx`, render the default export and assert the output contains the `PageLoader` component
    - _Requirements: 11.2_

- [x] 14. Add `error.tsx` files to route segments
  - [x] 14.1 Create `src/app/(protected)/error.tsx`
    - `'use client'` component accepting `{ error, reset }` props
    - Render a user-friendly message and a "Try again" button that calls `reset()`
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 14.2 Create error boundaries for marketplace, shops, and jobs route segments
    - Create `src/app/(protected)/marketplace/error.tsx`, `shops/error.tsx`, `jobs/error.tsx`
    - Each includes a "Try again" button and a link back to the parent list page
    - _Requirements: 12.1, 12.2, 12.4_

  - [ ]* 14.3 Write property test for error boundary reset button
    - **Property 8: Error boundaries render a reset button for any error**
    - **Validates: Requirements 12.2**
    - Use `fast-check` to generate arbitrary `Error` objects, render each `error.tsx` with a mock `reset` callback, and assert a "Try again" button is present and calls `reset` on click
    - _Requirements: 12.2_

- [x] 15. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests require `fast-check` (`npm install --save-dev fast-check`)
- The `ImageUploader` component itself is NOT changed — only its import sites use `dynamic()`
- Server-side prefetch uses `makeServerQueryClient()` (a fresh instance per request), never the singleton `queryClient`
- The `useLogout` hook already calls `queryClient.clear()` — no change needed for Requirement 8.5
