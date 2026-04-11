'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth.api'

export function useResetPassword(token: string) {
  const router = useRouter()

  return useMutation({
    mutationFn: (password: string) =>
      authApi.resetPassword(token, password).then((res) => res.data),
    onSuccess: () => {
      toast.success('Password reset! Please sign in.')
      router.push('/login')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to reset password.')
    },
  })
}
