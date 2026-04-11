'use client'

import { useQuery } from '@tanstack/react-query'
import { userApi } from '../api/user.api'
import { queryKeys } from '@/lib/react-query/queryKeys'
import type { UsersResponse, UserResponse } from '../types'

export function useUsers() {
  return useQuery<UsersResponse>({
    queryKey: queryKeys.users.all,
    queryFn: () => userApi.getAll().then((res) => res.data),
  })
}

export function useUser(id: string) {
  return useQuery<UserResponse>({
    queryKey: queryKeys.users.byId(id),
    queryFn: () => userApi.getById(id).then((res) => res.data),
    enabled: !!id,
  })
}
