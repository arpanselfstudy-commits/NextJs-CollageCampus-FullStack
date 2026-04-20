import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
  'http://localhost:5174',
]

function setCorsHeaders(res: NextResponse, origin: string) {
  res.headers.set('Access-Control-Allow-Origin', origin)
  res.headers.set('Access-Control-Allow-Credentials', 'true')
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const origin = req.headers.get('origin') ?? '' 

  // Handle CORS for /api/* routes
  if (pathname.startsWith('/api/')) {
    const isAllowed = ALLOWED_ORIGINS.includes(origin)

    // Preflight - not an api call its a call by brouser to check what all headers and methods are allowed
    if (req.method === 'OPTIONS') {
      const res = new NextResponse(null, { status: 204 })
      if (isAllowed) setCorsHeaders(res, origin)
      return res
    }

    // actual api call  
    const res = NextResponse.next()
    if (isAllowed) setCorsHeaders(res, origin)
    return res
  }

  // Redirect root to landing/dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/landing', req.url))
  }

  // I am done inspecting this request. Continue normal processing. , do not block , redirect , or rewrte , just go for next step.
  return NextResponse.next()
}

// This controls where proxy runs.
// without this matcher proxy will run on every route including static assets. eg: images, css, 
// js buindels, fonts 
// this rejex means run proxy on everything except _next/static, _next/image, favicon.ico and everything in public folder

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
