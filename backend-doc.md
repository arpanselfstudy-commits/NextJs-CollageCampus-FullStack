# CollageCampus Backend Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Environment Variables (.env)](#2-environment-variables-env)
3. [package.json — Dependencies](#3-packagejson--dependencies)
4. [Entry Files](#4-entry-files)
5. [Config Files](#5-config-files)
6. [Models / Schemas](#6-models--schemas)
7. [Services](#7-services)
8. [Controllers](#8-controllers)
9. [Routes](#9-routes)
10. [Validators (Zod Schemas)](#10-validators-zod-schemas)
11. [Middlewares](#11-middlewares)
12. [Utilities](#12-utilities)
13. [Types](#13-types)
14. [Swagger](#14-swagger-srcswaggerts)
15. [API Response Format](#15-api-response-format)
16. [Authentication Flow](#16-authentication-flow)
17. [Role-Based Access Control](#17-role-based-access-control)

---

## 1. Project Overview

CollageCampus is a Node.js + Express + TypeScript backend application with the following core stack:

- **Runtime/Framework:** Node.js + Express + TypeScript
- **Database:** MongoDB via Mongoose (MongoDB Atlas)
- **Authentication:** JWT-based auth using access tokens + refresh tokens
- **Validation:** Zod schema validation
- **API Docs:** Swagger (OpenAPI 3.0) via swagger-jsdoc + swagger-ui-express
- **Email:** Nodemailer with Gmail SMTP

---

## 2. Environment Variables (.env)

| Variable | Value / Description |
|----------|-------------------|
| `PORT` | `5000` — Port the server listens on |
| `NODE_ENV` | `development` — Environment mode |
| `MONGO_URI` | `mongodb+srv://...` — MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | `this-is-jwt-access-secreat` — Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | `this-is-jwt-refresh-secreat` — Secret for signing refresh tokens |
| `EMAIL_HOST` | `smtp.gmail.com` — SMTP host |
| `EMAIL_PORT` | `587` — SMTP port |
| `EMAIL_USER` | `arpanselfstudy@gmail.com` — Gmail sender address |
| `EMAIL_PASS` | `bjvfswqtthcalwtw` — Gmail App Password |
| `APP_URL` | `http://localhost:5000` — Backend base URL |
| `FRONTEND_URL` | `http://localhost:3000` — Frontend base URL (used in email links) |
| `ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173,http://localhost:3001,http://localhost:3002` — Comma-separated CORS allowed origins |

---

## 3. package.json — Dependencies

### Scripts

| Script | Command |
|--------|---------|
| `dev` | `nodemon --exec ts-node --files src/index.ts` |
| `seed` | `ts-node --files src/scripts/seed.ts` |
| `start` | `node dist/index.js` |
| `build` | `tsc` |
| `test` | `echo error` |

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `bcryptjs` | ^3.0.3 | Password hashing |
| `cors` | ^2.8.6 | CORS middleware |
| `crypto` | ^1.0.1 | Token hashing (SHA-256) |
| `dotenv` | ^17.3.1 | Environment variable loading |
| `express` | ^5.2.1 | Web framework |
| `express-rate-limit` | ^8.2.1 | Rate limiting |
| `helmet` | ^8.1.0 | Security headers |
| `jsonwebtoken` | ^9.0.3 | JWT signing and verification |
| `mongoose` | ^9.2.1 | MongoDB ODM |
| `nodemailer` | ^8.0.1 | Email sending |
| `swagger-jsdoc` | ^6.2.8 | Swagger spec generation from JSDoc |
| `swagger-ui-express` | ^5.0.1 | Swagger UI serving |
| `zod` | ^4.3.6 | Schema validation |

### DevDependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@faker-js/faker` | ^10.3.0 | Fake data generation for seeding |
| `@types/bcryptjs` | — | TypeScript types for bcryptjs |
| `@types/cors` | — | TypeScript types for cors |
| `@types/express` | — | TypeScript types for express |
| `@types/jsonwebtoken` | — | TypeScript types for jsonwebtoken |
| `@types/node` | — | TypeScript types for Node.js |
| `@types/nodemailer` | — | TypeScript types for nodemailer |
| `@types/swagger-jsdoc` | — | TypeScript types for swagger-jsdoc |
| `@types/swagger-ui-express` | — | TypeScript types for swagger-ui-express |
| `nodemon` | ^3.1.11 | Dev server auto-restart |
| `ts-node` | ^10.9.2 | TypeScript execution without pre-compilation |
| `typescript` | ^5.9.3 | TypeScript compiler |

---

## 4. Entry Files

### src/index.ts

- Loads environment variables via `dotenv`
- Imports the Express `app` from `app.ts`
- Calls `connectDB()` to establish MongoDB connection
- Starts the HTTP server on `env.PORT`

### src/app.ts

- Creates the Express application instance
- Applies `helmet` with `crossOriginResourcePolicy: 'cross-origin'`
- Applies CORS middleware:
  - In **development**: allows all origins
  - In **production**: checks request origin against `ALLOWED_ORIGINS` array; strips trailing slashes before comparison
  - Allowed methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`
  - `credentials: true`
  - `maxAge: 86400`
- Applies `express.json()` and `express.urlencoded({ extended: true })`
- Calls `setupSwagger(app)` to mount Swagger UI
- Mounts route handlers:
  - `/api/auth`
  - `/api/shops`
  - `/api/jobs`
  - `/api/listed-products`
  - `/api/requested-products`
  - `/api/cms`
- Applies `globalErrorHandler` as the final middleware

---

## 5. Config Files

### src/config/env.ts

Exports a typed `env` object containing all environment variables. Notable processing:

- `ALLOWED_ORIGINS` is parsed from a comma-separated string: split by `,`, each entry trimmed, trailing slashes removed, empty strings filtered out

### src/config/db.ts

Exports `connectDB()`:

- Connects Mongoose to `MONGO_URI`
- Logs a success message on connection
- Logs a failure message and exits on error

### src/config/jwt.ts

| Function | Description |
|----------|-------------|
| `generateAccessToken(id)` | Signs a JWT with `JWT_ACCESS_SECRET`, expires in `59m` |
| `generateRefreshToken(id)` | Signs a JWT with `JWT_REFRESH_SECRET`, expires in `7d` |

---

## 6. Models / Schemas

### User Model (`src/models/user.model.ts`)

**Collection:** `User`

**Enum `UserRole`:** `ADMIN` | `USER`

**Interface `IUser` extends `Document`:**

| Field | Type | Notes |
|-------|------|-------|
| `name` | `string` | Required |
| `email` | `string` | Required, unique |
| `password` | `string` | Required |
| `role` | `UserRole` | Default: `USER` |
| `phoneNumber` | `string` | Optional |
| `photo` | `string` | Optional |
| `resetPasswordToken` | `string` | Optional |
| `resetPasswordExpire` | `Date` | Optional |
| `createdAt` | `Date` | Auto (timestamps) |
| `updatedAt` | `Date` | Auto (timestamps) |

---

### RefreshToken Model (`src/models/refreshToken.model.ts`)

**Collection:** `RefreshToken`

**Interface `IRefreshToken` extends `Document`:**

| Field | Type | Notes |
|-------|------|-------|
| `userId` | `ObjectId` | Ref: `User`, required |
| `token` | `string` | Required, indexed |
| `expiresAt` | `Date` | Required |
| `deviceInfo` | `{ ip?: string, name?: string }` | Optional |
| `createdAt` | `Date` | Auto (timestamps: createdAt only) |

**TTL Index:** `expiresAt` with `expireAfterSeconds: 0` — MongoDB auto-deletes expired tokens

---

### Shop Model (`src/models/shop.model.ts`)

**Collection:** `Shop`

**Sub-schemas:**

- **`IDayTiming`** (`_id: false`): `{ isOpen: boolean, opensAt: string|null, closesAt: string|null }`
- **`IContactDetails`** (`_id: false`): `{ email: string, phoneNo: string }`
- **`IOffer`** (`_id: false`): `{ offerId: string, shopId: string, offerName: string, startDate: Date, endDate: Date (must be >= startDate), description: string, photo: string }`
- **`IShopTiming`** (`_id: false`): `{ monday, tuesday, wednesday, thursday, friday, saturday, sunday: IDayTiming }`

**Interface `IShop` extends `Document`:**

| Field | Type | Notes |
|-------|------|-------|
| `name` | `string` | Required |
| `createdBy` | `ObjectId` | Ref: `User`, required |
| `shopId` | `string` | Required, unique |
| `type` | `string` | Required |
| `location` | `string` | Required |
| `distance` | `string` | Optional |
| `photo` | `string` | Optional |
| `photos` | `string[]` | Optional |
| `poster` | `string` | Optional |
| `topItems` | `string[]` | Optional |
| `allItems` | `string[]` | Optional |
| `contactDetails` | `IContactDetails` | Required |
| `shopTiming` | `IShopTiming` | Required |
| `offers` | `IOffer[]` | Optional |
| `createdAt` | `Date` | Auto (timestamps) |
| `updatedAt` | `Date` | Auto (timestamps) |

---

### Job Model (`src/models/job.model.ts`)

**Collection:** `Job`

**Enum `JobType`:** `PART_TIME = 'part-time'` | `FULL_TIME = 'full-time'`

**Sub-schemas:**

- **`IContactDetails`** (`_id: false`): `{ email: string, phoneNo: string }`
- **`ISalary`** (`_id: false`): `{ from: number (min 0), to: number (min 0) }`

**Interface `IJob` extends `Document`:**

| Field | Type | Notes |
|-------|------|-------|
| `jobName` | `string` | Required, trim |
| `jobId` | `string` | Required, unique, trim |
| `createdBy` | `ObjectId` | Ref: `User`, required |
| `jobProvider` | `string` | Required, trim |
| `type` | `JobType` | Required |
| `deadline` | `Date` | Required |
| `location` | `string` | Required, trim |
| `experience` | `number` | Required, min 0 |
| `salary` | `ISalary` | Required |
| `jobDescription` | `string` | Required |
| `responsibilities` | `string[]` | Required |
| `contactDetails` | `IContactDetails` | Required |
| `createdAt` | `Date` | Auto (timestamps) |
| `updatedAt` | `Date` | Auto (timestamps) |

---

### ListedProduct Model (`src/models/listedProducts.model.ts`)

**Collection:** `ListedProduct`

**Enums:**

- **`ProductCategory`:** `ELECTRONICS`, `CLOTHING_FASHION`, `HOME_KITCHEN`, `BEAUTY_PERSONAL_CARE`, `SPORTS_FITNESS`, `BOOKS_STATIONERY`, `TOYS_GAMES`, `AUTOMOTIVE`, `GROCERIES_FOOD`, `HEALTH_WELLNESS`
- **`ProductCondition`:** `NEW`, `USED`, `REFURBISHED`

**Sub-schema `IContactDetails`** (`_id: false`): `{ phoneNo: string, email: string }`

**Interface `IListedProduct` extends `Document`:**

| Field | Type | Notes |
|-------|------|-------|
| `user` | `ObjectId` | Ref: `User`, required |
| `productName` | `string` | Required, trim |
| `images` | `string[]` | Required |
| `category` | `ProductCategory` | Required |
| `condition` | `ProductCondition` | Required |
| `price` | `string` | Required |
| `isNegotiable` | `boolean` | Required, default `false` |
| `description` | `string` | Required |
| `yearUsed` | `number` | Required, min 0 |
| `contactDetails` | `IContactDetails` | Required |
| `isAvailable` | `boolean` | Required, default `true` |
| `createdAt` | `Date` | Auto (timestamps) |
| `updatedAt` | `Date` | Auto (timestamps) |

---

### RequestedProduct Model (`src/models/requestedProducts.model.ts`)

**Collection:** `RequestedProduct`

Re-exports `ProductCategory` from `listedProducts.model`.

**Sub-schemas:**

- **`IContactDetails`** (`_id: false`): `{ phoneNo: string, email: string }`
- **`IPriceRange`** (`_id: false`): `{ from: number (min 0), to: number (min 0) }`

**Interface `IRequestedProduct` extends `Document`:**

| Field | Type | Notes |
|-------|------|-------|
| `user` | `ObjectId` | Ref: `User`, required |
| `name` | `string` | Required, trim |
| `images` | `string[]` | Optional |
| `category` | `ProductCategory` | Required |
| `price` | `IPriceRange` | Required |
| `isNegotiable` | `boolean` | Required, default `false` |
| `description` | `string` | Required |
| `contactDetails` | `IContactDetails` | Required |
| `isFulfilled` | `boolean` | Required, default `false` |
| `createdAt` | `Date` | Auto (timestamps) |
| `updatedAt` | `Date` | Auto (timestamps) |

---

### CMS Model (`src/models/cms.model.ts`)

**Collection:** `Cms`

**Enum `CmsType`:** `TERMS_AND_CONDITIONS`, `PRIVACY_POLICY`, `ABOUT_US`, `FAQ`

**Interface `ICms` extends `Document`:**

| Field | Type | Notes |
|-------|------|-------|
| `cmsId` | `string` | Required, unique, trim |
| `type` | `CmsType \| string` | Required, unique, trim, uppercase |
| `title` | `string` | Required, trim |
| `content` | `string` | Required |
| `isActive` | `boolean` | Default `true` |
| `createdAt` | `Date` | Auto (timestamps) |
| `updatedAt` | `Date` | Auto (timestamps) |

---

## 7. Services

### auth.service.ts

**Token hashing:** SHA-256 via `crypto.createHash('sha256').update(token).digest('hex')`

| Function | Description |
|----------|-------------|
| `registerUser(data)` | Checks email uniqueness, hashes password with bcrypt (salt rounds: 10), creates and returns new `User` |
| `loginUser(email, password, deviceInfo)` | Finds user by email, compares password with bcrypt, generates access + refresh tokens, stores **hashed** refresh token in `RefreshToken` collection (expires 7 days), returns `{ accessToken, refreshToken, user }` |
| `refreshUserToken(token, deviceInfo)` | Verifies JWT with `JWT_REFRESH_SECRET`, finds hashed token in DB. If not found: deletes **all** tokens for that user (reuse detection) and throws `TOKEN_REUSE` error. Otherwise: rotates token (generates new access + refresh, updates DB record) |
| `logoutUser(token)` | Deletes the hashed token from the `RefreshToken` collection |
| `forgotPassword(email)` | Finds user, generates 32-byte random hex token, stores SHA-256 hash in `user.resetPasswordToken` with 15-minute expiry, sends reset email via mailer, returns the plain token |
| `resetPassword(token, newPassword)` | Finds user by hashed token where expiry > now, hashes new password, clears `resetPasswordToken` and `resetPasswordExpire` fields |
| `updateProfile(userId, data)` | Finds user by ID, checks email uniqueness if email is being changed, assigns new data, saves |

---

### shop.service.ts

**ID generation:**
- `generateShopId()` — loops until a unique `"Shop-XXXX"` (4 random digits) is found
- `generateOfferId()` — loops until a unique `"Offer-XXXX"` is found

| Function | Description |
|----------|-------------|
| `createShop(data, userId)` | Generates `shopId`, generates `offerId`s for any offers provided, creates `Shop` with `createdBy = userId` |
| `updateShop(id, data)` | `findByIdAndUpdate` with `new: true, runValidators: true`; generates `offerId`s for new offers that don't have one |
| `deleteShop(id)` | `findByIdAndDelete`; throws 404 if not found |
| `getShops(filters)` | Supports `page`/`limit`/`search` (regex on `name`, `topItems`, `allItems`), `distance` exact match, `openDay` (checks `shopTiming.{day}.isOpen = true`); returns paginated result |
| `getShopById(id)` | `findById`; throws 404 if not found |
| `addOffer(id, offerData)` | Finds shop, generates `offerId`, pushes offer to `offers` array, saves |
| `updateOffer(id, offerId, offerData)` | Finds shop, finds offer by `offerId` index, merges data, saves |
| `deleteOffer(id, offerId)` | Finds shop, splices offer by index, saves |

---

### job.service.ts

**ID generation:**
- `generateJobId()` — loops until a unique `"Job-XXXX"` is found

| Function | Description |
|----------|-------------|
| `createJob(data, userId)` | Generates `jobId`, creates `Job` with `createdBy = userId` |
| `updateJob(id, data)` | `findByIdAndUpdate` with `new: true, runValidators: true` |
| `deleteJob(id)` | `findByIdAndDelete` |
| `getJobs(filters)` | Supports `page`/`limit`/`search` (regex on `jobName`, `jobProvider`), `jobType` exact match, `experience` range (`$gte`/`$lte`), `salary` range (`salary.from $gte`, `salary.to $lte`), `deadline` range; returns paginated result |
| `getJobById(id)` | `findById`; throws 404 if not found |

---

### listedProduct.service.ts

| Function | Description |
|----------|-------------|
| `createListedProduct(data, userId)` | Creates `ListedProduct` with `user = userId` |
| `getListedProducts(filters)` | Supports `page`/`limit`/`search` (regex on `productName`), `category`, `condition`, `price` range (string comparison), `yearUsed` range, `userId` filter; populates `user` (name, email); returns paginated result |
| `getListedProductById(id)` | `findById` with `user` populate; throws 404 if not found |
| `updateListedProduct(id, userId, data)` | `findOneAndUpdate` matching `_id` AND `user` (ownership check) |
| `deleteListedProduct(id, userId)` | `findOneAndDelete` matching `_id` AND `user` (ownership check) |

---

### requestedProduct.service.ts

| Function | Description |
|----------|-------------|
| `createRequestedProduct(data, userId)` | Creates `RequestedProduct` with `user = userId` |
| `getRequestedProducts(filters)` | Supports `page`/`limit`/`search` (regex on `name`, `category`), `category`, `isNegotiable`, `isFulfilled`, `price` range (`price.from $gte`, `price.to $lte`), `userId`; populates `user`; returns paginated result |
| `getRequestedProductById(id)` | `findById` with `user` populate; throws 404 if not found |
| `updateRequestedProduct(id, userId, data)` | `findOneAndUpdate` with ownership check |
| `deleteRequestedProduct(id, userId)` | `findOneAndDelete` with ownership check |

---

### cms.service.ts

**ID generation:**
- `generateCmsId()` — loops until a unique `"CMS-XXXX"` is found

| Function | Description |
|----------|-------------|
| `createCms(data)` | Uppercases `type`, checks uniqueness, generates `cmsId`, creates `Cms` |
| `updateCms(type, data)` | Uppercases `type`, `findOneAndUpdate` by `type` |
| `deleteCms(type)` | `findOneAndDelete` by uppercased `type` |
| `getCmsByType(type)` | `findOne` by uppercased `type` where `isActive = true` |
| `getAllCmsPages()` | `find` all, sorted by `type` ascending |

---

## 8. Controllers

All handlers are wrapped in `asyncHandler`. All successful responses use `SuccessResponse.send()`.

### auth.controller.ts

| Handler | Description |
|---------|-------------|
| `register` | Calls `registerUser`, returns `201` |
| `login` | Extracts `deviceInfo` from `req.ip` + user-agent header, calls `loginUser`, returns `{ accessToken, refreshToken, user }` |
| `refresh` | Extracts `refreshToken` from body, calls `refreshUserToken` with `deviceInfo`, returns new tokens |
| `logout` | Calls `logoutUser` if token present, returns `200` |
| `forgot` | Calls `forgotPassword`, returns `{ resetToken }` |
| `reset` | Calls `resetPassword` with `req.params.token` and `body.password` |
| `updateProfile` | Requires `req.user` (protected route), calls `updateProfile` with `userId` |

---

### shop.controller.ts

| Handler | Description |
|---------|-------------|
| `createShop` | Calls `shopService.createShop` with body + `req.user._id`, returns `201` |
| `updateShop` | Calls `updateShop` with `req.params.id` |
| `deleteShop` | Calls `deleteShop`, returns `null` data |
| `getShops` | Parses query params (`page`, `limit`, `search`, `distance`, `openDay`), calls `getShops` |
| `getShopById` | Calls `getShopById` with `req.params.id` |
| `addOffer` | Calls `addOffer` with shop `id` + body, returns `201` |
| `updateOffer` | Calls `updateOffer` with shop `id` + `offerId` + body |
| `deleteOffer` | Calls `deleteOffer` with shop `id` + `offerId` |

---

### job.controller.ts

| Handler | Description |
|---------|-------------|
| `createJob` | Calls `jobService.createJob` with body + `req.user._id`, returns `201` |
| `updateJob` | Calls `updateJob` |
| `deleteJob` | Calls `deleteJob`, returns `null` data |
| `getJobs` | Parses all query filters (`page`, `limit`, `search`, `jobType`, `minExperience`, `maxExperience`, `minSalary`, `maxSalary`, `deadlineFrom`, `deadlineTo`) |
| `getJobById` | Calls `getJobById` |

---

### listedProduct.controller.ts

| Handler | Description |
|---------|-------------|
| `createListedProduct` | Calls `service.createListedProduct`, returns `201` |
| `getListedProducts` | Parses all query filters |
| `getMyListedProducts` | Calls `getListedProducts` with `userId = req.user._id` |
| `getListedProductById` | Calls `service.getListedProductById` |
| `updateListedProduct` | Calls `service.updateListedProduct` with ownership check |
| `deleteListedProduct` | Calls `service.deleteListedProduct` with ownership check |

---

### requestedProduct.controller.ts

| Handler | Description |
|---------|-------------|
| `createRequestedProduct` | Calls `service.createRequestedProduct`, returns `201` |
| `getRequestedProducts` | Parses all query filters; converts `isNegotiable`/`isFulfilled` strings to booleans |
| `getMyRequestedProducts` | Calls `getRequestedProducts` with `userId = req.user._id` |
| `getRequestedProductById` | Calls `service.getRequestedProductById` |
| `updateRequestedProduct` | Calls `service.updateRequestedProduct` with ownership check |
| `deleteRequestedProduct` | Calls `service.deleteRequestedProduct` with ownership check |

---

### cms.controller.ts

| Handler | Description |
|---------|-------------|
| `createCms` | Calls `cmsService.createCms`, returns `201` |
| `updateCms` | Calls `updateCms` with `req.params.type` |
| `deleteCms` | Calls `deleteCms` with `req.params.type`, returns `null` data |
| `getCmsByType` | Calls `getCmsByType` with `req.params.type` |
| `getAllCmsPages` | Calls `getAllCmsPages` |

---

## 9. Routes

### /api/auth (`auth.routes.ts`)

| Method | Path | Middleware | Handler |
|--------|------|------------|---------|
| `POST` | `/register` | `validate(registerSchema)` | `register` |
| `POST` | `/login` | `validate(loginSchema)` | `login` |
| `POST` | `/refresh` | `validate(refreshTokenSchema)` | `refresh` |
| `POST` | `/logout` | `validate(refreshTokenSchema)` | `logout` |
| `POST` | `/forgot-password` | `validate(forgotPasswordSchema)` | `forgot` |
| `POST` | `/reset-password/:token` | `validate(resetPasswordSchema)` | `reset` |
| `PATCH` | `/profile` | `protect`, `validate(updateProfileSchema)` | `updateProfile` |

---

### /api/shops (`shop.routes.ts`)

| Method | Path | Middleware | Handler |
|--------|------|------------|---------|
| `GET` | `/` | `protect` | `getShops` |
| `GET` | `/:id` | `protect` | `getShopById` |
| `POST` | `/` | `protect`, `authorize(ADMIN)`, `validate(createShopSchema)` | `createShop` |
| `PUT` | `/:id` | `protect`, `authorize(ADMIN)`, `validate(updateShopSchema)` | `updateShop` |
| `DELETE` | `/:id` | `protect`, `authorize(ADMIN)` | `deleteShop` |
| `POST` | `/:id/offers` | `protect`, `authorize(ADMIN)`, `validate(createOfferSchema)` | `addOffer` |
| `PUT` | `/:id/offers/:offerId` | `protect`, `authorize(ADMIN)`, `validate(updateOfferSchema)` | `updateOffer` |
| `DELETE` | `/:id/offers/:offerId` | `protect`, `authorize(ADMIN)` | `deleteOffer` |

---

### /api/jobs (`job.routes.ts`)

| Method | Path | Middleware | Handler |
|--------|------|------------|---------|
| `GET` | `/` | `protect` | `getJobs` |
| `GET` | `/:id` | `protect` | `getJobById` |
| `POST` | `/` | `protect`, `authorize(ADMIN)`, `validate(createJobSchema)` | `createJob` |
| `PUT` | `/:id` | `protect`, `authorize(ADMIN)`, `validate(updateJobSchema)` | `updateJob` |
| `DELETE` | `/:id` | `protect`, `authorize(ADMIN)` | `deleteJob` |

---

### /api/listed-products (`listedProduct.routes.ts`)

| Method | Path | Middleware | Handler |
|--------|------|------------|---------|
| `GET` | `/` | `protect` | `getListedProducts` |
| `GET` | `/my-products` | `protect` | `getMyListedProducts` |
| `GET` | `/:id` | `protect` | `getListedProductById` |
| `POST` | `/` | `protect`, `authorize(USER)`, `validate(createListedProductSchema)` | `createListedProduct` |
| `PUT` | `/:id` | `protect`, `authorize(USER)`, `validate(updateListedProductSchema)` | `updateListedProduct` |
| `DELETE` | `/:id` | `protect`, `authorize(USER)` | `deleteListedProduct` |

---

### /api/requested-products (`requestedProduct.routes.ts`)

| Method | Path | Middleware | Handler |
|--------|------|------------|---------|
| `GET` | `/` | `protect` | `getRequestedProducts` |
| `GET` | `/my-requests` | `protect` | `getMyRequestedProducts` |
| `GET` | `/:id` | `protect` | `getRequestedProductById` |
| `POST` | `/` | `protect`, `authorize(USER)`, `validate(createRequestedProductSchema)` | `createRequestedProduct` |
| `PUT` | `/:id` | `protect`, `authorize(USER)`, `validate(updateRequestedProductSchema)` | `updateRequestedProduct` |
| `DELETE` | `/:id` | `protect`, `authorize(USER)` | `deleteRequestedProduct` |

---

### /api/cms (`cms.routes.ts`)

| Method | Path | Middleware | Handler |
|--------|------|------------|---------|
| `GET` | `/` | _(none)_ | `getAllCmsPages` |
| `GET` | `/:type` | _(none)_ | `getCmsByType` |
| `POST` | `/` | `protect`, `authorize(ADMIN)`, `validate(createCmsSchema)` | `createCms` |
| `PUT` | `/:type` | `protect`, `authorize(ADMIN)`, `validate(updateCmsSchema)` | `updateCms` |
| `DELETE` | `/:type` | `protect`, `authorize(ADMIN)` | `deleteCms` |

---

## 10. Validators (Zod Schemas)

### auth.validator.ts

| Schema | Fields |
|--------|--------|
| `registerSchema` | `name: string min(3)`, `email: email`, `password: string min(6)` |
| `loginSchema` | `email: email`, `password: string` |
| `refreshTokenSchema` | `refreshToken: string` |
| `forgotPasswordSchema` | `email: email` |
| `resetPasswordSchema` | `password: string min(6)` |
| `updateProfileSchema` | `name?: string min(3)`, `email?: email`, `phoneNumber?: string min(10)`, `photo?: url or empty string` |

---

### shop.validator.ts

| Schema | Fields |
|--------|--------|
| `dayTimingSchema` | `isOpen: boolean`, `opensAt: string\|null`, `closesAt: string\|null` |
| `shopTimingSchema` | All 7 days (`monday`–`sunday`) as `dayTimingSchema` |
| `contactDetailsSchema` | `email: email`, `phoneNo: string` |
| `createOfferSchema` | `offerId?: string`, `shopId?: string`, `offerName: string`, `startDate: string→Date`, `endDate: string→Date`, `description: string`, `photo: string` |
| `updateOfferSchema` | `createOfferSchema.partial()` |
| `createShopSchema` | `name: string min(1)`, `shopId?: string`, `type: string min(1)`, `location: string min(1)`, `distance?: string`, `photo?: string`, `photos?: string[]`, `poster?: string`, `topItems?: string[]`, `allItems?: string[]`, `contactDetails`, `shopTiming`, `offers?: array` |
| `updateShopSchema` | `createShopSchema.partial()` |
| `listShopsQuerySchema` | `page?`, `limit?`, `search?`, `distance?`, `openDay?: enum of 7 days` |

---

### job.validator.ts

| Schema | Fields |
|--------|--------|
| `contactDetailsSchema` | `email: email`, `phoneNo: string` |
| `salarySchema` | `from: number min(0)`, `to: number min(0)` |
| `createJobSchema` | `jobName: string min(1)`, `jobProvider: string min(1)`, `type: JobType enum`, `deadline: string→Date`, `location: string min(1)`, `experience: number min(0)`, `salary`, `jobDescription: string min(1)`, `responsibilities: string[] min(1)`, `contactDetails` |
| `updateJobSchema` | `createJobSchema.partial()` |
| `listJobsQuerySchema` | All optional query params |

---

### listedProduct.validator.ts

| Schema | Fields |
|--------|--------|
| `contactDetailsSchema` | `phoneNo: string min(1)`, `email: email` |
| `createListedProductSchema` | `productName: string min(1)`, `images: url[] min(1)`, `category: ProductCategory`, `condition: ProductCondition`, `price: string min(1)`, `isNegotiable: boolean`, `description: string min(1)`, `yearUsed: number min(0)`, `contactDetails`, `isAvailable?: boolean` |
| `updateListedProductSchema` | `createListedProductSchema.partial()` |
| `listProductsQuerySchema` | All optional query params |

---

### requestedProduct.validator.ts

| Schema | Fields |
|--------|--------|
| `contactDetailsSchema` | `phoneNo: string min(1)`, `email: email` |
| `priceRangeSchema` | `from: number min(0)`, `to: number min(0)` |
| `createRequestedProductSchema` | `name: string min(1)`, `images?: url[]`, `category: ProductCategory`, `price: priceRange`, `isNegotiable: boolean`, `description: string min(1)`, `contactDetails`, `isFulfilled?: boolean` |
| `updateRequestedProductSchema` | `createRequestedProductSchema.partial()` |
| `listRequestedProductsQuerySchema` | All optional query params |

---

### cms.validator.ts

| Schema | Fields |
|--------|--------|
| `createCmsSchema` | `type: string min(1)`, `title: string min(1)`, `content: string min(1)`, `isActive?: boolean` |
| `updateCmsSchema` | `createCmsSchema.partial()` |

---

## 11. Middlewares

### auth.middleware.ts — `protect`

- Extracts Bearer token from the `Authorization` header
- Throws `401` if no token is present
- Verifies the token with `JWT_ACCESS_SECRET`, decodes `{ id }`
- Finds the user by `decoded.id`; throws `401` if not found
- Sets `req.user = user` and calls `next()`
- Wrapped in `asyncHandler`

---

### role.middleware.ts — `authorize(...roles)`

Returns a middleware function that:

- Returns `401` if `req.user` is not set
- Returns `403` if `req.user.role` is not in the allowed roles array
- Calls `next()` if the role is authorized

---

### validate.middleware.ts — `validate(schema)`

Returns a middleware function that:

- Calls `schema.parse(req.body)`
- On `ZodError`: formats all issues as `"path: message"` joined by `", "`, throws `AppError(message, 400, "VALIDATION_ERROR", issues)`
- On other errors: passes to `next(error)`

---

### error.middleware.ts — `globalErrorHandler`

- If the error is an `AppError`: calls `ErrorResponse.send` with `statusCode`, `errorCode`, `details`
- Otherwise: logs the error, returns `500` with:
  - Full error message in development
  - `"Internal Server Error"` in production
  - Stack trace included in development only

---

## 12. Utilities

### utils/apiResponse.ts

**Interface `ApiResponse<T>`:** `{ code: number, success: boolean, message: string, data: T | null }`

**`SuccessResponse.send(res, data, message = "Success", statusCode = 200)`**
- Returns `{ code, success: true, message, data }` with the given HTTP status

**`ErrorResponse.send(res, message = "Error", statusCode = 500, errorCode = "INTERNAL_SERVER_ERROR", details = null)`**
- Returns `{ code, success: false, message, errorCode, data: null, details? }` with the given HTTP status

---

### utils/appError.ts — `AppError extends Error`

| Property | Description |
|----------|-------------|
| `statusCode` | HTTP status code |
| `isOperational` | Always `true` (marks known/expected errors) |
| `errorCode` | String error code, default `"ERROR"` |
| `details` | Optional additional error details |

**Constructor:** `(message, statusCode, errorCode?, details?)`

Captures stack trace via `Error.captureStackTrace`.

---

### utils/asyncHandler.ts

Generic wrapper that returns an Express `RequestHandler`:

```ts
asyncHandler(fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)
```

Fully typed with generics `P`, `ResBody`, `ReqBody`, `ReqQuery`.

---

### utils/mailer.ts

Creates a Nodemailer transporter using Gmail service with `EMAIL_USER` / `EMAIL_PASS` credentials. Verifies the connection on startup.

**`sendResetPasswordEmail(email, resetToken)`**

- Builds reset URL: `FRONTEND_URL/reset-password?token=resetToken`
- Sends an HTML email with a styled reset button
- From: `"Collage Campus Admin" <EMAIL_USER>`
- Subject: `"Reset your Password - Collage Campus"`
- Link expires in 15 minutes (enforced server-side)

---

## 13. Types

### src/types/express.d.ts

Extends the Express `Request` interface to add an optional `user?: IUser` property globally, enabling typed access to the authenticated user in all route handlers and middlewares.

---

## 14. Swagger (`src/swagger.ts`)

`setupSwagger(app)` mounts Swagger UI at `/api-docs` using `swagger-jsdoc`.

**OpenAPI 3.0.0 spec:**

- **Title:** CollageCampus API
- **Version:** 1.0.0
- **Server:** `http://localhost:5000`
- **Security scheme:** `accessToken` (Bearer JWT)

### Documented Schemas

`ApiResponse`, `ErrorResponse`, `User`, `AuthRegister`, `AuthLogin`, `RefreshToken`, `ForgotPassword`, `ResetPassword`, `UpdateProfile`, `LoginResponseData`, `RefreshResponseData`, `Job`, `JobsPaginationData`, `Offer`, `Shop`, `ShopsPaginationData`, `DayTiming`, `ListedProduct`, `ListedProductsPaginationData`, `RequestedProduct`, `RequestedProductsPaginationData`, `Cms`, `CreateCms`

### Documented Paths

| Group | Paths |
|-------|-------|
| **Auth** | `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/forgot-password`, `/api/auth/reset-password/{token}`, `/api/auth/profile` |
| **Jobs** | `/api/jobs` (GET with filters, POST), `/api/jobs/{jobId}` (GET, PUT, DELETE) |
| **Shops** | `/api/shops` (GET with filters, POST), `/api/shops/{id}` (GET, PUT, DELETE), `/api/shops/{id}/offers` (POST), `/api/shops/{id}/offers/{offerId}` (PUT, DELETE) |
| **Listed Products** | `/api/listed-products` (GET, POST), `/api/listed-products/my-products` (GET), `/api/listed-products/{id}` (GET, PUT, DELETE) |
| **Requested Products** | `/api/requested-products` (GET, POST), `/api/requested-products/my-requests` (GET), `/api/requested-products/{id}` (GET, PUT, DELETE) |
| **CMS** | `/api/cms` (GET, POST), `/api/cms/{type}` (GET, PUT, DELETE) |

All paths include full request body and response schemas.

---

## 15. API Response Format

All responses follow a consistent structure.

**Success Response:**

```json
{
  "code": 200,
  "success": true,
  "message": "...",
  "data": { ... }
}
```

**Error Response:**

```json
{
  "code": 400,
  "success": false,
  "message": "...",
  "errorCode": "VALIDATION_ERROR",
  "data": null,
  "details": [ ... ]
}
```

---

## 16. Authentication Flow

1. **Register:** `POST /api/auth/register` → creates user with bcrypt-hashed password
2. **Login:** `POST /api/auth/login` → returns `accessToken` (59m) + `refreshToken` (7d); stores **hashed** refresh token in DB
3. **Authenticated requests:** send `Authorization: Bearer <accessToken>` header
4. **Token refresh:** `POST /api/auth/refresh` with `{ refreshToken }` → rotates both tokens (old token deleted, new token stored)
5. **Logout:** `POST /api/auth/logout` with `{ refreshToken }` → deletes token from DB
6. **Forgot password:** `POST /api/auth/forgot-password` → sends email with reset link containing a plain token
7. **Reset password:** `POST /api/auth/reset-password/:token` → validates token (15-min expiry), updates password, clears reset fields

### Security Features

- **Refresh token rotation** on every refresh request
- **Reuse detection:** if a previously used token is presented again, ALL sessions for that user are immediately revoked
- **Tokens stored as SHA-256 hashes** in DB — plain tokens are never persisted
- **TTL index** on `RefreshToken.expiresAt` auto-expires tokens from the database

---

## 17. Role-Based Access Control

Two roles exist: `ADMIN` and `USER` (default for new registrations).

| Role | Permissions |
|------|-------------|
| `ADMIN` | Create, update, delete shops; create, update, delete jobs; create, update, delete CMS pages; manage shop offers |
| `USER` | Create, update, delete their own listed products; create, update, delete their own requested products |
| Both (authenticated) | Read shops, jobs, listed products, requested products |
| Public (no auth) | Read CMS pages (`GET /api/cms`, `GET /api/cms/:type`) |

Ownership enforcement for `USER` resources: update and delete operations match both `_id` and `user` fields, ensuring users can only modify their own records.
