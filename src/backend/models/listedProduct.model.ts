import mongoose, { Schema, Document, Types } from 'mongoose'
import { IListedProduct, ProductCategory, ProductCondition } from '../types/backend.types'

export { ProductCategory, ProductCondition }

export interface IListedProductDocument extends Omit<IListedProduct, '_id' | 'user'>, Document {
  user: Types.ObjectId
}

const contactDetailsSchema = new Schema(
  {
    phoneNo: { type: String, required: true },
    email: { type: String, required: true },
  },
  { _id: false }
)

const ListedProductSchema = new Schema<IListedProductDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productName: { type: String, required: true, trim: true },
    images: [{ type: String, required: true }],
    category: { type: String, enum: Object.values(ProductCategory), required: true },
    condition: { type: String, enum: Object.values(ProductCondition), required: true },
    price: { type: String, required: true },
    isNegotiable: { type: Boolean, required: true, default: false },
    description: { type: String, required: true },
    yearUsed: { type: Number, required: true, min: 0 },
    contactDetails: { type: contactDetailsSchema, required: true },
    isAvailable: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
)

export const ListedProductModel =
  mongoose.models.ListedProduct ??
  mongoose.model<IListedProductDocument>('ListedProduct', ListedProductSchema)
