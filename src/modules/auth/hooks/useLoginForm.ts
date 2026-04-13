'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { loginSchema, type LoginFormValues } from '../validation'
import { useLogin } from './useLogin'

export function useLoginForm() {
  const mutation = useLogin()

  const { register, handleSubmit, formState } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit((data) => mutation.mutate(data))

  return { register, handleSubmit, formState, onSubmit, mutation }
}
