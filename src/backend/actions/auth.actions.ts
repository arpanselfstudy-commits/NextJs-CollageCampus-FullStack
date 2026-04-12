'use server'

import { cookies } from 'next/headers'
import { validate } from '../lib/validate'
import { setAuthCookies, clearAuthCookies } from '../lib/cookies'
import { loginUser, registerUser, logoutUser, updateProfile } from '../services/auth.service'
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from '../validators/auth.validator'
import type { IUser } from '../types/backend.types'

type AuthUser = Omit<IUser, 'password'>

export async function loginAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    const data = validate(loginSchema, {
      email: formData.get('email'),
      password: formData.get('password'),
    })
    const deviceInfo = { name: 'server-action' }
    const { accessToken, refreshToken, user } = await loginUser(data.email, data.password, deviceInfo)
    await setAuthCookies(accessToken, refreshToken)
    return { success: true, user }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Login failed' }
  }
}

export async function registerAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const data = validate(registerSchema, {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    })
    await registerUser(data)
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Registration failed' }
  }
}

export async function logoutAction(): Promise<void> {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refreshToken')?.value
    if (refreshToken) await logoutUser(refreshToken)
  } catch {
    // ignore errors during logout
  } finally {
    await clearAuthCookies()
  }
}

export async function updateProfileAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    const raw: Record<string, unknown> = {}
    if (formData.get('name')) raw.name = formData.get('name')
    if (formData.get('email')) raw.email = formData.get('email')
    if (formData.get('phoneNumber')) raw.phoneNumber = formData.get('phoneNumber')
    if (formData.get('photo') !== null) raw.photo = formData.get('photo')

    const data = validate(updateProfileSchema, raw)

    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value
    if (!accessToken) return { success: false, error: 'Not authenticated' }

    const jwt = await import('jsonwebtoken')
    const env = await import('../lib/env')
    const decoded = jwt.default.verify(accessToken, env.env.JWT_ACCESS_SECRET) as { id: string }

    const user = await updateProfile(decoded.id, data)
    return { success: true, user }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Update failed' }
  }
}
