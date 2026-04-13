'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { updateProfileSchema, type UpdateProfileFormValues } from '../validation'
import { useUpdateProfile } from './useUpdateProfile'
import { useAuthStore } from '../store/auth.store'

export function useUpdateProfileForm() {
  const mutation = useUpdateProfile()
  const user = useAuthStore((s) => s.user)

  const { register, handleSubmit, formState, reset } = useForm<UpdateProfileFormValues>({
    resolver: yupResolver(updateProfileSchema),
  })

  useEffect(() => {
    if (user) {
      reset({ name: user.name, email: user.email, phoneNumber: user.phoneNumber ?? '' })
    }
  }, [user, reset])

  const onSubmit = handleSubmit((data) =>
    mutation.mutate({ ...data, photo: user?.photo ?? '' })
  )

  return { register, handleSubmit, formState, onSubmit, mutation }
}
