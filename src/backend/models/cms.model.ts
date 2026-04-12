import mongoose, { Schema, Document } from 'mongoose'
import { ICms, CmsType } from '../types/backend.types'

export { CmsType }

export interface ICmsDocument extends Omit<ICms, '_id'>, Document {}

const CmsSchema = new Schema<ICmsDocument>(
  {
    cmsId: { type: String, required: true, unique: true, trim: true },
    type: { type: String, required: true, unique: true, trim: true, uppercase: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const CmsModel = mongoose.models.Cms ?? mongoose.model<ICmsDocument>('Cms', CmsSchema)
