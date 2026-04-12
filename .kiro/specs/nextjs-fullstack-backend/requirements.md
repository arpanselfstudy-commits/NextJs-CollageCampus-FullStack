# Requirements Document

## Introduction

This feature integrates a complete fullstack backend into the existing Next.js (App Router) application, replacing the separate Express/MongoDB server. The backend logic — authentication, shops, jobs, marketplace listings, requested products, and CMS — is reimplemented inside `src/backend/` and exposed via Next.js API Route Handlers under `src/app/api/`. The existing frontend pages and modules retain their current functionality; only the data layer is rewired. The implementation follows Next.js best practices: httpOnly cookies for token storage, server components as the default rendering strategy, server actions for form submissions, and React `cache()` for deduplication of server-side data fetching.

---

## Glossary

- **System**: The Next.js fullstack application (CollageCampus App)
- **API_Layer**: The Next.js Route Handlers located in `src/app/api/`
- **Backend_Layer**: The service, repository, and model code located in `src/backend/`
- **Auth_Service**: The backend service responsible for registration, login, logout, token refresh, and password reset
- **Token_Store**: The MongoDB `RefreshToken` collection managed by the Backend_Layer
- **Access_Token**: A short-lived JWT (59 minutes) used to authenticate API requests
- **Refresh_Token**: A long-lived JWT (7 days) used to obtain new Access_Tokens; stored as a SHA-256 hash in the Token_Store
- **Cookie_Store**: The browser's httpOnly, Secure, SameSite=Lax cookie jar where the System stores tokens
- **Auth_Guard**: The server-side session validation logic that reads tokens from the Cookie_Store
- **ADMIN**: A user with the `ADMIN` role, permitted to write shops, jobs, offers, and CMS content
- **USER**: A user with the `USER` role (default), permitted to write their own listed and requested products
- **Validator**: The Zod schema validation layer applied before any write operation
- **Mongoose_Client**: The singleton Mongoose connection managed in `src/backend/lib/db.ts`
- **Server_Action**: A Next.js server action (`"use server"`) used for form submissions
- **Server_Component**: A React Server Component that fetches data directly on the server without a client-side API call
- **AppError**: A typed operational error class carrying `statusCode`, `errorCode`, and optional `details`

---

## Requirements

### Requirement 1: Database Connection

**User Story:** As a developer, I want a singleton Mongoose connection, so that the application does not exhaust MongoDB connections during hot reloads or concurrent requests.

#### Acceptance Criteria

1. THE Mongoose_Client SHALL connect to MongoDB using the `MONGODB_URI` environment variable on first use.
2. WHILE a Mongoose connection is already established, THE Mongoose_Client SHALL reuse the existing connection without creating a new one.
3. IF the `MONGODB_URI` environment variable is not set, THEN THE Mongoose_Client SHALL throw an error with the message `"MONGODB_URI is not defined"` before attempting to connect.
4. IF the MongoDB connection attempt fails, THEN THE Mongoose_Client SHALL propagate the error to the caller.

---

### Requirement 2: Mongoose Models

**User Story:** As a developer, I want all domain models defined as Mongoose schemas, so that data is validated and typed at the database layer.

#### Acceptance Criteria

1. THE Backend_Layer SHALL define a `User` model with fields: `name` (string, required), `email` (string, required, unique), `password` (string, required), `role` (enum: `ADMIN` | `USER`, default `USER`), `phoneNumber` (string, optional), `photo` (string, optional), `resetPasswordToken` (string, optional), `resetPasswordExpire` (Date, optional), and automatic `createdAt`/`updatedAt` timestamps.
2. THE Backend_Layer SHALL define a `RefreshToken` model with fields: `userId` (ObjectId ref `User`, required), `token` (string, required, indexed), `expiresAt` (Date, required, TTL index with `expireAfterSeconds: 0`), `deviceInfo` (object with optional `ip` and `name` strings), and automatic `createdAt` timestamp.
3. THE Backend_Layer SHALL define a `Shop` model with all required sub-schemas (`IDayTiming`, `IContactDetails`, `IOffer`, `IShopTiming`) and fields matching the backend documentation, including automatic timestamps.
4. THE Backend_Layer SHALL define a `Job` model with `JobType` enum (`part-time` | `full-time`), sub-schemas (`IContactDetails`, `ISalary`), and all required fields with automatic timestamps.
5. THE Backend_Layer SHALL define a `ListedProduct` model with `ProductCategory` and `ProductCondition` enums, `IContactDetails` sub-schema, and all required fields with automatic timestamps.
6. THE Backend_Layer SHALL define a `RequestedProduct` model with `ProductCategory` enum (re-exported from `ListedProduct`), `IContactDetails` and `IPriceRange` sub-schemas, and all required fields with automatic timestamps.
7. THE Backend_Layer SHALL define a `Cms` model with `CmsType` enum (`TERMS_AND_CONDITIONS` | `PRIVACY_POLICY` | `ABOUT_US` | `FAQ`), and fields: `cmsId` (string, required, unique), `type` (string, required, unique, uppercase), `title` (string, required), `content` (string, required), `isActive` (boolean, default `true`), and automatic timestamps.

---

### Requirement 3: JWT Configuration and Token Utilities

**User Story:** As a developer, I want centralized JWT signing and hashing utilities, so that token generation is consistent and secure across all auth operations.

#### Acceptance Criteria

1. THE Backend_Layer SHALL provide a `generateAccessToken(userId)` function that signs a JWT with `JWT_ACCESS_SECRET` expiring in `59m`.
2. THE Backend_Layer SHALL provide a `generateRefreshToken(userId)` function that signs a JWT with `JWT_REFRESH_SECRET` expiring in `7d`.
3. THE Backend_Layer SHALL provide a `hashToken(token)` function that returns the SHA-256 hex digest of the input token.
4. IF `JWT_ACCESS_SECRET` or `JWT_REFRESH_SECRET` environment variables are not set, THEN THE Backend_Layer SHALL throw an error before signing any token.

---

### Requirement 4: Authentication — Register

**User Story:** As a visitor, I want to register a new account, so that I can access the protected areas of the application.

#### Acceptance Criteria

1. WHEN a `POST /api/auth/register` request is received with a valid body, THE API_Layer SHALL validate the body against the `registerSchema` (name min 3, email valid, password min 6) using the Validator.
2. IF the email is already registered, THEN THE Auth_Service SHALL throw an AppError with status `409` and errorCode `EMAIL_ALREADY_EXISTS`.
3. WHEN registration succeeds, THE Auth_Service SHALL hash the password with bcrypt (salt rounds: 10) before persisting the User document.
4. WHEN registration succeeds, THE API_Layer SHALL return a `201` response containing the created user object (excluding the password field).
5. IF validation fails, THEN THE API_Layer SHALL return a `400` response with errorCode `VALIDATION_ERROR` and an array of field-level error details.

---

### Requirement 5: Authentication — Login

**User Story:** As a registered user, I want to log in, so that I receive tokens that grant me access to protected resources.

#### Acceptance Criteria

1. WHEN a `POST /api/auth/login` request is received with a valid body, THE API_Layer SHALL validate the body against the `loginSchema` (email valid, password non-empty).
2. IF the email is not found or the password does not match, THEN THE Auth_Service SHALL throw an AppError with status `401` and errorCode `INVALID_CREDENTIALS`.
3. WHEN login succeeds, THE Auth_Service SHALL generate an Access_Token and a Refresh_Token, store the SHA-256 hash of the Refresh_Token in the Token_Store with a 7-day expiry, and return `{ accessToken, refreshToken, user }`.
4. WHEN login succeeds, THE API_Layer SHALL set the Access_Token in an httpOnly cookie named `accessToken` (Max-Age: 3540 seconds, Path: `/`, SameSite: Lax, Secure in production).
5. WHEN login succeeds, THE API_Layer SHALL set the Refresh_Token in an httpOnly cookie named `refreshToken` (Max-Age: 604800 seconds, Path: `/`, SameSite: Lax, Secure in production).
6. WHEN login succeeds, THE API_Layer SHALL return a `200` response containing the user object.

---

### Requirement 6: Authentication — Token Refresh

**User Story:** As an authenticated user, I want my session to be silently renewed, so that I am not logged out while actively using the application.

#### Acceptance Criteria

1. WHEN a `POST /api/auth/refresh` request is received, THE API_Layer SHALL read the Refresh_Token from the `refreshToken` httpOnly cookie.
2. IF the `refreshToken` cookie is absent or the JWT signature is invalid, THEN THE API_Layer SHALL return a `401` response with errorCode `INVALID_TOKEN`.
3. IF the hashed Refresh_Token is not found in the Token_Store (reuse detection), THEN THE Auth_Service SHALL delete all Token_Store records for that user and THE API_Layer SHALL return a `401` response with errorCode `TOKEN_REUSE`.
4. WHEN the Refresh_Token is valid, THE Auth_Service SHALL generate new Access_Token and Refresh_Token, replace the old Token_Store record with the new hash, and return the new tokens.
5. WHEN refresh succeeds, THE API_Layer SHALL update both httpOnly cookies with the new tokens and return a `200` response.

---

### Requirement 7: Authentication — Logout

**User Story:** As an authenticated user, I want to log out, so that my session is invalidated on the server and my cookies are cleared.

#### Acceptance Criteria

1. WHEN a `POST /api/auth/logout` request is received, THE API_Layer SHALL read the Refresh_Token from the `refreshToken` httpOnly cookie.
2. WHEN the Refresh_Token is present, THE Auth_Service SHALL delete the corresponding hashed record from the Token_Store.
3. WHEN logout completes, THE API_Layer SHALL clear both the `accessToken` and `refreshToken` cookies and return a `200` response.
4. IF the `refreshToken` cookie is absent, THE API_Layer SHALL still clear any existing cookies and return a `200` response.

---

### Requirement 8: Authentication — Forgot Password

**User Story:** As a user who has forgotten their password, I want to receive a reset link by email, so that I can regain access to my account.

#### Acceptance Criteria

1. WHEN a `POST /api/auth/forgot-password` request is received with a valid email, THE Auth_Service SHALL generate a 32-byte random hex token, store its SHA-256 hash in `user.resetPasswordToken` with a 15-minute expiry in `user.resetPasswordExpire`, and send a reset email via the mailer utility.
2. IF the email is not found, THEN THE Auth_Service SHALL throw an AppError with status `404` and errorCode `USER_NOT_FOUND`.
3. THE mailer utility SHALL send an HTML email to the user with a reset link in the format `{NEXT_PUBLIC_APP_URL}/reset-password/{token}`.
4. WHEN the email is sent successfully, THE API_Layer SHALL return a `200` response (the plain reset token SHALL NOT be included in the response body in production).

---

### Requirement 9: Authentication — Reset Password

**User Story:** As a user with a valid reset token, I want to set a new password, so that I can log back into my account.

#### Acceptance Criteria

1. WHEN a `POST /api/auth/reset-password/[token]` request is received, THE Auth_Service SHALL find the user whose `resetPasswordToken` matches the SHA-256 hash of the URL token AND whose `resetPasswordExpire` is greater than the current time.
2. IF no matching user is found, THEN THE Auth_Service SHALL throw an AppError with status `400` and errorCode `INVALID_OR_EXPIRED_TOKEN`.
3. WHEN the token is valid, THE Auth_Service SHALL hash the new password with bcrypt (salt rounds: 10), save it, and clear `resetPasswordToken` and `resetPasswordExpire`.
4. WHEN reset succeeds, THE API_Layer SHALL return a `200` response.

---

### Requirement 10: Authentication — Update Profile

**User Story:** As an authenticated user, I want to update my profile information, so that my account details stay current.

#### Acceptance Criteria

1. WHEN a `PATCH /api/auth/profile` request is received, THE Auth_Guard SHALL verify the Access_Token from the `accessToken` httpOnly cookie and attach the authenticated user to the request context.
2. IF the Access_Token is absent or invalid, THEN THE Auth_Guard SHALL return a `401` response with errorCode `UNAUTHORIZED`.
3. WHEN the token is valid, THE API_Layer SHALL validate the body against `updateProfileSchema` (name min 3, email valid, phoneNumber min 10, photo URL or empty string — all optional).
4. IF the new email is already in use by a different user, THEN THE Auth_Service SHALL throw an AppError with status `409` and errorCode `EMAIL_ALREADY_EXISTS`.
5. WHEN update succeeds, THE API_Layer SHALL return a `200` response with the updated user object (excluding password).

---

### Requirement 11: Auth Guard (Server-Side Session Validation)

**User Story:** As a developer, I want a reusable server-side auth guard, so that protected API routes and server components can verify the current session without duplicating logic.

#### Acceptance Criteria

1. THE Auth_Guard SHALL read the `accessToken` value from the Next.js `cookies()` API (server-side only).
2. WHEN the Access_Token is present and valid, THE Auth_Guard SHALL verify it with `JWT_ACCESS_SECRET`, look up the user by the decoded `id`, and return the user object.
3. IF the Access_Token is expired, THE Auth_Guard SHALL attempt a silent refresh using the `refreshToken` cookie, update both cookies with the new tokens, and return the refreshed user.
4. IF both tokens are absent or invalid, THE Auth_Guard SHALL return `null` (callers decide whether to redirect or return 401).
5. THE Auth_Guard SHALL be wrapped with React `cache()` so that multiple server components in the same request share a single DB lookup.

---

### Requirement 12: Role-Based Access Control Middleware

**User Story:** As a developer, I want a reusable authorization helper, so that API routes can enforce role requirements with a single call.

#### Acceptance Criteria

1. THE Backend_Layer SHALL provide an `authorize(...roles)` helper that accepts the result of Auth_Guard and a list of allowed roles.
2. IF the user is not authenticated, THEN THE authorize helper SHALL throw an AppError with status `401` and errorCode `UNAUTHORIZED`.
3. IF the user's role is not in the allowed roles list, THEN THE authorize helper SHALL throw an AppError with status `403` and errorCode `FORBIDDEN`.
4. WHEN the user's role is authorized, THE authorize helper SHALL return the user object to the caller.

---

### Requirement 13: Zod Validation Utility

**User Story:** As a developer, I want a reusable Zod validation helper for API route handlers, so that input validation is consistent and produces structured error responses.

#### Acceptance Criteria

1. THE Backend_Layer SHALL provide a `validate(schema, data)` function that calls `schema.parse(data)`.
2. IF a `ZodError` is thrown, THEN THE validate function SHALL format all issues as `"path: message"` strings and throw an AppError with status `400`, errorCode `VALIDATION_ERROR`, and the formatted issues array as `details`.
3. WHEN validation succeeds, THE validate function SHALL return the parsed (and coerced) data.

---

### Requirement 14: Shops API

**User Story:** As an authenticated user, I want to browse shops; as an ADMIN, I want to manage shops and their offers, so that the campus shop directory stays up to date.

#### Acceptance Criteria

1. WHEN a `GET /api/shops` request is received with a valid Access_Token, THE API_Layer SHALL return a paginated list of shops supporting query parameters: `page`, `limit`, `search` (regex on `name`, `topItems`, `allItems`), `distance` (exact match), and `openDay` (filters by `shopTiming.{day}.isOpen = true`).
2. WHEN a `GET /api/shops/[id]` request is received with a valid Access_Token, THE API_Layer SHALL return the shop document or a `404` AppError if not found.
3. WHEN a `POST /api/shops` request is received, THE API_Layer SHALL require ADMIN role, validate the body against `createShopSchema`, generate a unique `shopId` in the format `"Shop-XXXX"`, generate unique `offerId`s for any provided offers, and return the created shop with status `201`.
4. WHEN a `PUT /api/shops/[id]` request is received, THE API_Layer SHALL require ADMIN role, validate the body against `updateShopSchema` (all fields optional), and return the updated shop.
5. WHEN a `DELETE /api/shops/[id]` request is received, THE API_Layer SHALL require ADMIN role and return a `200` response with `null` data.
6. WHEN a `POST /api/shops/[id]/offers` request is received, THE API_Layer SHALL require ADMIN role, validate against `createOfferSchema`, generate a unique `offerId` in the format `"Offer-XXXX"`, push the offer to the shop's `offers` array, and return the updated shop with status `201`.
7. WHEN a `PUT /api/shops/[id]/offers/[offerId]` request is received, THE API_Layer SHALL require ADMIN role, validate against `updateOfferSchema`, find the offer by `offerId`, merge the new data, and return the updated shop.
8. WHEN a `DELETE /api/shops/[id]/offers/[offerId]` request is received, THE API_Layer SHALL require ADMIN role, remove the offer from the array, and return a `200` response.

---

### Requirement 15: Jobs API

**User Story:** As an authenticated user, I want to browse job listings; as an ADMIN, I want to manage job postings, so that students can find relevant opportunities.

#### Acceptance Criteria

1. WHEN a `GET /api/jobs` request is received with a valid Access_Token, THE API_Layer SHALL return a paginated list of jobs supporting query parameters: `page`, `limit`, `search` (regex on `jobName`, `jobProvider`), `jobType` (exact match), `minExperience`, `maxExperience`, `minSalary`, `maxSalary`, `deadlineFrom`, `deadlineTo`.
2. WHEN a `GET /api/jobs/[id]` request is received with a valid Access_Token, THE API_Layer SHALL return the job document or a `404` AppError if not found.
3. WHEN a `POST /api/jobs` request is received, THE API_Layer SHALL require ADMIN role, validate against `createJobSchema`, generate a unique `jobId` in the format `"Job-XXXX"`, and return the created job with status `201`.
4. WHEN a `PUT /api/jobs/[id]` request is received, THE API_Layer SHALL require ADMIN role, validate against `updateJobSchema`, and return the updated job.
5. WHEN a `DELETE /api/jobs/[id]` request is received, THE API_Layer SHALL require ADMIN role and return a `200` response with `null` data.

---

### Requirement 16: Listed Products API

**User Story:** As an authenticated user, I want to browse listed products; as a USER, I want to list, update, and remove my own products, so that I can participate in the campus marketplace.

#### Acceptance Criteria

1. WHEN a `GET /api/listed-products` request is received with a valid Access_Token, THE API_Layer SHALL return a paginated list supporting query parameters: `page`, `limit`, `search` (regex on `productName`), `category`, `condition`, `minPrice`, `maxPrice`, `minYearUsed`, `maxYearUsed`; each product SHALL include the populated `user` field (name and email only).
2. WHEN a `GET /api/listed-products/my-products` request is received, THE API_Layer SHALL return only the products belonging to the authenticated user.
3. WHEN a `GET /api/listed-products/[id]` request is received with a valid Access_Token, THE API_Layer SHALL return the product with populated `user` field or a `404` AppError if not found.
4. WHEN a `POST /api/listed-products` request is received, THE API_Layer SHALL require USER role, validate against `createListedProductSchema`, set `user` to the authenticated user's ID, and return the created product with status `201`.
5. WHEN a `PUT /api/listed-products/[id]` request is received, THE API_Layer SHALL require USER role, validate against `updateListedProductSchema`, enforce ownership (match both `_id` and `user`), and return the updated product.
6. WHEN a `DELETE /api/listed-products/[id]` request is received, THE API_Layer SHALL require USER role, enforce ownership, and return a `200` response with `null` data.

---

### Requirement 17: Requested Products API

**User Story:** As an authenticated user, I want to browse product requests; as a USER, I want to post, update, and remove my own requests, so that I can find products I need from other students.

#### Acceptance Criteria

1. WHEN a `GET /api/requested-products` request is received with a valid Access_Token, THE API_Layer SHALL return a paginated list supporting query parameters: `page`, `limit`, `search` (regex on `name`, `category`), `category`, `isNegotiable` (string `"true"`/`"false"` converted to boolean), `isFulfilled`, `minPrice`, `maxPrice`; each product SHALL include the populated `user` field.
2. WHEN a `GET /api/requested-products/my-requests` request is received, THE API_Layer SHALL return only the requests belonging to the authenticated user.
3. WHEN a `GET /api/requested-products/[id]` request is received with a valid Access_Token, THE API_Layer SHALL return the request with populated `user` field or a `404` AppError if not found.
4. WHEN a `POST /api/requested-products` request is received, THE API_Layer SHALL require USER role, validate against `createRequestedProductSchema`, set `user` to the authenticated user's ID, and return the created request with status `201`.
5. WHEN a `PUT /api/requested-products/[id]` request is received, THE API_Layer SHALL require USER role, validate against `updateRequestedProductSchema`, enforce ownership, and return the updated request.
6. WHEN a `DELETE /api/requested-products/[id]` request is received, THE API_Layer SHALL require USER role, enforce ownership, and return a `200` response with `null` data.

---

### Requirement 18: CMS API

**User Story:** As a public visitor, I want to read CMS pages; as an ADMIN, I want to manage CMS content, so that legal and informational pages stay current.

#### Acceptance Criteria

1. WHEN a `GET /api/cms` request is received (no authentication required), THE API_Layer SHALL return all CMS documents sorted by `type` ascending.
2. WHEN a `GET /api/cms/[type]` request is received (no authentication required), THE API_Layer SHALL return the active CMS document matching the uppercased `type` parameter, or a `404` AppError if not found or inactive.
3. WHEN a `POST /api/cms` request is received, THE API_Layer SHALL require ADMIN role, validate against `createCmsSchema`, uppercase the `type`, check uniqueness, generate a unique `cmsId` in the format `"CMS-XXXX"`, and return the created document with status `201`.
4. WHEN a `PUT /api/cms/[type]` request is received, THE API_Layer SHALL require ADMIN role, validate against `updateCmsSchema`, and return the updated document.
5. WHEN a `DELETE /api/cms/[type]` request is received, THE API_Layer SHALL require ADMIN role and return a `200` response with `null` data.

---

### Requirement 19: Standardized API Response Format

**User Story:** As a developer, I want all API responses to follow a consistent envelope format, so that the frontend can handle responses uniformly.

#### Acceptance Criteria

1. THE API_Layer SHALL wrap all successful responses in the format: `{ code: <statusCode>, success: true, message: string, data: T | null }`.
2. THE API_Layer SHALL wrap all error responses in the format: `{ code: <statusCode>, success: false, message: string, errorCode: string, data: null, details?: unknown[] }`.
3. THE API_Layer SHALL include a global error handler that catches AppError instances and maps them to the error response format, and catches unexpected errors returning status `500` with message `"Internal Server Error"` in production.

---

### Requirement 20: Cookie-Based Token Storage (Next.js Optimization)

**User Story:** As a security-conscious developer, I want tokens stored in httpOnly cookies instead of localStorage, so that they are not accessible to JavaScript and are protected against XSS attacks.

#### Acceptance Criteria

1. THE API_Layer SHALL set `accessToken` and `refreshToken` as httpOnly cookies on login and token refresh responses.
2. THE API_Layer SHALL set the `Secure` flag on both cookies when `NODE_ENV` is `production`.
3. THE API_Layer SHALL set `SameSite=Lax` on both cookies to prevent CSRF while allowing normal navigation.
4. THE API_Layer SHALL clear both cookies (set `Max-Age=0`) on logout.
5. THE Auth_Guard SHALL read tokens exclusively from the Next.js `cookies()` API and SHALL NOT read from request headers or body for session validation.
6. WHILE the existing `axiosClient` reads tokens from localStorage, THE System SHALL maintain backward compatibility by also accepting `Authorization: Bearer` headers in API routes during the migration period, with cookies taking precedence.

---

### Requirement 21: Server Actions for Form Submissions

**User Story:** As a developer, I want form submissions handled via Next.js server actions, so that sensitive operations do not require a client-side API call and benefit from built-in CSRF protection.

#### Acceptance Criteria

1. THE System SHALL provide a `loginAction(formData)` server action that calls the Auth_Service login logic, sets httpOnly cookies, and returns `{ success: boolean, error?: string, user?: AuthUser }`.
2. THE System SHALL provide a `registerAction(formData)` server action that calls the Auth_Service register logic and returns `{ success: boolean, error?: string }`.
3. THE System SHALL provide a `logoutAction()` server action that calls the Auth_Service logout logic and clears both httpOnly cookies.
4. THE System SHALL provide a `updateProfileAction(formData)` server action that validates input, calls the Auth_Service update logic, and returns `{ success: boolean, error?: string, user?: AuthUser }`.
5. THE System SHALL provide a `createListedProductAction(formData)` server action that validates input, calls the listed product service, and returns `{ success: boolean, error?: string, product?: ListedProduct }`.
6. THE System SHALL provide a `createRequestedProductAction(formData)` server action that validates input, calls the requested product service, and returns `{ success: boolean, error?: string, request?: RequestedProduct }`.
7. IF a server action encounters a validation error, THEN THE server action SHALL return `{ success: false, error: string }` without throwing, so the calling component can display the error inline.

---

### Requirement 22: Server Component Data Fetching

**User Story:** As a developer, I want list and detail pages to fetch data in Server Components, so that pages are rendered with data on the server, reducing client-side waterfalls and improving performance.

#### Acceptance Criteria

1. THE System SHALL provide server-side data fetching functions (e.g., `getShops`, `getJobs`, `getListedProducts`, `getRequestedProducts`) that call the Backend_Layer services directly without going through HTTP.
2. WHEN called from a Server_Component, THE data fetching functions SHALL use React `cache()` to deduplicate identical calls within the same request.
3. THE data fetching functions SHALL accept the same filter/pagination parameters as the corresponding API routes.
4. IF the user is not authenticated when a data fetching function requires authentication, THEN THE function SHALL return `null` or an empty result, and the Server_Component SHALL redirect to `/login`.
5. THE System SHALL NOT make `fetch()` or `axios` calls from Server_Components to its own API routes; data SHALL be fetched by calling Backend_Layer functions directly.

---

### Requirement 23: Axios Client Migration (Proxy Pattern)

**User Story:** As a developer, I want the existing axios-based client modules to continue working during migration, so that the frontend is not broken while the backend is being wired up.

#### Acceptance Criteria

1. THE System SHALL update the `axiosClient` base URL to point to the Next.js app itself (relative URL `/`) so that API calls hit the Next.js Route Handlers instead of the separate Express server.
2. WHEN the `axiosClient` sends a request, THE System SHALL include credentials (`withCredentials: true`) so that httpOnly cookies are sent automatically.
3. THE System SHALL update the token refresh interceptor in `axiosClient` to use the cookie-based refresh endpoint (`POST /api/auth/refresh`) without sending a body (the cookie is read server-side).
4. THE System SHALL update the request interceptor to remove the `Authorization: Bearer` header injection from localStorage, as tokens are now managed via cookies.
5. WHEN a `401` response is received and the refresh attempt also fails, THE axiosClient SHALL clear the Zustand auth store and redirect to `/login`.

---

### Requirement 24: Environment Variables

**User Story:** As a developer, I want all required environment variables documented and validated at startup, so that misconfiguration is caught early.

#### Acceptance Criteria

1. THE System SHALL require the following environment variables: `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `NEXT_PUBLIC_APP_URL`.
2. IF any required environment variable is missing at startup, THEN THE Backend_Layer SHALL throw a descriptive error identifying the missing variable before any request is processed.
3. THE System SHALL use `NODE_ENV` to toggle production-only cookie flags (`Secure`) and error message verbosity.

---

### Requirement 25: Error Handling and AppError

**User Story:** As a developer, I want a typed AppError class and a centralized error handler, so that all operational errors produce consistent, structured API responses.

#### Acceptance Criteria

1. THE Backend_Layer SHALL provide an `AppError` class extending `Error` with properties: `statusCode` (number), `errorCode` (string, default `"ERROR"`), `isOperational` (always `true`), and optional `details` (unknown[]).
2. WHEN an AppError is thrown inside an API Route Handler, THE API_Layer SHALL catch it and return the error response format defined in Requirement 19 using the AppError's `statusCode` and `errorCode`.
3. WHEN an unexpected (non-operational) error is thrown, THE API_Layer SHALL return status `500` with message `"Internal Server Error"` in production and the full error message in development.
4. THE Backend_Layer SHALL provide a `withErrorHandler(handler)` wrapper for Route Handlers that catches all thrown errors and formats them into the standard error response.
