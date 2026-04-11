import { apiClient } from './axiosClient'

export function createApi(basePath: string) {
  return {
    get: <T>(path = '') => apiClient.get<T>(`${basePath}${path}`),
    post: <T>(path = '', data?: unknown) => apiClient.post<T>(`${basePath}${path}`, data),
    put: <T>(path = '', data?: unknown) => apiClient.put<T>(`${basePath}${path}`, data),
    patch: <T>(path = '', data?: unknown) => apiClient.patch<T>(`${basePath}${path}`, data),
    delete: <T>(path = '') => apiClient.delete<T>(`${basePath}${path}`),
  }
}
