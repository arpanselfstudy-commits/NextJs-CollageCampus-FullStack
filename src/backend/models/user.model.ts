import mongoose, { Schema, Document } from 'mongoose'
import { UserRole, IUser } from '../types/backend.types'

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
    phoneNumber: { type: String },
    photo: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
)

export const UserModel = mongoose.models.User ?? mongoose.model<IUserDocument>('User', UserSchema)
