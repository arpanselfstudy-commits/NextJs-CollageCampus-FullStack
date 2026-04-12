import { AppError } from './appError'
import { IUser, UserRole } from '../types/backend.types'

export { UserRole }

export function authorize(user: IUser | null, ...roles: UserRole[]): IUser {
  if (user === null) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
  }
  if (!roles.includes(user.role)) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }
  return user
}
