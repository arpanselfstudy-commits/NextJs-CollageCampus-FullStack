'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { listedProductsApi } from '../api/marketplace.api'
import { queryKeys } from '@/lib/react-query/queryKeys'
import type { ListedProductPayload, ListedProductsParams } from '../types'

export function useListedProducts(params?: ListedProductsParams) {
  return useQuery({
    queryKey: queryKeys.listedProducts.all(params),
    queryFn: () => listedProductsApi.getAll(params).then((r) => r.data.data),
  })
}

export function useMyListedProducts(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['listed-products', 'mine', params],
    queryFn: () => listedProductsApi.myProducts(params).then((r) => r.data.data),
    staleTime: 0,
  })
}

export function useListedProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.listedProducts.byId(id),
    queryFn: () => listedProductsApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  })
}

export function useCreateListedProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ListedProductPayload) =>
      listedProductsApi.create(payload).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listed-products'] })
      toast.success('Product listed successfully!')
    },
    onError: () => toast.error('Failed to list product.'),
  })
}

export function useUpdateListedProduct(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ListedProductPayload) =>
      listedProductsApi.update(id, payload).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listed-products'] })
      toast.success('Product updated!')
    },
    onError: () => toast.error('Failed to update product.'),
  })
}

export function useDeleteListedProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => listedProductsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listed-products'] })
      toast.success('Product removed.')
    },
    onError: () => toast.error('Failed to delete product.'),
  })
}