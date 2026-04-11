import { NextRequest, NextResponse } from 'next/server'

// Auth pages — redirect to dashboard if already logged in (handled client-side)
// This middleware only handles static-level public/private routing hints.
// Real auth enforcement is done client-side in ProtectedLayout (Zustand store).

const AUTH_PATHS = ['/login', '/register', '/forgot-password']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow everything through — client-side ProtectedLayout handles the guard.
  // Middleware here is intentionally minimal since we have no server-side
  // access to the external backend's JWT secret.
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/|design|api/).*)'],
}
