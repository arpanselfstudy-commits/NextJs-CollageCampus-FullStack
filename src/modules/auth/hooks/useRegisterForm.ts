'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { registerSchema, type RegisterFormValues } from '../validation'
import { useRegister } from './useRegister'

export function useRegisterForm() {
  const mutation = useRegister()

  const { register, handleSubmit, formState, watch } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit((data) => {
    const { confirmPassword: _, ...creds } = data
    mutation.mutate(creds)
  })

  return { register, handleSubmit, formState, watch, onSubmit, mutation }
}
