import { connectDB } from '../lib/db'
import { AppError } from '../lib/appError'
import { ShopModel } from '../models/shop.model'
import { IShop } from '../types/backend.types'
import { z } from 'zod'
import { createShopSchema, updateShopSchema, createOfferSchema } from '../validators/shop.validator'

type CreateShopInput = z.infer<typeof createShopSchema>
type UpdateShopInput = z.infer<typeof updateShopSchema>
type CreateOfferInput = z.infer<typeof createOfferSchema>

async function generateShopId(): Promise<string> {
  while (true) {
    const id = `Shop-${Math.floor(1000 + Math.random() * 9000)}`
    const exists = await ShopModel.findOne({ shopId: id })
    if (!exists) return id
  }
}

async function generateOfferId(): Promise<string> {
  while (true) {
    const id = `Offer-${Math.floor(1000 + Math.random() * 9000)}`
    const exists = await ShopModel.findOne({ 'offers.offerId': id })
    if (!exists) return id
  }
}

export async function createShop(data: CreateShopInput, userId: string): Promise<IShop> {
  await connectDB()
  const shopId = await generateShopId()

  const offers = data.offers
    ? await Promise.all(
        data.offers.map(async (offer) => ({
          ...offer,
          offerId: offer.offerId ?? (await generateOfferId()),
          shopId,
        }))
      )
    : []

  const shop = await ShopModel.create({ ...data, shopId, offers, createdBy: userId })
  return shop.toObject() as IShop
}

export async function updateShop(id: string, data: UpdateShopInput): Promise<IShop> {
  await connectDB()

  if (data.offers) {
    const updatedOffers = await Promise.all(
      data.offers.map(async (offer) => ({
        ...offer,
        offerId: offer.offerId ?? (await generateOfferId()),
      }))
    )
    data = { ...data, offers: updatedOffers }
  }

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

export async function addOffer(shopId: string, offerData: CreateOfferInput): Promise<IShop> {
  await connectDB()
  const shop = await ShopModel.findById(shopId)
  if (!shop) throw new AppError('Shop not found', 404, 'NOT_FOUND')

  const offerId = await generateOfferId()
  shop.offers.push({ ...offerData, offerId, shopId: shop.shopId })
  await shop.save()
  return shop.toObject() as IShop
}

export async function updateOffer(
  shopId: string,
  offerId: string,
  offerData: Partial<CreateOfferInput>
): Promise<IShop> {
  await connectDB()
  const shop = await ShopModel.findById(shopId)
  if (!shop) throw new AppError('Shop not found', 404, 'NOT_FOUND')

  const offerIndex = shop.offers.findIndex((o) => o.offerId === offerId)
  if (offerIndex === -1) throw new AppError('Offer not found', 404, 'OFFER_NOT_FOUND')

  shop.offers[offerIndex] = { ...shop.offers[offerIndex].toObject(), ...offerData }
  await shop.save()
  return shop.toObject() as IShop
}

export async function deleteOffer(shopId: string, offerId: string): Promise<IShop> {
  await connectDB()
  const shop = await ShopModel.findById(shopId)
  if (!shop) throw new AppError('Shop not found', 404, 'NOT_FOUND')

  const offerIndex = shop.offers.findIndex((o) => o.offerId === offerId)
  if (offerIndex === -1) throw new AppError('Offer not found', 404, 'NOT_FOUND')

  shop.offers.splice(offerIndex, 1)
  await shop.save()
  return shop.toObject() as IShop
}
