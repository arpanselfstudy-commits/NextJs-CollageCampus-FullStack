import mongoose, { Schema, Document, Types } from 'mongoose'
import { IRequestedProduct } from '../types/backend.types'
import { ProductCategory } from './listedProduct.model'

export { ProductCategory }

export interface IRequestedProductDocument extends Omit<IRequestedProduct, '_id' | 'user'>, Document {
  user: Types.ObjectId
}

const contactDetailsSchema = new Schema(
  {
    phoneNo: { type: String, required: true },
    email: { type: String, required: true },
  },
  { _id: false }
)

const priceRangeSchema = new Schema(
  {
    from: { type: Number, required: true, min: 0 },
    to: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const RequestedProductSchema = new Schema<IRequestedProductDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    images: [{ type: String }],
    category: { type: String, enum: Object.values(ProductCategory), required: true },
    price: { type: priceRangeSchema, required: true },
    isNegotiable: { type: Boolean, required: true, default: false },
    description: { type: String, required: true },
    contactDetails: { type: contactDetailsSchema, required: true },
    isFulfilled: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
)

export const RequestedProductModel =
  mongoose.models.RequestedProduct ??
  mongoose.model<IRequestedProductDocument>('RequestedProduct', RequestedProductSchema)
