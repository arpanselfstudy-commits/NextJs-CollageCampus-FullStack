import { apiClient } from '@/lib/axios/axiosClient'

export const userApi = {
  getAll: () => apiClient.get('/api/users'),
  getById: (id: string) => apiClient.get(`/api/users/${id}`),
}
