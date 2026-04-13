'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { resetPasswordSchema, type ResetPasswordFormValues } from '../validation'
import { useResetPassword } from './useResetPassword'

export function useResetPasswordForm(token: string) {
  const mutation = useResetPassword(token)

  const { register, handleSubmit, formState, watch } = useForm<ResetPasswordFormValues>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit((data) => mutation.mutate(data.password))

  return { register, handleSubmit, formState, watch, onSubmit, mutation }
}
