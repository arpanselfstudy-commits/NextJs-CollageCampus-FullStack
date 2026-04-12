import { cookies } from 'next/headers'

const IS_PROD = process.env.NODE_ENV === 'production'

export async function setAuthCookies(accessToken: string, refreshToken: string): Promise<void> {
  const store = await cookies()
  store.set('accessToken', accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: 3540,
  })
  store.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: 604800,
  })
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies()
  store.set('accessToken', '', { httpOnly: true, path: '/', maxAge: 0 })
  store.set('refreshToken', '', { httpOnly: true, path: '/', maxAge: 0 })
}
