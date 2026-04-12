import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const forgotPasswordSchema = z.object({ email: z.string().email() })

export const resetPasswordSchema = z.object({ password: z.string().min(6) })

export const updateProfileSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().min(10).optional(),
  photo: z.union([z.string().url(), z.literal('')]).optional(),
})
