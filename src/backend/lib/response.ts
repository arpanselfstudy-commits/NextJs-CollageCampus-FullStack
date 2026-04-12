import { NextResponse } from 'next/server'

export function sendSuccess<T>(data: T, message = 'OK', statusCode = 200): NextResponse {
  return NextResponse.json(
    { code: statusCode, success: true, message, data },
    { status: statusCode }
  )
}

// Manual error helper — prefer withErrorHandler for route handlers
export function sendError(message: string, statusCode = 500, errorCode = 'ERROR'): NextResponse {
  return NextResponse.json(
    { code: statusCode, success: false, message, errorCode, data: null },
    { status: statusCode }
  )
}
