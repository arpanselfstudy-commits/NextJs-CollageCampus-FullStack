# Requirements Document

## Introduction

This feature introduces comprehensive frontend form validation across all form-bearing modules in the Next.js application. Every form will be migrated from uncontrolled `useState`-based inputs to React Hook Form with Yup schema validation. Each module will receive a dedicated `validation.ts` file containing its Yup schemas, and each module's hooks will own the React Hook Form logic. Additionally, all TypeScript type mismatches discovered during the scan will be corrected — both in frontend modules and across all backend files under `src/backend/`.

Modules in scope: `auth` (login, register, forgot-password, reset-password), `user` (edit-profile, list-product, request-product, manage-listing, manage-request).

---

## Global Constraint: No Functionality Changes

**Applies to all requirements (frontend and backend).**

All fixes and migrations in this spec — including form wiring, type annotation corrections, interface updates, and type assertion changes — MUST preserve existing runtime behavior exactly. No logic, control flow, API contracts, or data transformations may be altered as a side effect of these changes. The sole permitted modifications are:

- Replacing `useState`-based form state with React Hook Form
- Adding or correcting TypeScript type annotations, interface definitions, and type assertions
- Adding Yup validation schemas and wiring them to form hooks

If a fix would require changing runtime logic to satisfy the type system, the fix MUST be scoped to the type layer only (e.g. using a type assertion or interface adjustment) and flagged with a `// TODO: runtime fix needed` comment rather than silently altering behavior.

## Glossary

- **RHF**: React Hook Form — the form state management library used for all forms.
- **Yup**: Schema-based validation library used to define and enforce field rules.
- **Validation_Schema**: A Yup `ObjectSchema` that describes the shape and rules for a form.
- **Form_Hook**: A custom React hook (e.g. `useLoginForm`) that calls `useForm` with a Yup resolver and exposes `register`, `handleSubmit`, `formState`, and any derived helpers.
- **validation.ts**: A module-level file (e.g. `src/modules/auth/validation.ts`) that exports all Yup schemas for that module.
- **Type_Mismatch**: A TypeScript compile error or `ts(2352)` warning caused by incorrect type assertions or incompatible interface shapes.
- **Auth_Module**: `src/modules/auth/` — handles login, register, forgot-password, reset-password, and edit-profile.
- **User_Module**: `src/modules/user/` — handles list-product, request-product, manage-listing, and manage-request.
- **Form_Error**: An inline validation message rendered beneath a field when its Yup rule is violated.

---

## Requirements

### Requirement 1: Install and Configure React Hook Form and Yup

**User Story:** As a developer, I want React Hook Form and Yup available as project dependencies, so that all forms can use a consistent validation stack.

#### Acceptance Criteria

1. THE Project SHALL list `react-hook-form` and `yup` as runtime dependencies in `package.json`.
2. THE Project SHALL list `@hookform/resolvers` as a runtime dependency in `package.json` to bridge RHF with Yup.
3. WHEN `npm install` is run, THE Project SHALL resolve all three packages without peer-dependency conflicts.

---

### Requirement 2: Auth Module — Validation Schemas

**User Story:** As a developer, I want all auth form schemas defined in one place, so that validation rules are easy to find and update.

#### Acceptance Criteria

1. THE Auth_Module SHALL contain a file at `src/modules/auth/validation.ts` that exports Yup schemas.
2. THE `loginSchema` SHALL require `email` to be a non-empty, valid email string.
3. THE `loginSchema` SHALL require `password` to be a non-empty string with a minimum length of 6 characters.
4. THE `registerSchema` SHALL require `name` to be a non-empty string with a minimum length of 2 characters.
5. THE `registerSchema` SHALL require `email` to be a non-empty, valid email string.
6. THE `registerSchema` SHALL require `password` to be a non-empty string with a minimum length of 8 characters.
7. THE `registerSchema` SHALL require `confirmPassword` to match the `password` field exactly, using Yup's `oneOf` and `ref`.
8. THE `forgotPasswordSchema` SHALL require `email` to be a non-empty, valid email string.
9. THE `resetPasswordSchema` SHALL require `password` to be a non-empty string with a minimum length of 8 characters.
10. THE `resetPasswordSchema` SHALL require `confirmPassword` to match the `password` field exactly.
11. THE `updateProfileSchema` SHALL require `name` to be a non-empty string with a minimum length of 2 characters.
12. THE `updateProfileSchema` SHALL require `email` to be a non-empty, valid email string.
13. THE `updateProfileSchema` SHALL require `phoneNumber` to be a non-empty string matching a phone pattern of at least 7 digits.

---

### Requirement 3: Auth Module — Form Hooks

**User Story:** As a developer, I want each auth form to have a dedicated hook that owns RHF logic, so that page components stay thin and focused on rendering.

#### Acceptance Criteria

1. THE Auth_Module SHALL contain a hook `useLoginForm` in `src/modules/auth/hooks/useLoginForm.ts` that calls `useForm` with `yupResolver(loginSchema)`.
2. THE `useLoginForm` hook SHALL expose `register`, `handleSubmit`, `formState` (including `errors` and `isSubmitting`), and the `useLogin` mutation result.
3. THE Auth_Module SHALL contain a hook `useRegisterForm` in `src/modules/auth/hooks/useRegisterForm.ts` that calls `useForm` with `yupResolver(registerSchema)`.
4. THE `useRegisterForm` hook SHALL expose `register`, `handleSubmit`, `formState`, `watch` (for password confirmation UI), and the `useRegister` mutation result.
5. THE Auth_Module SHALL contain a hook `useForgotPasswordForm` in `src/modules/auth/hooks/useForgotPasswordForm.ts` that calls `useForm` with `yupResolver(forgotPasswordSchema)`.
6. THE Auth_Module SHALL contain a hook `useResetPasswordForm` in `src/modules/auth/hooks/useResetPasswordForm.ts` that accepts a `token` parameter and calls `useForm` with `yupResolver(resetPasswordSchema)`.
7. THE Auth_Module SHALL contain a hook `useUpdateProfileForm` in `src/modules/auth/hooks/useUpdateProfileForm.ts` that calls `useForm` with `yupResolver(updateProfileSchema)` and pre-populates default values from the current auth store user.
8. WHEN a form field fails Yup validation, THE Form_Hook SHALL surface the error message via `formState.errors[fieldName].message`.

---

### Requirement 4: Auth Module — Page Components Updated

**User Story:** As a user, I want to see inline validation errors on auth forms before submission, so that I can correct mistakes without a server round-trip.

#### Acceptance Criteria

1. THE `LoginPage` SHALL use `useLoginForm` instead of `useState` for form state.
2. THE `RegisterPage` SHALL use `useRegisterForm` instead of `useState` for form state.
3. THE `ForgotPasswordPage` SHALL use `useForgotPasswordForm` instead of `useState` for form state.
4. THE `ResetPasswordPage` SHALL use `useResetPasswordForm` instead of `useState` for form state.
5. WHEN a required field is left empty and the form is submitted, THE Form_Error SHALL display the Yup error message beneath the relevant input.
6. WHEN a field value violates a Yup rule (e.g. email format, password length), THE Form_Error SHALL display the specific error message inline.
7. THE `RegisterPage` password-mismatch indicator SHALL be driven by `formState.errors.confirmPassword` rather than a manual `useState` comparison.

---

### Requirement 5: User Module — Validation Schemas

**User Story:** As a developer, I want all user-module form schemas in one file, so that product and profile validation rules are co-located.

#### Acceptance Criteria

1. THE User_Module SHALL contain a file at `src/modules/user/validation.ts` that exports Yup schemas.
2. THE `editProfileSchema` SHALL require `name` to be a non-empty string with a minimum length of 2 characters.
3. THE `editProfileSchema` SHALL require `email` to be a non-empty, valid email string.
4. THE `editProfileSchema` SHALL require `phoneNumber` to be a non-empty string matching a phone pattern of at least 7 digits.
5. THE `listProductSchema` SHALL require `productName` to be a non-empty string with a minimum length of 3 characters.
6. THE `listProductSchema` SHALL require `category` to be one of the valid `ListedProductCategory` enum values.
7. THE `listProductSchema` SHALL require `price` to be a string representing a positive number greater than 0.
8. THE `listProductSchema` SHALL require `description` to be a non-empty string with a minimum length of 10 characters.
9. THE `listProductSchema` SHALL require `email` to be a non-empty, valid email string.
10. THE `listProductSchema` SHALL require `phoneNo` to be a non-empty string matching a phone pattern of at least 7 digits.
11. THE `requestProductSchema` SHALL require `name` to be a non-empty string with a minimum length of 3 characters.
12. THE `requestProductSchema` SHALL require `category` to be one of the valid `ListedProductCategory` enum values.
13. THE `requestProductSchema` SHALL require `priceFrom` to be a number greater than or equal to 0.
14. THE `requestProductSchema` SHALL require `priceTo` to be a number greater than `priceFrom`.
15. THE `requestProductSchema` SHALL require `description` to be a non-empty string with a minimum length of 10 characters.
16. THE `requestProductSchema` SHALL require `email` to be a non-empty, valid email string.
17. THE `requestProductSchema` SHALL require `phoneNo` to be a non-empty string matching a phone pattern of at least 7 digits.
18. THE `manageListingSchema` SHALL apply the same field rules as `listProductSchema` for all shared fields.
19. THE `manageRequestSchema` SHALL apply the same field rules as `requestProductSchema` for all shared fields.

---

### Requirement 6: User Module — Form Hooks

**User Story:** As a developer, I want each user-module form to have a dedicated hook, so that page components delegate all validation logic to hooks.

#### Acceptance Criteria

1. THE User_Module SHALL contain a hook `useEditProfileForm` in `src/modules/user/hooks/useEditProfileForm.ts` that calls `useForm` with `yupResolver(editProfileSchema)` and pre-populates defaults from the auth store.
2. THE User_Module SHALL contain a hook `useListProductForm` in `src/modules/user/hooks/useListProductForm.ts` that calls `useForm` with `yupResolver(listProductSchema)`.
3. THE User_Module SHALL contain a hook `useRequestProductForm` in `src/modules/user/hooks/useRequestProductForm.ts` that calls `useForm` with `yupResolver(requestProductSchema)`.
4. THE User_Module SHALL contain a hook `useManageListingForm` in `src/modules/user/hooks/useManageListingForm.ts` that accepts a `ListedProduct` and calls `useForm` with `yupResolver(manageListingSchema)`, pre-populating defaults from the product.
5. THE User_Module SHALL contain a hook `useManageRequestForm` in `src/modules/user/hooks/useManageRequestForm.ts` that accepts a `RequestedProduct` and calls `useForm` with `yupResolver(manageRequestSchema)`, pre-populating defaults from the request.
6. WHEN a form field fails Yup validation, THE Form_Hook SHALL surface the error message via `formState.errors[fieldName].message`.

---

### Requirement 7: User Module — Page Components Updated

**User Story:** As a user, I want to see inline validation errors on product and profile forms before submission, so that I can correct mistakes without a server round-trip.

#### Acceptance Criteria

1. THE `EditProfilePage` SHALL use `useEditProfileForm` instead of `useState` for form state.
2. THE `ListProductPage` SHALL use `useListProductForm` instead of `useState` for form state.
3. THE `RequestProductPage` SHALL use `useRequestProductForm` instead of `useState` for form state.
4. THE `ManageListingPage` SHALL use `useManageListingForm` instead of `useState` for form state.
5. THE `ManageRequestPage` SHALL use `useManageRequestForm` instead of `useState` for form state.
6. WHEN a required field is left empty and the form is submitted, THE Form_Error SHALL display the Yup error message beneath the relevant input.
7. WHEN a field value violates a Yup rule, THE Form_Error SHALL display the specific error message inline.

---

### Requirement 8: TypeScript Type Mismatch Fixes

**User Story:** As a developer, I want all TypeScript type errors in the frontend modules resolved, so that the project compiles cleanly without unsafe type assertions.

#### Acceptance Criteria

1. THE `useLogin` hook SHALL correctly type the `onSuccess` callback so that the resolved value is treated as `AuthUser` without an unsafe `as` cast.
2. WHEN the login API returns `{ user: AuthUser, accessToken: string, refreshToken: string }`, THE `useLogin` hook SHALL destructure the response and call `setAuth(data.user, data.accessToken, data.refreshToken)`.
3. THE `useUpdateProfile` mutation payload type SHALL match the `UpdateProfilePayload` interface defined in `src/modules/auth/types.ts` exactly.
4. THE `ManageRequestView` `form` prop type SHALL use the `ManageRequestForm` interface from `src/modules/user/types.ts` rather than an inline object literal type.
5. IF any module-level form state type diverges from its corresponding interface in `types.ts`, THEN THE module SHALL be updated to use the canonical interface type.

---

### Requirement 9: Backend TypeScript Type Fixes

**User Story:** As a developer, I want all TypeScript type errors in the backend resolved, so that the project compiles cleanly end-to-end without unsafe casts or implicit `any` types.

#### Acceptance Criteria

1. THE Backend SHALL be scanned across all files under `src/backend/` — including `services/`, `controllers/`, `middleware/`, `lib/`, and all API route handlers under `src/app/api/`.
2. WHEN a TypeScript type error is found in a backend file, THE Backend SHALL have the error corrected by updating type annotations, interface definitions, or type assertions only — no runtime logic may change.
3. THE Backend service functions SHALL have their parameter and return types explicitly annotated where TypeScript infers `any` or produces a type error.
4. THE Backend middleware functions SHALL have `Request`, `Response`, and `NextFunction` types (or their Next.js equivalents) correctly applied to all handler signatures.
5. THE Backend lib files (e.g. `src/backend/lib/jwt.ts`, `src/backend/lib/db.ts`, `src/backend/lib/mailer.ts`) SHALL have all exported functions fully typed with no implicit `any`.
6. IF a type assertion (e.g. `as SomeType`) in a backend file is unsafe or incorrect, THEN THE Backend SHALL replace it with a properly typed alternative or a narrowing guard.
7. THE Backend SHALL not introduce any new runtime dependencies or alter any existing function signatures as observed from call sites.

---

### Requirement 10: View Components — Error Display

**User Story:** As a user, I want validation errors to appear inline beneath each field, so that I know exactly which field needs correction.

#### Acceptance Criteria

1. THE Auth_Module view components SHALL render a `<FormError>` component beneath each field when `errors[fieldName]` is defined.
2. THE User_Module view components SHALL render an inline error `<p>` or `<FormError>` component beneath each field when `errors[fieldName]` is defined.
3. THE `FormError` component SHALL accept an optional `message` prop and render nothing when `message` is `undefined` or empty.
4. WHEN all fields are valid, THE Form_Error elements SHALL not be visible in the DOM.
5. THE view components SHALL accept an `errors` prop of type `FieldErrors` (from `react-hook-form`) so that error display is decoupled from form state management.

---

### Requirement 11: Project Documentation — Next.js Architecture & Patterns Guide

**User Story:** As a junior developer joining this project, I want a comprehensive, beginner-friendly markdown document that explains every Next.js feature and pattern used in this codebase, so that I can understand the architecture and implement features confidently without needing to ask senior developers.

#### Acceptance Criteria

1. THE Document SHALL be created at `docs/nextjs-architecture-guide.md` and written in beginner-friendly language with clear explanations, code examples from the actual project, and "why we use this" context for each concept.
2. THE Document SHALL cover the App Router structure used in this project — route groups `(auth)`, `(protected)`, `(swagger)`, nested layouts, `page.tsx` conventions, and how the folder structure maps to URLs.
3. THE Document SHALL explain the three rendering strategies used: Server Components (default), Client Components (`'use client'`), and `force-dynamic` pages — with real examples from the codebase and when to use each.
4. THE Document SHALL explain Next.js Middleware (`src/middleware.ts`) — what it does, how CORS is handled for `/api/*` routes, how the root redirect works, and the `matcher` config.
5. THE Document SHALL explain Route Handlers (`src/app/api/**/route.ts`) — how they work as the backend API layer, the `withErrorHandler` wrapper pattern, `sendSuccess`/`sendError` helpers, and the request/response flow.
6. THE Document SHALL explain Server Actions (`src/backend/actions/*.ts`) — the `'use server'` directive, how they differ from Route Handlers, when to use them, and the `loginAction`/`registerAction`/`logoutAction` examples.
7. THE Document SHALL explain the cookie-based authentication flow end-to-end: httpOnly cookies set via `setAuthCookies`, the `authGuard.ts` server-side token verification using React `cache()`, the client-side axios interceptor for silent token refresh, and the Zustand auth store with `persist` middleware.
8. THE Document SHALL explain Next.js Image Optimization — the `<Image>` component, `remotePatterns` config in `next.config.ts`, and why it's better than a plain `<img>` tag.
9. THE Document SHALL explain Next.js Font Optimization — how `Geist` and `Geist_Mono` are loaded via `next/font/google` with `display: 'swap'` and CSS variables in `src/app/layout.tsx`.
10. THE Document SHALL explain the `loading.tsx` and `error.tsx` conventions — how Next.js automatically shows them during navigation and on errors, with examples from `(protected)/jobs/loading.tsx` and `(protected)/error.tsx`.
11. THE Document SHALL explain the Metadata API — the `export const metadata` pattern, the title template `'%s | Campus App'`, and OpenGraph fields in `src/app/layout.tsx`.
12. THE Document SHALL explain the React Query integration — `QueryClientProvider` in `providers.tsx`, `useQuery`/`useMutation` hooks in module hooks, `queryKeys` structure, `staleTime`/`gcTime` config, and the `dehydrate`/`HydrationBoundary` pattern for SSR prefetching.
13. THE Document SHALL explain the Zustand state management — `createStore`, `createPersistedStore` with `persist` middleware, the `auth.store.ts` example, and how client components subscribe to store slices.
14. THE Document SHALL explain the axios client setup — `baseURL: '/'` hitting Next.js Route Handlers, `withCredentials: true` for cookie auth, the 401 interceptor for silent refresh, and the failed-request queue pattern.
15. THE Document SHALL explain the project's module architecture — the `src/modules/{name}/` pattern with `api/`, `components/`, `hooks/`, `pages/`, `types.ts` sub-structure, and how `page.tsx` files in `src/app/` are thin wrappers that import from modules.
16. THE Document SHALL explain the `next.config.ts` optimizations — `compress: true`, `output: 'standalone'`, `optimizePackageImports` for lucide-react, and the bundle analyzer setup.
17. THE Document SHALL explain the `Suspense` usage in `ProtectedLayout` — why it wraps the auth guard, how it works with `useRouter` and `useEffect` for client-side auth checks, and the hydration pattern with `useState(false)` + `useEffect`.
18. THE Document SHALL include a "Project Flow Walkthrough" section that traces a complete user journey: landing → login (cookie set) → protected page (auth guard check) → data fetch (React Query + axios → Route Handler → service → DB) → form submit (RHF + Yup → mutation → Route Handler) → logout (cookie cleared).
19. THE Document SHALL be structured with a table of contents, clear section headers, inline code snippets referencing actual project files, and "💡 Junior Dev Tip" callouts for common gotchas.
