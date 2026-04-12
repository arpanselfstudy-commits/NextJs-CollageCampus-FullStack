import mongoose, { Schema, Document, Types } from 'mongoose'
import { IRefreshToken } from '../types/backend.types'

export interface IRefreshTokenDocument extends Omit<IRefreshToken, '_id' | 'userId'>, Document {
  userId: Types.ObjectId
}

const RefreshTokenSchema = new Schema<IRefreshTokenDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    deviceInfo: {
      type: {
        ip: { type: String },
        name: { type: String },
      },
      _id: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const RefreshTokenModel =
  mongoose.models.RefreshToken ??
  mongoose.model<IRefreshTokenDocument>('RefreshToken', RefreshTokenSchema)
