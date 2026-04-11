import { apiClient } from '@/lib/axios/axiosClient'
import type {
  ListedProduct, ListedProductPayload, ListedProductsResponse, ListedProductsParams,
  RequestedProduct, RequestedProductPayload, RequestedProductsResponse, RequestedProductsParams,
} from '../types'

interface ApiResponse<T> { code: number; success: boolean; message: string; data: T }

export const listedProductsApi = {
  getAll: (params?: ListedProductsParams) =>
    apiClient.get<ApiResponse<ListedProductsResponse>>('/api/listed-products', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<ListedProduct>>(`/api/listed-products/${id}`),

  create: (payload: ListedProductPayload) =>
    apiClient.post<ApiResponse<ListedProduct>>('/api/listed-products', payload),

  update: (id: string, payload: ListedProductPayload) =>
    apiClient.put<ApiResponse<ListedProduct>>(`/api/listed-products/${id}`, payload),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/api/listed-products/${id}`),

  myProducts: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<ListedProductsResponse>>('/api/listed-products/my-products', { params }),
}

export const requestedProductsApi = {
  getAll: (params?: RequestedProductsParams) =>
    apiClient.get<ApiResponse<RequestedProductsResponse>>('/api/requested-products', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<RequestedProduct>>(`/api/requested-products/${id}`),

  create: (payload: RequestedProductPayload) =>
    apiClient.post<ApiResponse<RequestedProduct>>('/api/requested-products', payload),

  update: (id: string, payload: RequestedProductPayload) =>
    apiClient.put<ApiResponse<RequestedProduct>>(`/api/requested-products/${id}`, payload),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/api/requested-products/${id}`),

  myRequests: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<RequestedProductsResponse>>('/api/requested-products/my-requests', { params }),
}
