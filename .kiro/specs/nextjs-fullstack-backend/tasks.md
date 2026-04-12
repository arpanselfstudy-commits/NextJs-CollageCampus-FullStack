# Implementation Plan: nextjs-fullstack-backend

## Overview

Migrate CollageCampus from a separate Express/MongoDB server to a fullstack Next.js 16 (App Router) application. All backend logic lives in `src/backend/` and is exposed via Next.js Route Handlers under `src/app/api/`. Tasks are ordered by dependency: foundation utilities first, then models, validators, services, API routes, server actions, query functions, and finally frontend wiring.

## Tasks

- [x] 1. Set up foundation: environment validation, DB singleton, and core error utilities
  - Create `src/backend/lib/env.ts` — validate and export all required env vars (`MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `NEXT_PUBLIC_APP_URL`); throw a descriptive error for any missing variable
  - Replace `src/backend/lib/db.ts` with a Mongoose singleton `connectDB()` that reuses an existing connection and throws `"MONGODB_URI is not defined"` when the env var is absent
  - Create `src/backend/lib/appError.ts` — `AppError` class extending `Error` with `statusCode`, `errorCode` (default `"ERROR"`), `isOperational = true`, and optional `details`
  - Create `src/backend/lib/withErrorHandler.ts` — `withErrorHandler(handler)` wrapper that catches `AppError` and unknown errors and returns the standard error envelope
  - Update `src/backend/lib/response.ts` — align `sendSuccess` / `sendError` signatures with the `{ code, success, message, data }` envelope defined in Requirement 19
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 24.1, 24.2, 25.1, 25.2, 25.3, 25.4, 19.1, 19.2, 19.3_

  - [ ]* 1.1 Write property test for `withErrorHandler` error envelope
    - **Property 6: withErrorHandler Error Envelope**
    - **Validates: Requirements 19.2, 19.3, 25.2, 25.3, 25.4**
    - Use `fast-check` to assert that for any `AppError(message, statusCode, errorCode)`, the wrapped handler returns `{ success: false, errorCode, data: null }` with HTTP status equal to `statusCode`; assert non-AppError throws produce status `500`

  - [ ]* 1.2 Write unit tests for `connectDB()`
    - Test: missing `MONGODB_URI` throws before connecting
    - Test: calling `connectDB()` twice reuses the existing connection
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Implement JWT utilities and cookie helpers
  - Create `src/backend/lib/jwt.ts` — `generateAccessToken(userId)` (signs with `JWT_ACCESS_SECRET`, expires `59m`), `generateRefreshToken(userId)` (signs with `JWT_REFRESH_SECRET`, expires `7d`), `hashToken(token)` (SHA-256 hex digest)
  - Create `src/backend/lib/cookies.ts` — `setAuthCookies(accessToken, refreshToken)` and `clearAuthCookies()` using Next.js `cookies()` API with `httpOnly`, `SameSite=Lax`, `Secure` (prod only), correct `maxAge` values
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 20.1, 20.2, 20.3, 20.4_

  - [ ]* 2.1 Write property test for JWT token round-trip
    - **Property 1: JWT Token Round-Trip**
    - **Validates: Requirements 3.1, 3.2**
    - Use `fast-check` with `fc.string({ minLength: 1 })` to assert `generateAccessToken(userId)` and `generateRefreshToken(userId)` both decode to `{ id: userId }` when verified with the correct secret

  - [ ]* 2.2 Write property test for `hashToken` determinism
    - **Property 2: Token Hash Determinism**
    - **Validates: Requirements 3.3**
    - Assert `hashToken(t) === hashToken(t)` for any string, and `hashToken(t1) !== hashToken(t2)` for any two distinct strings

- [x] 3. Implement validate and authorize helpers
  - Create `src/backend/lib/validate.ts` — `validate<T>(schema, data)` calls `schema.parse(data)`, catches `ZodError`, formats issues as `"path: message"` strings, and throws `AppError(400, "VALIDATION_ERROR", details)`
  - Create `src/backend/lib/authorize.ts` — `authorize(user, ...roles)` throws `AppError(401, "UNAUTHORIZED")` when user is null and `AppError(403, "FORBIDDEN")` when role is not in the allowed list
  - Install `zod` and `mongoose` and `bcryptjs` and `nodemailer` and `jsonwebtoken` as production dependencies; install `fast-check` and `vitest` and `@types/bcryptjs` and `@types/jsonwebtoken` and `@types/nodemailer` as dev dependencies
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 13.1, 13.2, 13.3_

  - [ ]* 3.1 Write property test for `validate` helper correctness
    - **Property 5: Validate Helper Correctness**
    - **Validates: Requirements 13.1, 13.2, 13.3**
    - Use `fast-check` to assert that for valid inputs `validate(schema, data)` returns the same result as `schema.parse(data)`, and for invalid inputs it throws `AppError` with `statusCode 400` and `errorCode "VALIDATION_ERROR"` containing at least one `details` string

- [x] 4. Implement mailer utility
  - Create `src/backend/lib/mailer.ts` — `sendResetPasswordEmail(email, token)` using `nodemailer` with env-configured SMTP transport; sends HTML email with reset link `{NEXT_PUBLIC_APP_URL}/reset-password/{token}`
  - _Requirements: 8.3_

- [x] 5. Implement all Mongoose models
  - Create `src/backend/models/user.model.ts` — `UserModel` with all fields from Requirement 2.1; use `mongoose.models.User ?? mongoose.model(...)` pattern
  - Create `src/backend/models/refreshToken.model.ts` — `RefreshTokenModel` with TTL index (`expireAfterSeconds: 0` on `expiresAt`) and index on `token`; Requirement 2.2
  - Create `src/backend/models/shop.model.ts` — `ShopModel` with `IDayTiming`, `IShopTiming`, `IOffer`, and `IContactDetails` sub-schemas; Requirement 2.3
  - Create `src/backend/models/job.model.ts` — `JobModel` with `JobType` enum, `ISalary` and `IContactDetails` sub-schemas; Requirement 2.4
  - Create `src/backend/models/listedProduct.model.ts` — `ListedProductModel` with `ProductCategory`, `ProductCondition` enums and `IContactDetails` sub-schema; Requirement 2.5
  - Create `src/backend/models/requestedProduct.model.ts` — `RequestedProductModel` with `ProductCategory` enum (re-exported from listedProduct), `IPriceRange` and `IContactDetails` sub-schemas; Requirement 2.6
  - Create `src/backend/models/cms.model.ts` — `CmsModel` with `CmsType` enum, unique `cmsId` and `type` fields, `isActive` default `true`; Requirement 2.7
  - Update `src/backend/types/backend.types.ts` — add all enums and interfaces (`IUser`, `IRefreshToken`, `IShop`, `IJob`, `IListedProduct`, `IRequestedProduct`, `ICms`, `IOffer`, `IShopTiming`, `IDayTiming`) as defined in the design document
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 6. Implement all Zod validator files
  - Create `src/backend/validators/auth.validator.ts` — `registerSchema`, `loginSchema`, `forgotPasswordSchema`, `resetPasswordSchema`, `updateProfileSchema`
  - Create `src/backend/validators/shop.validator.ts` — `dayTimingSchema`, `shopTimingSchema`, `createOfferSchema`, `updateOfferSchema`, `createShopSchema`, `updateShopSchema`, `listShopsQuerySchema`
  - Create `src/backend/validators/job.validator.ts` — `createJobSchema`, `updateJobSchema`, `listJobsQuerySchema`
  - Create `src/backend/validators/listedProduct.validator.ts` — `createListedProductSchema`, `updateListedProductSchema`, `listProductsQuerySchema`
  - Create `src/backend/validators/requestedProduct.validator.ts` — `createRequestedProductSchema`, `updateRequestedProductSchema`, `listRequestedProductsQuerySchema`
  - Create `src/backend/validators/cms.validator.ts` — `createCmsSchema`, `updateCmsSchema`
  - _Requirements: 4.1, 5.1, 10.3, 14.1, 15.1, 16.1, 17.1, 18.1_

- [x] 7. Implement auth service
  - Create `src/backend/services/auth.service.ts` with all six functions: `registerUser`, `loginUser`, `refreshUserToken`, `logoutUser`, `forgotPassword`, `resetPassword`, `updateProfile`
  - `registerUser`: check email uniqueness (throw `AppError 409 EMAIL_ALREADY_EXISTS`), hash password with bcrypt (10 rounds), persist and return user without password
  - `loginUser`: find user by email, compare password (throw `AppError 401 INVALID_CREDENTIALS` on mismatch), generate tokens, store `hashToken(refreshToken)` in `RefreshTokenModel` with 7-day expiry, return `{ accessToken, refreshToken, user }`
  - `refreshUserToken`: verify refresh JWT, look up `hashToken(token)` in `RefreshTokenModel` (throw `AppError 401 TOKEN_REUSE` and delete all user tokens if not found), rotate tokens, replace DB record, return new tokens
  - `logoutUser`: delete `RefreshTokenModel` record matching `hashToken(token)`
  - `forgotPassword`: find user by email (throw `AppError 404 USER_NOT_FOUND`), generate 32-byte hex token, store SHA-256 hash + 15-min expiry on user, call `sendResetPasswordEmail`, return plain token
  - `resetPassword`: find user by hashed token and non-expired `resetPasswordExpire` (throw `AppError 400 INVALID_OR_EXPIRED_TOKEN`), hash new password, clear token fields
  - `updateProfile`: check email uniqueness if changed (throw `AppError 409`), update and return user without password
  - _Requirements: 4.2, 4.3, 5.2, 5.3, 6.3, 6.4, 7.2, 8.1, 8.2, 9.1, 9.2, 9.3, 10.4_

  - [ ]* 7.1 Write property test for password hashing round-trip
    - **Property 3: Password Hashing Round-Trip**
    - **Validates: Requirements 4.3**
    - Use `fast-check` with `fc.string({ minLength: 6 })` to assert that after `registerUser()`, the stored `password` field does not equal the plaintext and `bcrypt.compare(plaintext, storedHash)` returns `true`

  - [ ]* 7.2 Write property test for login stores hashed refresh token
    - **Property 4: Login Stores Hashed Refresh Token**
    - **Validates: Requirements 5.3**
    - Assert that `loginUser()` returns a `refreshToken` and the `RefreshToken` collection contains a document where `token === hashToken(returnedRefreshToken)`

  - [ ]* 7.3 Write unit tests for auth service error paths
    - Test: `loginUser` with wrong email → `AppError 401 INVALID_CREDENTIALS`
    - Test: `loginUser` with wrong password → `AppError 401 INVALID_CREDENTIALS`
    - Test: `refreshUserToken` reuse detection → deletes all user tokens, throws `AppError 401 TOKEN_REUSE`
    - Test: `forgotPassword` unknown email → `AppError 404 USER_NOT_FOUND`
    - Test: `resetPassword` expired token → `AppError 400 INVALID_OR_EXPIRED_TOKEN`
    - _Requirements: 5.2, 6.3, 8.2, 9.2_

- [x] 8. Implement shop, job, and CMS services
  - Create `src/backend/services/shop.service.ts` — `createShop` (generate `shopId` as `"Shop-XXXX"`, generate `offerId`s for initial offers), `updateShop`, `deleteShop`, `getShops` (paginated, with `search`/`distance`/`openDay` filters), `getShopById` (throw `AppError 404 NOT_FOUND`), `addOffer` (generate `offerId` as `"Offer-XXXX"`), `updateOffer`, `deleteOffer`
  - Create `src/backend/services/job.service.ts` — `createJob` (generate `jobId` as `"Job-XXXX"`), `updateJob`, `deleteJob`, `getJobs` (paginated with all query filters from Requirement 15.1), `getJobById` (throw `AppError 404 NOT_FOUND`)
  - Create `src/backend/services/cms.service.ts` — `createCms` (uppercase `type`, check uniqueness throwing `AppError 409 CMS_TYPE_EXISTS`, generate `cmsId` as `"CMS-XXXX"`), `updateCms`, `deleteCms`, `getCmsByType` (throw `AppError 404 NOT_FOUND` if not found or inactive), `getAllCmsPages`
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 15.1, 15.2, 15.3, 15.4, 15.5, 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 9. Implement listed product and requested product services
  - Create `src/backend/services/listedProduct.service.ts` — `createListedProduct`, `getListedProducts` (paginated with all filters from Requirement 16.1, populate `user` with name and email), `getListedProductById` (populate `user`, throw `AppError 404`), `updateListedProduct` (enforce ownership — match `_id` and `user`), `deleteListedProduct` (enforce ownership)
  - Create `src/backend/services/requestedProduct.service.ts` — `createRequestedProduct`, `getRequestedProducts` (paginated with all filters from Requirement 17.1, populate `user`), `getRequestedProductById` (populate `user`, throw `AppError 404`), `updateRequestedProduct` (enforce ownership), `deleteRequestedProduct` (enforce ownership)
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

- [x] 10. Implement Auth Guard
  - Create `src/backend/lib/authGuard.ts` — `getAuthUser` wrapped in React `cache()`: reads `accessToken` cookie, verifies with `JWT_ACCESS_SECRET`, looks up user; on expiry falls back to `refreshToken` cookie and calls `refreshUserToken`; returns `null` on all failure paths
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 11. Implement auth API route handlers
  - Create `src/app/api/auth/register/route.ts` — `POST`: validate body with `registerSchema`, call `registerUser`, return `201` with user (no password); Requirement 4
  - Create `src/app/api/auth/login/route.ts` — `POST`: validate body with `loginSchema`, call `loginUser`, call `setAuthCookies`, return `200` with user; Requirements 5.1–5.6
  - Create `src/app/api/auth/logout/route.ts` — `POST`: read `refreshToken` cookie, call `logoutUser`, call `clearAuthCookies`, return `200`; Requirement 7
  - Create `src/app/api/auth/refresh/route.ts` — `POST`: read `refreshToken` cookie (return `401 INVALID_TOKEN` if absent), call `refreshUserToken`, call `setAuthCookies`, return `200`; Requirement 6
  - Create `src/app/api/auth/forgot-password/route.ts` — `POST`: validate body with `forgotPasswordSchema`, call `forgotPassword`, return `200`; Requirement 8
  - Create `src/app/api/auth/reset-password/[token]/route.ts` — `POST`: validate body with `resetPasswordSchema`, call `resetPassword(params.token, data.password)`, return `200`; Requirement 9
  - Create `src/app/api/auth/profile/route.ts` — `PATCH`: call `getAuthUser` (return `401` if null), validate body with `updateProfileSchema`, call `updateProfile`, return `200` with updated user; Requirement 10
  - Wrap all handlers with `withErrorHandler`
  - _Requirements: 4.1, 4.4, 4.5, 5.1, 5.4, 5.5, 5.6, 6.1, 6.2, 6.5, 7.1, 7.3, 7.4, 8.4, 9.4, 10.1, 10.2, 10.5_

  - [ ]* 11.1 Write unit tests for cookie attributes on login response
    - Test: after login, `Set-Cookie` headers contain `HttpOnly`, `SameSite=Lax`
    - Test: `Secure` flag is set only when `NODE_ENV === "production"`
    - _Requirements: 5.4, 5.5, 20.1, 20.2, 20.3_

- [x] 12. Implement shops API route handlers
  - Create `src/app/api/shops/route.ts` — `GET`: authenticate user, validate query with `listShopsQuerySchema`, call `getShops`, return paginated result; `POST`: authorize ADMIN, validate body with `createShopSchema`, call `createShop`, return `201`
  - Create `src/app/api/shops/[id]/route.ts` — `GET`: authenticate, call `getShopById`; `PUT`: authorize ADMIN, validate with `updateShopSchema`, call `updateShop`; `DELETE`: authorize ADMIN, call `deleteShop`, return `200 null`
  - Create `src/app/api/shops/[id]/offers/route.ts` — `POST`: authorize ADMIN, validate with `createOfferSchema`, call `addOffer`, return `201`
  - Create `src/app/api/shops/[id]/offers/[offerId]/route.ts` — `PUT`: authorize ADMIN, validate with `updateOfferSchema`, call `updateOffer`; `DELETE`: authorize ADMIN, call `deleteOffer`
  - Wrap all handlers with `withErrorHandler`
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8_

- [x] 13. Implement jobs API route handlers
  - Create `src/app/api/jobs/route.ts` — `GET`: authenticate, validate query with `listJobsQuerySchema`, call `getJobs`; `POST`: authorize ADMIN, validate with `createJobSchema`, call `createJob`, return `201`
  - Create `src/app/api/jobs/[id]/route.ts` — `GET`: authenticate, call `getJobById`; `PUT`: authorize ADMIN, validate with `updateJobSchema`, call `updateJob`; `DELETE`: authorize ADMIN, call `deleteJob`, return `200 null`
  - Wrap all handlers with `withErrorHandler`
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 14. Implement listed products API route handlers
  - Create `src/app/api/listed-products/route.ts` — `GET`: authenticate, validate query with `listProductsQuerySchema`, call `getListedProducts` (with populated user); `POST`: authorize USER, validate with `createListedProductSchema`, call `createListedProduct`, return `201`
  - Create `src/app/api/listed-products/my-products/route.ts` — `GET`: authenticate, return products filtered by `user === req.user._id`
  - Create `src/app/api/listed-products/[id]/route.ts` — `GET`: authenticate, call `getListedProductById`; `PUT`: authorize USER, validate with `updateListedProductSchema`, call `updateListedProduct` (ownership enforced in service); `DELETE`: authorize USER, call `deleteListedProduct` (ownership enforced)
  - Wrap all handlers with `withErrorHandler`
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_

- [x] 15. Implement requested products API route handlers
  - Create `src/app/api/requested-products/route.ts` — `GET`: authenticate, validate query with `listRequestedProductsQuerySchema`, call `getRequestedProducts`; `POST`: authorize USER, validate with `createRequestedProductSchema`, call `createRequestedProduct`, return `201`
  - Create `src/app/api/requested-products/my-requests/route.ts` — `GET`: authenticate, return requests filtered by `user === req.user._id`
  - Create `src/app/api/requested-products/[id]/route.ts` — `GET`: authenticate, call `getRequestedProductById`; `PUT`: authorize USER, validate with `updateRequestedProductSchema`, call `updateRequestedProduct`; `DELETE`: authorize USER, call `deleteRequestedProduct`
  - Wrap all handlers with `withErrorHandler`
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

- [x] 16. Implement CMS API route handlers
  - Create `src/app/api/cms/route.ts` — `GET`: no auth required, call `getAllCmsPages`, return sorted by `type`; `POST`: authorize ADMIN, validate with `createCmsSchema`, call `createCms`, return `201`
  - Create `src/app/api/cms/[type]/route.ts` — `GET`: no auth required, call `getCmsByType(params.type.toUpperCase())`; `PUT`: authorize ADMIN, validate with `updateCmsSchema`, call `updateCms`; `DELETE`: authorize ADMIN, call `deleteCms`
  - Wrap all handlers with `withErrorHandler`
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

  - [ ]* 16.1 Write integration test for CMS public routes
    - Test: unauthenticated `GET /api/cms` returns `200`
    - Test: unauthenticated `GET /api/cms/[type]` returns `200` for active type
    - Test: USER role `POST /api/cms` returns `403 FORBIDDEN`
    - _Requirements: 18.1, 18.2_

- [x] 17. Checkpoint — Ensure all API routes and services pass tests
  - Ensure all tests pass, ask the user if questions arise.

- [x] 18. Implement server actions
  - Create `src/backend/actions/auth.actions.ts` — `"use server"` file with `loginAction(formData)`, `registerAction(formData)`, `logoutAction()`, `updateProfileAction(formData)`; each action calls the corresponding service, manages cookies via `setAuthCookies`/`clearAuthCookies`, and returns `{ success, error?, user? }` without throwing on validation failure
  - Create `src/backend/actions/listedProduct.actions.ts` — `"use server"` file with `createListedProductAction(formData)` that validates input, calls `createListedProduct`, returns `{ success, error?, product? }`
  - Create `src/backend/actions/requestedProduct.actions.ts` — `"use server"` file with `createRequestedProductAction(formData)` that validates input, calls `createRequestedProduct`, returns `{ success, error?, request? }`
  - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7_

  - [ ]* 18.1 Write property test for server action never-throw on validation failure
    - **Property 7: Server Action Never Throws on Validation Failure**
    - **Validates: Requirements 21.7**
    - Use `fast-check` to assert that for any `FormData` with invalid fields, `loginAction`, `registerAction`, `updateProfileAction`, `createListedProductAction`, and `createRequestedProductAction` all return `{ success: false, error: string }` without throwing

- [x] 19. Implement query functions for server components
  - Create `src/backend/queries/shop.queries.ts` — `getShops` and `getShopById` wrapped in `cache()`, each calling `connectDB()` then the corresponding service function
  - Create `src/backend/queries/job.queries.ts` — `getJobs` and `getJobById` wrapped in `cache()`
  - Create `src/backend/queries/listedProduct.queries.ts` — `getListedProducts`, `getListedProductById`, and `getMyListedProducts` wrapped in `cache()`
  - Create `src/backend/queries/requestedProduct.queries.ts` — `getRequestedProducts`, `getRequestedProductById`, and `getMyRequestedProducts` wrapped in `cache()`
  - Create `src/backend/queries/cms.queries.ts` — `getAllCmsPages` and `getCmsByType` wrapped in `cache()`
  - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_

- [x] 20. Migrate axios client
  - Locate the existing `axiosClient` file (likely `src/lib/axiosClient.ts` or similar) and update: set `baseURL: '/'`, set `withCredentials: true`, remove `Authorization: Bearer` header injection from the request interceptor, update the 401 response interceptor to call `POST /api/auth/refresh` without a body and then retry the original request, and on refresh failure clear the Zustand auth store and redirect to `/login`
  - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5_

  - [ ]* 20.1 Write unit tests for axios client configuration
    - Test: `axiosClient` has `withCredentials: true`
    - Test: `axiosClient` base URL is `/`
    - Test: request interceptor does not inject `Authorization` header
    - _Requirements: 23.1, 23.2, 23.4_

- [x] 21. Update frontend pages to use server components and server actions
  - Update `src/app/(protected)/shops/page.tsx` — convert to async server component, call `getShops` query function directly instead of axios; pass data as props to client sub-components
  - Update `src/app/(protected)/shops/[id]/page.tsx` — convert to async server component, call `getShopById`
  - Update `src/app/(protected)/jobs/page.tsx` — convert to async server component, call `getJobs`
  - Update `src/app/(protected)/jobs/[id]/page.tsx` — convert to async server component, call `getJobById`
  - Update `src/app/(protected)/marketplace/page.tsx` — convert to async server component, call `getListedProducts`
  - Update `src/app/(protected)/marketplace/[id]/page.tsx` — convert to async server component, call `getListedProductById`
  - Update `src/app/(protected)/marketplace/request/[id]/page.tsx` — convert to async server component, call `getRequestedProductById`
  - Update `src/app/(auth)/login/page.tsx` — wire `loginAction` server action to the login form
  - Update `src/app/(auth)/register/page.tsx` — wire `registerAction` server action to the register form
  - Update `src/app/(protected)/account/list-product/page.tsx` — wire `createListedProductAction`
  - Update `src/app/(protected)/account/request-product/page.tsx` — wire `createRequestedProductAction`
  - Update `src/app/(protected)/account/edit-profile/page.tsx` — wire `updateProfileAction`
  - Add redirect to `/login` in server components when `getAuthUser()` returns `null` for protected pages
  - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 21.1, 21.2, 21.4, 21.5, 21.6_

- [x] 22. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Install required packages before starting: `npm install zod mongoose bcryptjs nodemailer jsonwebtoken` and `npm install --save-dev fast-check vitest @types/bcryptjs @types/jsonwebtoken @types/nodemailer`
- Each task references specific requirements for traceability
- Property tests use `fast-check` with a minimum of 100 iterations; tag format: `// Feature: nextjs-fullstack-backend, Property N: <text>`
- The `mongoose.models.X ?? mongoose.model(...)` pattern is required in every model file to prevent hot-reload errors
- Server actions must never throw to the caller — always return `{ success: false, error: string }` on failure
- CMS `GET` routes are public (no auth required); all write routes require ADMIN role
- Ownership enforcement for listed/requested products is handled inside the service layer, not the route handler
