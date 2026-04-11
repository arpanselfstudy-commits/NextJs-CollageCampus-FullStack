'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { requestedProductsApi } from '../api/marketplace.api'
import { queryKeys } from '@/lib/react-query/queryKeys'
import type { RequestedProductPayload, RequestedProductsParams } from '../types'

export function useRequestedProducts(params?: RequestedProductsParams) {
  return useQuery({
    queryKey: queryKeys.requestedProducts.all(params),
    queryFn: () => requestedProductsApi.getAll(params).then((r) => r.data.data),
  })
}

export function useMyRequestedProducts(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['requested-products', 'mine', params],
    queryFn: () => requestedProductsApi.myRequests(params).then((r) => r.data.data),
    staleTime: 0,
  })
}

export function useRequestedProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.requestedProducts.byId(id),
    queryFn: () => requestedProductsApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  })
}

export function useCreateRequestedProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: RequestedProductPayload) =>
      requestedProductsApi.create(payload).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requested-products'] })
      toast.success('Request posted successfully!')
    },
    onError: () => toast.error('Failed to post request.'),
  })
}

export function useUpdateRequestedProduct(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: RequestedProductPayload) =>
      requestedProductsApi.update(id, payload).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requested-products'] })
      toast.success('Request updated!')
    },
    onError: () => toast.error('Failed to update request.'),
  })
}

export function useDeleteRequestedProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => requestedProductsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requested-products'] })
      toast.success('Request removed.')
    },
    onError: () => toast.error('Failed to delete request.'),
  })
}
