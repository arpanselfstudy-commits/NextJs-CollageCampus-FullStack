import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { connectDB } from '../lib/db'
import { generateAccessToken, generateRefreshToken, hashToken } from '../lib/jwt'
import { sendResetPasswordEmail } from '../lib/mailer'
import { AppError } from '../lib/appError'
import { env } from '../lib/env'
import { UserModel } from '../models/user.model'
import { RefreshTokenModel } from '../models/refreshToken.model'
import type { IUser } from '../types/backend.types'

type UserWithoutPassword = Omit<IUser, 'password'>

export async function registerUser(data: {
  name: string
  email: string
  password: string
}): Promise<UserWithoutPassword> {
  await connectDB()

  const existing = await UserModel.findOne({ email: data.email })
  if (existing) {
    throw new AppError('Email already in use', 409, 'EMAIL_ALREADY_EXISTS')
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)

  const user = new UserModel({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  })
  await user.save()

  const { password: _p1, ...userObj } = user.toObject() as IUser & { password?: string }
  return userObj as UserWithoutPassword
}

export async function loginUser(
  email: string,
  password: string,
  deviceInfo?: { ip?: string; name?: string }
): Promise<{ accessToken: string; refreshToken: string; user: UserWithoutPassword }> {
  await connectDB()

  const user = await UserModel.findOne({ email })
  if (!user) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
  }

  const userId = (user._id as { toString(): string }).toString()
  const accessToken = generateAccessToken(userId)
  const refreshToken = generateRefreshToken(userId)

  await RefreshTokenModel.create({
    userId: user._id,
    token: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    deviceInfo,
  })

  const { password: _p2, ...userObj } = user.toObject() as IUser & { password?: string }
  return { accessToken, refreshToken, user: userObj as UserWithoutPassword }
}

export async function refreshUserToken(
  token: string,
  deviceInfo?: { ip?: string; name?: string }
): Promise<{ accessToken: string; refreshToken: string }> {
  await connectDB()

  let decoded: { id: string }
  try {
    decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string }
  } catch {
    throw new AppError('Invalid token', 401, 'INVALID_TOKEN')
  }

  const hashedToken = hashToken(token)
  const storedToken = await RefreshTokenModel.findOne({ token: hashedToken })

  if (!storedToken) {
    await RefreshTokenModel.deleteMany({ userId: decoded.id })
    throw new AppError('Token reuse detected', 401, 'TOKEN_REUSE')
  }

  const newAccessToken = generateAccessToken(decoded.id)
  const newRefreshToken = generateRefreshToken(decoded.id)

  storedToken.token = hashToken(newRefreshToken)
  storedToken.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  if (deviceInfo) storedToken.deviceInfo = deviceInfo
  await storedToken.save()

  return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}

export async function logoutUser(token: string): Promise<void> {
  await connectDB()
  await RefreshTokenModel.deleteOne({ token: hashToken(token) })
}

export async function forgotPassword(email: string): Promise<string> {
  await connectDB()

  const user = await UserModel.findOne({ email })
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }

  const plainToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex')

  user.resetPasswordToken = hashedToken
  user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000)
  await user.save()

  await sendResetPasswordEmail(email, plainToken)

  return plainToken
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await connectDB()

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  const user = await UserModel.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: new Date() },
  })

  if (!user) {
    throw new AppError('Invalid or expired token', 400, 'INVALID_OR_EXPIRED_TOKEN')
  }

  user.password = await bcrypt.hash(newPassword, 10)
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined
  await user.save()
}

export async function updateProfile(
  userId: string,
  data: Partial<Pick<IUser, 'name' | 'email' | 'phoneNumber' | 'photo'>>
): Promise<UserWithoutPassword> {
  await connectDB()

  const user = await UserModel.findById(userId)
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }

  if (data.email && data.email !== user.email) {
    const existing = await UserModel.findOne({ email: data.email })
    if (existing) {
      throw new AppError('Email already in use', 409, 'EMAIL_ALREADY_EXISTS')
    }
  }

  Object.assign(user, data)
  await user.save()

  const { password: _p3, ...userObj } = user.toObject() as IUser & { password?: string }
  return userObj as UserWithoutPassword
}
