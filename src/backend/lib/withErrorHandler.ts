import { NextRequest, NextResponse } from 'next/server'
import { AppError } from './appError'

type Handler = (
  req: NextRequest,
  ctx?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>

export function withErrorHandler(handler: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx)
    } catch (err) {
      if (err instanceof AppError) {
        return NextResponse.json(
          {
            code: err.statusCode,
            success: false,
            message: err.message,
            errorCode: err.errorCode,
            data: null,
            ...(err.details ? { details: err.details } : {}),
          },
          { status: err.statusCode }
        )
      }

      const message =
        process.env.NODE_ENV === 'production'
          ? 'Internal Server Error'
          : err instanceof Error
            ? err.message
            : String(err)

      return NextResponse.json(
        {
          code: 500,
          success: false,
          message,
          errorCode: 'INTERNAL_SERVER_ERROR',
          data: null,
        },
        { status: 500 }
      )
    }
  }
}
