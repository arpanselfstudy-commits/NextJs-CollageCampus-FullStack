'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import { queryKeys } from '@/lib/react-query/queryKeys'

export function useUpdateProfile() {
  const qc = useQueryClient()
  const { user, accessToken, refreshToken, setAuth } = useAuthStore()

  return useMutation({
    mutationFn: (payload: { name: string; email: string; phoneNumber: string; photo: string }) =>
      authApi.updateProfile(payload).then((r) => r.data.data),
    onSuccess: (updated) => {
      // Sync updated user back into the store
      if (accessToken && refreshToken) {
        setAuth(updated, accessToken, refreshToken)
      }
      qc.invalidateQueries({ queryKey: queryKeys.auth.profile })
      toast.success('Profile updated!')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to update profile.')
    },
  })
}
