'use client'

import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth.api'

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      authApi.forgotPassword(email).then((res) => res.data),
    onSuccess: (data) => {
      toast.success(data.message ?? 'Reset link sent! Check your email.')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to send reset link.')
    },
  })
}
