# Auth API — Frontend Integration Guide

> Base URL: `http://localhost:3000`
> All requests/responses use `Content-Type: application/json`
> Tokens are managed via **httpOnly cookies** — the frontend never touches tokens directly.

---

## How Authentication Works

```
┌─────────────┐         POST /api/auth/login          ┌─────────────┐
│   Frontend  │ ─────────────────────────────────────▶ │   Server    │
│             │                                         │             │
│             │ ◀───────────────────────────────────── │  Sets:      │
│             │   { success, data: User }               │  accessToken  cookie (59min)
│             │                                         │  refreshToken cookie (7days)
└─────────────┘                                         └─────────────┘

On every subsequent request, cookies are sent automatically by the browser.

If accessToken expires, the server silently refreshes it using the refreshToken cookie.
The frontend can also manually call POST /api/auth/refresh to rotate tokens.

Token reuse detection: if a previously used refreshToken is presented,
ALL sessions for that user are immediately revoked.
```

### Cookie Details

| Cookie         | HttpOnly | Secure (prod) | SameSite | Max Age  |
|----------------|----------|---------------|----------|----------|
| `accessToken`  | ✅       | ✅            | lax      | 59 min   |
| `refreshToken` | ✅       | ✅            | lax      | 7 days   |

> Since cookies are `httpOnly`, JavaScript **cannot** read them. This is intentional for security.
> Always use `credentials: 'include'` (fetch) or `withCredentials: true` (axios) on every request.

---

## Standard Response Format

### Success
```json
{
  "code": 200,
  "success": true,
  "message": "...",
  "data": { ... }
}
```

### Error
```json
{
  "code": 400,
  "success": false,
  "message": "Human readable message",
  "errorCode": "MACHINE_READABLE_CODE",
  "data": null,
  "details": [ ... ]
}
```

### Error Codes Reference

| errorCode                  | HTTP | Meaning                                      |
|----------------------------|------|----------------------------------------------|
| `VALIDATION_ERROR`         | 400  | Request body failed validation               |
| `INVALID_CREDENTIALS`      | 401  | Wrong email or password                      |
| `UNAUTHORIZED`             | 401  | No valid session / missing token             |
| `INVALID_TOKEN`            | 401  | Token is malformed or expired                |
| `TOKEN_REUSE`              | 401  | Refresh token reuse detected — all sessions revoked |
| `EMAIL_ALREADY_EXISTS`     | 409  | Email is already registered                  |
| `USER_NOT_FOUND`           | 404  | No user found with that email                |
| `INVALID_OR_EXPIRED_TOKEN` | 400  | Password reset token is invalid or expired   |
| `FORBIDDEN`                | 403  | Authenticated but insufficient role          |

---

## Endpoints

---

### 1. Register

**`POST /api/auth/register`**

Creates a new user account. Does **not** log the user in automatically.

#### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

| Field      | Type   | Required | Rules          |
|------------|--------|----------|----------------|
| `name`     | string | ✅       | min 3 chars    |
| `email`    | string | ✅       | valid email    |
| `password` | string | ✅       | min 6 chars    |

#### Success Response — `201`
```json
{
  "code": 201,
  "success": true,
  "message": "Registered successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "phoneNumber": null,
    "photo": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Error Responses
| Status | errorCode              | When                    |
|--------|------------------------|-------------------------|
| 400    | `VALIDATION_ERROR`     | Invalid fields          |
| 409    | `EMAIL_ALREADY_EXISTS` | Email already registered|

#### Example (fetch)
```js
const res = await fetch('/api/auth/register', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'John Doe', email: 'john@example.com', password: 'secret123' }),
})
const data = await res.json()
```

---

### 2. Login

**`POST /api/auth/login`**

Authenticates the user. Sets `accessToken` and `refreshToken` as httpOnly cookies.
The response body contains only the user object — **no tokens in the body**.

#### Request Body
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

| Field      | Type   | Required |
|------------|--------|----------|
| `email`    | string | ✅       |
| `password` | string | ✅       |

#### Success Response — `200`
```json
{
  "code": 200,
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "phoneNumber": null,
    "photo": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

> After this call, the browser automatically holds the auth cookies.
> All subsequent API calls will be authenticated as long as cookies are valid.

#### Error Responses
| Status | errorCode             | When                    |
|--------|-----------------------|-------------------------|
| 400    | `VALIDATION_ERROR`    | Invalid fields          |
| 401    | `INVALID_CREDENTIALS` | Wrong email or password |

#### Example (fetch)
```js
const res = await fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'john@example.com', password: 'secret123' }),
})
const { data: user } = await res.json()
// Store user in your state/store — no need to store tokens
```

---

### 3. Logout

**`POST /api/auth/logout`**

Invalidates the refresh token in the database and clears both auth cookies.

#### Request Body
None — reads the `refreshToken` cookie automatically.

#### Success Response — `200`
```json
{
  "code": 200,
  "success": true,
  "message": "Logged out",
  "data": null
}
```

#### Example (fetch)
```js
await fetch('/api/auth/logout', {
  method: 'POST',
  credentials: 'include',
})
// Cookies are cleared — redirect to login
```

---

### 4. Refresh Token

**`POST /api/auth/refresh`**

Silently rotates both tokens. Reads the `refreshToken` cookie, issues new `accessToken` and `refreshToken` cookies.

> The server already handles silent refresh automatically in `getAuthUser()`.
> Call this endpoint manually only if you need to proactively refresh before a token expires.

#### Request Body
None — reads the `refreshToken` cookie automatically.

#### Success Response — `200`
```json
{
  "code": 200,
  "success": true,
  "message": "Token refreshed",
  "data": null
}
```

#### Error Responses
| Status | errorCode      | When                                                    |
|--------|----------------|---------------------------------------------------------|
| 401    | `INVALID_TOKEN`| No refresh token cookie present                         |
| 401    | `TOKEN_REUSE`  | Token was already used — **all sessions revoked**       |

> **TOKEN_REUSE**: If this error occurs, the user must log in again. All other active sessions for that user have been terminated as a security measure.

#### Example (fetch)
```js
const res = await fetch('/api/auth/refresh', {
  method: 'POST',
  credentials: 'include',
})
if (!res.ok) {
  // TOKEN_REUSE or INVALID_TOKEN — redirect to login
  window.location.href = '/login'
}
```

---

### 5. Update Profile

**`PATCH /api/auth/profile`**

Updates the authenticated user's profile. Requires a valid session (accessToken cookie).

#### Request Body (all fields optional)
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phoneNumber": "9876543210",
  "photo": "https://example.com/photo.jpg"
}
```

| Field         | Type   | Required | Rules                        |
|---------------|--------|----------|------------------------------|
| `name`        | string | ❌       | min 3 chars                  |
| `email`       | string | ❌       | valid email, must be unique  |
| `phoneNumber` | string | ❌       | min 10 chars                 |
| `photo`       | string | ❌       | valid URL or empty string    |

#### Success Response — `200`
```json
{
  "code": 200,
  "success": true,
  "message": "Profile updated",
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "USER",
    "phoneNumber": "9876543210",
    "photo": "https://example.com/photo.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

#### Error Responses
| Status | errorCode              | When                          |
|--------|------------------------|-------------------------------|
| 400    | `VALIDATION_ERROR`     | Invalid fields                |
| 401    | `UNAUTHORIZED`         | Not logged in                 |
| 409    | `EMAIL_ALREADY_EXISTS` | New email already taken       |

#### Example (fetch)
```js
const res = await fetch('/api/auth/profile', {
  method: 'PATCH',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Jane Doe' }),
})
const { data: updatedUser } = await res.json()
```

---

### 6. Forgot Password

**`POST /api/auth/forgot-password`**

Sends a password reset email to the user. The reset link contains a token valid for **15 minutes**.

#### Request Body
```json
{
  "email": "john@example.com"
}
```

#### Success Response — `200`
```json
{
  "code": 200,
  "success": true,
  "message": "Reset email sent",
  "data": null
}
```

> The reset token is **only sent via email** — it is not returned in the response.

#### Error Responses
| Status | errorCode        | When               |
|--------|------------------|--------------------|
| 400    | `VALIDATION_ERROR` | Invalid email    |
| 404    | `USER_NOT_FOUND` | Email not registered |

#### Reset Email Contains
```
Link: {FRONTEND_URL}/reset-password?token=<plainToken>
Expires: 15 minutes
```

> The frontend should extract the `token` query param from the URL and pass it to the reset password endpoint.

#### Example (fetch)
```js
await fetch('/api/auth/forgot-password', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'john@example.com' }),
})
```

---

### 7. Reset Password

**`POST /api/auth/reset-password/:token`**

Resets the user's password using the token from the reset email.

#### URL Parameter
| Param   | Description                                      |
|---------|--------------------------------------------------|
| `token` | Plain token extracted from the reset email link  |

#### Request Body
```json
{
  "password": "newpassword123"
}
```

| Field      | Type   | Required | Rules       |
|------------|--------|----------|-------------|
| `password` | string | ✅       | min 6 chars |

#### Success Response — `200`
```json
{
  "code": 200,
  "success": true,
  "message": "Password reset successful",
  "data": null
}
```

#### Error Responses
| Status | errorCode                  | When                              |
|--------|----------------------------|-----------------------------------|
| 400    | `VALIDATION_ERROR`         | Password too short                |
| 400    | `INVALID_OR_EXPIRED_TOKEN` | Token is wrong or older than 15min|

#### Example (fetch)
```js
// token comes from URL: /reset-password?token=abc123
const token = new URLSearchParams(window.location.search).get('token')

const res = await fetch(`/api/auth/reset-password/${token}`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'newpassword123' }),
})
```

---

## User Object Shape

All auth endpoints that return user data use this shape (password is never included):

```ts
type User = {
  _id: string
  name: string
  email: string
  role: 'ADMIN' | 'USER'
  phoneNumber: string | null
  photo: string | null
  createdAt: string  // ISO 8601
  updatedAt: string  // ISO 8601
}
```

---

## Recommended Frontend Setup

### Axios Instance
```js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // required — sends cookies on every request
  headers: { 'Content-Type': 'application/json' },
})

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && error.response?.data?.errorCode !== 'TOKEN_REUSE') {
      try {
        await api.post('/api/auth/refresh')
        return api.request(error.config) // retry original request
      } catch {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
```

### Auth Flow Summary
```
1. Register  → POST /api/auth/register
2. Login     → POST /api/auth/login        (cookies set automatically)
3. Use app   → all requests with credentials: 'include' / withCredentials: true
4. 401 hit   → POST /api/auth/refresh      (rotate cookies, retry request)
5. Logout    → POST /api/auth/logout       (cookies cleared)

Password reset flow:
1. POST /api/auth/forgot-password  { email }
2. User clicks link in email → /reset-password?token=xxx
3. POST /api/auth/reset-password/:token  { password }
```

---

## Security Notes for Frontend

- Never store tokens in `localStorage` or `sessionStorage` — cookies handle this automatically
- Always use `credentials: 'include'` on every API call
- On `TOKEN_REUSE` (401) — force logout immediately, all sessions are already revoked
- The `accessToken` expires in **59 minutes**, `refreshToken` in **7 days**
- In production, cookies are `Secure` (HTTPS only) and `HttpOnly`
