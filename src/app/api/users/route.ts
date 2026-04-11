import { NextRequest } from 'next/server'
import { UserService } from '@/backend/services/user.service'
import { sendSuccess, sendError } from '@/backend/lib/response'

export async function GET(_req: NextRequest) {
  try {
    const users = await UserService.getAll()
    return sendSuccess(users)
  } catch (err) {
    return sendError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const user = await UserService.create(body)
    return sendSuccess(user, 201)
  } catch (err) {
    return sendError(err)
  }
}
