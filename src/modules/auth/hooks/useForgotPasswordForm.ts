'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../validation'
import { useForgotPassword } from './useForgotPassword'

export function useForgotPasswordForm() {
  const mutation = useForgotPassword()

  const { register, handleSubmit, formState, watch } = useForm<ForgotPasswordFormValues>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = handleSubmit((data) => mutation.mutate(data.email))

  return { register, handleSubmit, formState, watch, onSubmit, mutation }
}
