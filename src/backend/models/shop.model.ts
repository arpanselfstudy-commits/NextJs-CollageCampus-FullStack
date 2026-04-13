import mongoose, { Schema, Document, Types } from 'mongoose'
import { IShop } from '../types/backend.types'

export interface IShopDocument extends Omit<IShop, '_id' | 'createdBy'>, Document {
  createdBy: Types.ObjectId
}

const dayTimingSchema = new Schema(
  {
    isOpen: { type: Boolean, required: true },
    opensAt: { type: String, default: null },
    closesAt: { type: String, default: null },
  },
  { _id: false }
)

const shopTimingSchema = new Schema(
  {
    monday: { type: dayTimingSchema, required: true },
    tuesday: { type: dayTimingSchema, required: true },
    wednesday: { type: dayTimingSchema, required: true },
    thursday: { type: dayTimingSchema, required: true },
    friday: { type: dayTimingSchema, required: true },
    saturday: { type: dayTimingSchema, required: true },
    sunday: { type: dayTimingSchema, required: true },
  },
  { _id: false }
)

const contactDetailsSchema = new Schema(
  {
    email: { type: String, required: true },
    phoneNo: { type: String, required: true },
  },
  { _id: false }
)

const ShopSchema = new Schema<IShopDocument>(
  {
    name: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shopId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    location: { type: String, required: true },
    distance: { type: String },
    photo: { type: String },
    photos: [{ type: String }],
    poster: { type: String },
    topItems: [{ type: String }],
    allItems: [{ type: String }],
    contactDetails: { type: contactDetailsSchema, required: true },
    shopTiming: { type: shopTimingSchema, required: true },
  },
  { timestamps: true }
)

export const ShopModel = mongoose.models.Shop ?? mongoose.model<IShopDocument>('Shop', ShopSchema)
