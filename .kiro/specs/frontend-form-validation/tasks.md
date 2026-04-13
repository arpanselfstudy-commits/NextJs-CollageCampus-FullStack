# Implementation Plan: Frontend Form Validation

## Overview

Migrate all form-bearing modules from `useState`-based form state to React Hook Form + Yup, fix TypeScript type errors across frontend and backend, and produce the Next.js architecture guide. Each task builds incrementally — schemas first, then hooks, then page/view wiring, then type fixes, then docs.

## Tasks

- [x] 1. Install dependencies
  - Run `npm install react-hook-form yup @hookform/resolvers`
  - Verify all three packages appear in `package.json` dependencies with no peer-dependency conflicts
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Create shared `FormError` component
  - Create or update `src/components/common/FormError/FormError.tsx` to accept `message?: string` and render `null` when `message` is `undefined` or empty
  - Export it from a shared index so both auth and user view components can import it
  - _Requirements: 10.3, 10.4_

- [x] 3. Auth module — validation schemas
  - [x] 3.1 Create `src/modules/auth/validation.ts` with `loginSchema`, `registerSchema`, `forgotPasswordSchema`, `resetPasswordSchema`, and `updateProfileSchema` using Yup, exporting each alongside its inferred form-value interface (`LoginFormValues`, `RegisterFormValues`, etc.)
    - `loginSchema`: email (valid email, required) + password (min 6, required)
    - `registerSchema`: name (min 2) + email + password (min 8) + confirmPassword (`oneOf([ref('password')]`)
    - `forgotPasswordSchema`: email only
    - `resetPasswordSchema`: password (min 8) + confirmPassword match
    - `updateProfileSchema`: name (min 2) + email + phoneNumber (≥7 digit pattern)
    - _Requirements: 2.1–2.13_

  - [ ]* 3.2 Write property tests for auth validation schemas
    - Create `src/modules/auth/__tests__/validation.test.ts` using `fast-check` + `vitest`
    - **Property 1: Login schema accepts valid credentials and rejects invalid ones** — `fc.emailAddress()` + `fc.string()` — **Validates: Requirements 2.2, 2.3**
    - **Property 2: Register schema enforces all field rules including password confirmation** — `fc.string()`, `fc.emailAddress()`, `fc.string({ minLength: 8 })` — **Validates: Requirements 2.4, 2.5, 2.6, 2.7**
    - **Property 3: Forgot-password schema accepts valid emails only** — `fc.emailAddress()`, `fc.string()` — **Validates: Requirements 2.8**
    - **Property 4: Reset-password schema enforces length and confirmation match** — `fc.string({ minLength: 8 })`, `fc.string()` — **Validates: Requirements 2.9, 2.10**
    - **Property 5: Update-profile schema enforces name, email, and phone rules** — `fc.string()`, `fc.emailAddress()`, `fc.string()` — **Validates: Requirements 2.11, 2.12, 2.13**
    - Tag each test: `// Feature: frontend-form-validation, Property {N}: {property_text}`

- [x] 4. Auth module — form hooks
  - [x] 4.1 Create `src/modules/auth/hooks/useLoginForm.ts` — calls `useForm<LoginFormValues>({ resolver: yupResolver(loginSchema) })`, wraps `useLogin`, exposes `register`, `handleSubmit`, `formState`, `onSubmit`, `mutation`
    - _Requirements: 3.1, 3.2_
  - [x] 4.2 Create `src/modules/auth/hooks/useRegisterForm.ts` — calls `useForm<RegisterFormValues>({ resolver: yupResolver(registerSchema) })`, wraps `useRegister`, exposes `register`, `handleSubmit`, `formState`, `watch`, `onSubmit`, `mutation`
    - _Requirements: 3.3, 3.4_
  - [x] 4.3 Create `src/modules/auth/hooks/useForgotPasswordForm.ts` — calls `useForm<ForgotPasswordFormValues>({ resolver: yupResolver(forgotPasswordSchema) })`, wraps `useForgotPassword`, exposes standard RHF fields + `onSubmit`
    - _Requirements: 3.5_
  - [x] 4.4 Create `src/modules/auth/hooks/useResetPasswordForm.ts` — accepts `token: string`, calls `useForm<ResetPasswordFormValues>({ resolver: yupResolver(resetPasswordSchema) })`, wraps `useResetPassword`, exposes standard RHF fields + `onSubmit`
    - _Requirements: 3.6_
  - [x] 4.5 Create `src/modules/auth/hooks/useUpdateProfileForm.ts` — calls `useForm<UpdateProfileFormValues>({ resolver: yupResolver(updateProfileSchema) })`, pre-populates defaults from auth store user via `reset()` in `useEffect`, wraps `useUpdateProfile`
    - _Requirements: 3.7, 3.8_

- [x] 5. Auth module — update page and view components
  - [x] 5.1 Update `LoginPage` (and its view component) to use `useLoginForm` instead of `useState`; pass `register`, `errors`, `onSubmit`, `isSubmitting` as props; render `<FormError message={errors.email?.message} />` and `<FormError message={errors.password?.message} />` beneath each field
    - _Requirements: 4.1, 4.5, 4.6, 10.1, 10.5_
  - [x] 5.2 Update `RegisterPage` (and its view component) to use `useRegisterForm`; drive password-mismatch display from `formState.errors.confirmPassword` instead of manual `useState` comparison
    - _Requirements: 4.2, 4.7, 10.1, 10.5_
  - [x] 5.3 Update `ForgotPasswordPage` (and its view component) to use `useForgotPasswordForm`
    - _Requirements: 4.3, 10.1, 10.5_
  - [x] 5.4 Update `ResetPasswordPage` (and its view component) to use `useResetPasswordForm`
    - _Requirements: 4.4, 10.1, 10.5_

- [x] 6. Checkpoint — auth module
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. User module — validation schemas
  - [x] 7.1 Create `src/modules/user/validation.ts` with `editProfileSchema`, `listProductSchema`, `requestProductSchema`, `manageListingSchema`, and `manageRequestSchema`; inferred types must align with existing interfaces in `src/modules/user/types.ts`
    - `editProfileSchema`: name (min 2) + email + phoneNumber (≥7 digit pattern)
    - `listProductSchema`: productName (min 3) + category (enum) + price (positive number string) + description (min 10) + email + phoneNo (≥7 digits)
    - `requestProductSchema`: name (min 3) + category (enum) + priceFrom (≥0) + priceTo (> priceFrom) + description (min 10) + email + phoneNo
    - `manageListingSchema`: same rules as `listProductSchema`
    - `manageRequestSchema`: same rules as `requestProductSchema`
    - _Requirements: 5.1–5.19_

  - [ ]* 7.2 Write property tests for user validation schemas
    - Create `src/modules/user/__tests__/validation.test.ts` using `fast-check` + `vitest`
    - **Property 6: List-product schema enforces all product field rules** — `fc.string()`, `fc.constantFrom(...LISTED_CATEGORIES)`, `fc.float({ min: 0.01 })` — **Validates: Requirements 5.5–5.10**
    - **Property 7: Request-product price range invariant** — `fc.integer({ min: 0 })`, `fc.integer({ min: 0 })` — **Validates: Requirements 5.13, 5.14**
    - Tag each test: `// Feature: frontend-form-validation, Property {N}: {property_text}`

- [x] 8. User module — form hooks
  - [x] 8.1 Create `src/modules/user/hooks/useEditProfileForm.ts` — calls `useForm<EditProfileForm>({ resolver: yupResolver(editProfileSchema) })`, pre-populates from auth store, wraps `useUpdateProfile`
    - _Requirements: 6.1, 6.6_
  - [x] 8.2 Create `src/modules/user/hooks/useListProductForm.ts` — calls `useForm<ListProductForm>({ resolver: yupResolver(listProductSchema) })`, wraps `useListProduct` mutation
    - _Requirements: 6.2, 6.6_
  - [x] 8.3 Create `src/modules/user/hooks/useRequestProductForm.ts` — calls `useForm<RequestProductForm>({ resolver: yupResolver(requestProductSchema) })`, wraps `useRequestProduct` mutation
    - _Requirements: 6.3, 6.6_
  - [x] 8.4 Create `src/modules/user/hooks/useManageListingForm.ts` — accepts `product: ListedProduct | undefined`, calls `useForm<ManageListingForm>({ resolver: yupResolver(manageListingSchema) })`, uses `reset()` in `useEffect` to pre-populate from product
    - _Requirements: 6.4, 6.6_
  - [x] 8.5 Create `src/modules/user/hooks/useManageRequestForm.ts` — accepts `request: RequestedProduct | undefined`, calls `useForm<ManageRequestForm>({ resolver: yupResolver(manageRequestSchema) })`, uses `reset()` in `useEffect` to pre-populate from request
    - _Requirements: 6.5, 6.6_

- [x] 9. User module — update page and view components
  - [x] 9.1 Update `EditProfilePage` (and its view component) to use `useEditProfileForm`; add `errors` prop typed as `FieldErrors<EditProfileForm>`; render `<FormError>` beneath each field
    - _Requirements: 7.1, 7.6, 7.7, 10.2, 10.5_
  - [x] 9.2 Update `ListProductPage` (and its view component) to use `useListProductForm`; add `errors` prop; render `<FormError>` beneath each field
    - _Requirements: 7.2, 7.6, 7.7, 10.2, 10.5_
  - [x] 9.3 Update `RequestProductPage` (and its view component) to use `useRequestProductForm`; add `errors` prop; render `<FormError>` beneath each field
    - _Requirements: 7.3, 7.6, 7.7, 10.2, 10.5_
  - [x] 9.4 Update `ManageListingPage` (and its view component) to use `useManageListingForm`; add `errors` prop; render `<FormError>` beneath each field
    - _Requirements: 7.4, 7.6, 7.7, 10.2, 10.5_
  - [x] 9.5 Update `ManageRequestPage` and `ManageRequestView` to use `useManageRequestForm`; change `ManageRequestView`'s `form` prop type from inline object literal to `ManageRequestForm` from `src/modules/user/types.ts`
    - _Requirements: 7.5, 7.6, 7.7, 8.4, 10.2, 10.5_

- [x] 10. Checkpoint — user module
  - Ensure all tests pass, ask the user if questions arise.

- [-] 11. Frontend TypeScript type fixes
  - [-] 11.1 Fix `src/modules/auth/hooks/useLogin.ts` — update `onSuccess` callback to destructure `{ user, accessToken, refreshToken }` from the response and call `setAuth(data.user, data.accessToken, data.refreshToken)` without an unsafe `as AuthUser` cast
    - _Requirements: 8.1, 8.2_
  - [ ] 11.2 Fix `src/modules/auth/hooks/useUpdateProfile.ts` — change `mutationFn` payload type from inline object literal to `UpdateProfilePayload` imported from `src/modules/auth/types.ts`
    - _Requirements: 8.3_
  - [ ]* 11.3 Write property test for `FormError` render behavior
    - Add to `src/modules/auth/__tests__/FormError.test.tsx`
    - **Property 8: FormError renders iff message is non-empty** — `fc.string({ minLength: 1 })`, `fc.constant(undefined)` — **Validates: Requirements 10.3, 10.4**

- [ ] 12. Backend TypeScript type fixes
  - [ ] 12.1 Scan and fix `src/backend/services/*.ts` — add explicit return type annotations where TypeScript infers `any`; no runtime logic changes
    - _Requirements: 9.1, 9.2, 9.3_
  - [ ] 12.2 Scan and fix `src/backend/lib/jwt.ts`, `src/backend/lib/db.ts`, `src/backend/lib/mailer.ts` — fully type all exported functions, remove implicit `any`, replace unsafe double-casts with narrowing guards where possible
    - _Requirements: 9.1, 9.2, 9.5, 9.6_
  - [ ] 12.3 Scan and fix `src/app/api/**/route.ts` — verify all handler signatures use `NextRequest`; add missing `NextResponse` return types; fix any `as unknown as X` patterns
    - _Requirements: 9.1, 9.2, 9.4, 9.6_
  - [ ] 12.4 Run `npx tsc --noEmit` and resolve any remaining type errors across `src/backend/` and `src/app/api/`; add `// TODO: runtime fix needed` comments where a type-only fix is not possible
    - _Requirements: 9.2, 9.7_

- [ ] 13. Checkpoint — TypeScript compilation clean
  - Ensure `npx tsc --noEmit` exits with zero errors, ask the user if questions arise.

- [ ] 14. Create Next.js architecture guide
  - Create `docs/nextjs-architecture-guide.md` with a table of contents and the following sections, each with inline code snippets referencing actual project files and "💡 Junior Dev Tip" callouts:
    - App Router structure: route groups, nested layouts, `page.tsx` conventions, URL mapping
    - Rendering strategies: Server Components, `'use client'`, `force-dynamic` — with real examples
    - Middleware (`src/middleware.ts`): CORS for `/api/*`, root redirect, `matcher` config
    - Route Handlers (`src/app/api/**/route.ts`): `withErrorHandler`, `sendSuccess`/`sendError`, request/response flow
    - Server Actions (`src/backend/actions/*.ts`): `'use server'`, difference from Route Handlers, `loginAction`/`registerAction`/`logoutAction`
    - Cookie-based auth flow: `setAuthCookies`, `authGuard.ts` + React `cache()`, axios 401 interceptor, Zustand `persist`
    - Image Optimization: `<Image>`, `remotePatterns`, vs plain `<img>`
    - Font Optimization: `next/font/google`, `display: 'swap'`, CSS variables
    - `loading.tsx` and `error.tsx` conventions with examples
    - Metadata API: `export const metadata`, title template, OpenGraph
    - React Query integration: `QueryClientProvider`, `useQuery`/`useMutation`, `queryKeys`, `dehydrate`/`HydrationBoundary`
    - Zustand state management: `createStore`, `createPersistedStore`, `auth.store.ts`
    - Axios client setup: `baseURL: '/'`, `withCredentials`, 401 interceptor, failed-request queue
    - Module architecture: `src/modules/{name}/` pattern, thin `page.tsx` wrappers
    - `next.config.ts` optimizations: `compress`, `output: 'standalone'`, `optimizePackageImports`, bundle analyzer
    - `Suspense` in `ProtectedLayout`: hydration pattern, `useState(false)` + `useEffect`
    - Project Flow Walkthrough: landing → login → protected page → data fetch → form submit → logout
  - _Requirements: 11.1–11.19_

- [ ] 15. Final checkpoint — all tests pass
  - Ensure all tests pass and `npx tsc --noEmit` exits clean, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All changes are type-layer and form-state only — no runtime logic, API contracts, or data transformations change
- If a type fix requires a runtime change, add `// TODO: runtime fix needed` and scope the fix to the type layer only
- Property tests use `fast-check` + `vitest --run` (already in devDependencies)
- Each property test must be tagged: `// Feature: frontend-form-validation, Property {N}: {property_text}`
