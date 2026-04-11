'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth.api'
import type { RegisterCredentials } from '../types'

export function useRegister() {
  const router = useRouter()

  return useMutation({
    mutationFn: (body: RegisterCredentials) =>
      authApi.register(body).then((res) => res.data.data),
    onSuccess: () => {
      toast.success('Account created! Please sign in.')
      router.push('/login')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Registration failed. Please try again.')
    },
  })
}
