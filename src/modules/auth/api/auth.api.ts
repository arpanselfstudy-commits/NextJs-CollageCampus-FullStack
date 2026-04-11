import { apiClient } from '@/lib/axios/axiosClient'
import type { LoginCredentials, RegisterCredentials, AuthUser, AuthTokens } from '../types'

interface ApiResponse<T> {
  code: number
  success: boolean
  message: string
  data: T
}

export const authApi = {
  register: (body: RegisterCredentials) =>
    apiClient.post<ApiResponse<AuthUser>>('/api/auth/register', body),

  login: (body: LoginCredentials) =>
    apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string; user: AuthUser }>>(
      '/api/auth/login',
      body
    ),

  logout: (refreshToken: string) =>
    apiClient.post<ApiResponse<null>>('/api/auth/logout', { refreshToken }),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthTokens>>('/api/auth/refresh', { refreshToken }),

  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<{ resetToken: string }>>('/api/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post<ApiResponse<null>>(`/api/auth/reset-password/${token}`, { password }),

  getProfile: () =>
    apiClient.get<ApiResponse<AuthUser>>('/api/auth/profile'),

  updateProfile: (payload: { name: string; email: string; phoneNumber: string; photo: string }) =>
    apiClient.patch<ApiResponse<AuthUser>>('/api/auth/profile', payload),
}
