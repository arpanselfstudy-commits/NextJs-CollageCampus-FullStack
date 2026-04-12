import { cache } from 'react'
import { connectDB } from '../lib/db'
import {
  getListedProducts as getListedProductsService,
  getListedProductById as getListedProductByIdService,
} from '../services/listedProduct.service'

export const getListedProducts = cache(
  async (filters: Parameters<typeof getListedProductsService>[0] = {}) => {
    await connectDB()
    return getListedProductsService(filters)
  }
)

export const getListedProductById = cache(async (id: string) => {
  await connectDB()
  return getListedProductByIdService(id)
})

export const getMyListedProducts = cache(
  async (userId: string, filters: Omit<Parameters<typeof getListedProductsService>[0], 'userId'> = {}) => {
    await connectDB()
    return getListedProductsService({ ...filters, userId })
  }
)
