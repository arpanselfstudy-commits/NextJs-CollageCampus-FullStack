import { connectDB } from '../lib/db'
import { AppError } from '../lib/appError'
import { ShopModel } from '../models/shop.model'
import { IShop } from '../types/backend.types'
import { z } from 'zod'
import { createShopSchema, updateShopSchema } from '../validators/shop.validator'

type CreateShopInput = z.infer<typeof createShopSchema>
type UpdateShopInput = z.infer<typeof updateShopSchema>

async function generateShopId(): Promise<string> {
  while (true) {
    const id = `Shop-${Math.floor(1000 + Math.random() * 9000)}`
    const exists = await ShopModel.findOne({ shopId: id })
    if (!exists) return id
  }
}

export async function createShop(data: CreateShopInput, userId: string): Promise<IShop> {
  await connectDB()
  const shopId = await generateShopId()
  const shop = await ShopModel.create({ ...data, shopId, createdBy: userId })
  return shop.toObject() as IShop
}

export async function updateShop(id: string, data: UpdateShopInput): Promise<IShop> {
  await connectDB()
  const shop = await ShopModel.findByIdAndUpdate(id, data, { new: true, runValidators: true })
  if (!shop) throw new AppError('Shop not found', 404, 'NOT_FOUND')
  return shop.toObject() as IShop
}

export async function deleteShop(id: string): Promise<void> {
  await connectDB()
  const shop = await ShopModel.findByIdAndDelete(id)
  if (!shop) throw new AppError('Shop not found', 404, 'NOT_FOUND')
}

export async function getShops(filters: {
  page?: number
  limit?: number
  search?: string
  distance?: string
  openDay?: string
}) {
  await connectDB()
  const { page = 1, limit = 10, search, distance, openDay } = filters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {}

  if (search) {
    const regex = new RegExp(search, 'i')
    query.$or = [{ name: regex }, { topItems: regex }, { allItems: regex }]
  }
  if (distance) query.distance = distance
  if (openDay) query[`shopTiming.${openDay}.isOpen`] = true

  const skip = (page - 1) * limit
  const [shops, total] = await Promise.all([
    ShopModel.find(query).skip(skip).limit(limit).lean(),
    ShopModel.countDocuments(query),
  ])

  return {
    shops,
    total,
    page,
    limit,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  }
}

export async function getShopById(id: string): Promise<IShop> {
  await connectDB()
  const shop = await ShopModel.findById(id).lean()
  if (!shop) throw new AppError('Shop not found', 404, 'NOT_FOUND')
  return shop as unknown as IShop
}
