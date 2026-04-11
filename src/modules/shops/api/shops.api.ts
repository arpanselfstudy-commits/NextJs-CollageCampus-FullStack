import { apiClient } from '@/lib/axios/axiosClient'
import type { Shop, ShopsResponse, ShopsParams } from '../types'

interface ApiResponse<T> { code: number; success: boolean; message: string; data: T }

export const shopsApi = {
  getAll: (params?: ShopsParams) =>
    apiClient.get<ApiResponse<ShopsResponse>>('/api/shops', { params }),

  getById: (shopId: string) =>
    apiClient.get<ApiResponse<Shop>>(`/api/shops/${shopId}`),
}
