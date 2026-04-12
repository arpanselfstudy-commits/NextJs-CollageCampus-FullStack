import { cache } from 'react'
import { connectDB } from '../lib/db'
import { getShops as getShopsService, getShopById as getShopByIdService } from '../services/shop.service'

export const getShops = cache(async (filters: Parameters<typeof getShopsService>[0] = {}) => {
  await connectDB()
  return getShopsService(filters)
})

export const getShopById = cache(async (id: string) => {
  await connectDB()
  return getShopByIdService(id)
})
