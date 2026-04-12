import { ZodType, ZodError } from 'zod'
import { AppError } from './appError'

export function validate<T>(schema: ZodType<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (err) {
    if (err instanceof ZodError) {
      const details = err.issues.map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : 'value'
        return `${path}: ${issue.message}`
      })
      throw new AppError(details.join(', '), 400, 'VALIDATION_ERROR', details)
    }
    throw err
  }
}
