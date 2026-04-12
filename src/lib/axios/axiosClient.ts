import axios, { AxiosInstance } from 'axios'

/**
 * Migrated to cookie-based auth.
 * - baseURL is '/' so requests hit Next.js Route Handlers directly
 * - withCredentials: true sends httpOnly cookies automatically
 * - No Authorization header injection — tokens are managed via httpOnly cookies
 * - Refresh interceptor calls POST /api/auth/refresh (no body needed, cookie is read server-side)
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 10_000,
})

let isRefreshing = false
let failedQueue: Array<{ resolve: () => void; reject: (err: unknown) => void }> = []

function processQueue(error: unknown) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()))
  failedQueue = []
}

// No Authorization header injection — cookies handle auth
apiClient.interceptors.request.use((config) => config)

// On 401 — attempt silent token refresh via cookie, then replay queued requests
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
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      // No body needed — the refreshToken httpOnly cookie is sent automatically
      // Use a raw axios call (not apiClient) to avoid the interceptor loop
      await axios.post('/api/auth/refresh', null, { withCredentials: true })
      processQueue(null)
      return apiClient(originalRequest)
    } catch (err) {
      processQueue(err)
      if (typeof window !== 'undefined') {
        // Dynamically import to avoid SSR issues
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
