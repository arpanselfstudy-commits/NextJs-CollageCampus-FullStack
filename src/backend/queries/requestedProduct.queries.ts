import { cache } from 'react'
import { connectDB } from '../lib/db'
import {
  getRequestedProducts as getRequestedProductsService,
  getRequestedProductById as getRequestedProductByIdService,
} from '../services/requestedProduct.service'

export const getRequestedProducts = cache(
  async (filters: Parameters<typeof getRequestedProductsService>[0] = {}) => {
    await connectDB()
    return getRequestedProductsService(filters)
  }
)

export const getRequestedProductById = cache(async (id: string) => {
  await connectDB()
  return getRequestedProductByIdService(id)
})

export const getMyRequestedProducts = cache(
  async (userId: string, filters: Omit<Parameters<typeof getRequestedProductsService>[0], 'userId'> = {}) => {
    await connectDB()
    return getRequestedProductsService({ ...filters, userId })
  }
)
