'use client'

import { useQuery } from '@tanstack/react-query'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import { queryKeys } from '@/lib/react-query/queryKeys'

export function useProfile() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: () => authApi.getProfile().then((res) => res.data.data),
    enabled: isAuthenticated,
    staleTime: 0,
  })
}
