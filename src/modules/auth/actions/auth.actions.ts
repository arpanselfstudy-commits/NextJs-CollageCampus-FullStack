'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { loginUser, registerUser, forgotPassword, resetPassword } from '@/backend/services/auth.service'
import { setAuthCookies } from '@/backend/lib/cookies'
import { AppError } from '@/backend/lib/appError'

export type ActionState = {
  success: boolean
  message: string
  // for forgot-password success UI
  email?: string
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, message: 'Email and password are required.' }
  }

  try {
    const hdrs = await headers()
    const deviceInfo = {
      ip: hdrs.get('x-forwarded-for') ?? undefined,
      name: hdrs.get('user-agent') ?? undefined,
    }
    const { accessToken, refreshToken, user } = await loginUser(email, password, deviceInfo)
    await setAuthCookies(accessToken, refreshToken)
    // store user in a cookie so the client can hydrate the auth store
    const { cookies } = await import('next/headers')
    const store = await cookies()
    store.set('auth-user', JSON.stringify(user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 900,
    })
  } catch (err) {
    const msg = err instanceof AppError ? err.message : 'Login failed. Please try again.'
    return { success: false, message: msg }
  }

  // Return success so the client can hydrate the store first, then navigate
  return { success: true, message: '' }
}

// ─── Register ─────────────────────────────────────────────────────────────────
export async function registerAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!name || !email || !password || !confirmPassword) {
    return { success: false, message: 'All fields are required.' }
  }
  if (password !== confirmPassword) {
    return { success: false, message: 'Passwords do not match.' }
  }
  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters.' }
  }

  try {
    await registerUser({ name, email, password })
  } catch (err) {
    const msg = err instanceof AppError ? err.message : 'Registration failed. Please try again.'
    return { success: false, message: msg }
  }

  redirect('/login')
}

// ─── Forgot Password ──────────────────────────────────────────────────────────
export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get('email') as string

  if (!email) {
    return { success: false, message: 'Email is required.' }
  }

  try {
    await forgotPassword(email)
  } catch (err) {
    const msg = err instanceof AppError ? err.message : 'Failed to send reset link.'
    return { success: false, message: msg }
  }

  return { success: true, message: 'Reset link sent! Check your email.', email }
}

// ─── Reset Password ───────────────────────────────────────────────────────────
export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const token = formData.get('token') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!token) {
    return { success: false, message: 'Invalid or missing reset token.' }
  }
  if (!password || !confirmPassword) {
    return { success: false, message: 'Both password fields are required.' }
  }
  if (password !== confirmPassword) {
    return { success: false, message: 'Passwords do not match.' }
  }
  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters.' }
  }

  try {
    await resetPassword(token, password)
  } catch (err) {
    const msg = err instanceof AppError ? err.message : 'Failed to reset password.'
    return { success: false, message: msg }
  }

  redirect('/login')
}
