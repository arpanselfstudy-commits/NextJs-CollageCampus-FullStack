'use client'

import { useQuery } from '@tanstack/react-query'
import { shopsApi } from '../api/shops.api'
import { queryKeys } from '@/lib/react-query/queryKeys'
import type { ShopsParams } from '../types'

export function useShops(params?: ShopsParams) {
  return useQuery({
    queryKey: queryKeys.shops.all(params),
    queryFn: () => shopsApi.getAll(params).then((r) => r.data.data),
  })
}

export function useShop(shopId: string) {
  return useQuery({
    queryKey: queryKeys.shops.byId(shopId),
    queryFn: () => shopsApi.getById(shopId).then((r) => r.data.data),
    enabled: !!shopId,
  })
}
