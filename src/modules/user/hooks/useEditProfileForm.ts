'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { editProfileSchema } from '@/modules/user/validation'
import type { EditProfileForm } from '@/modules/user/types'

export function useEditProfileForm() {
  const user = useAuthStore((s) => s.user)

  const { register, handleSubmit, formState, reset } = useForm<EditProfileForm>({
    resolver: yupResolver(editProfileSchema),
  })

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email, phoneNumber: user.phoneNumber ?? '' })
  }, [user, reset])

  return { register, handleSubmit, formState, reset }
}
