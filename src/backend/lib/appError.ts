export class AppError extends Error {
  statusCode: number
  errorCode: string
  isOperational = true
  details?: unknown[]

  constructor(message: string, statusCode: number, errorCode = 'ERROR', details?: unknown[]) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.details = details
    Error.captureStackTrace(this, this.constructor)
  }
}
