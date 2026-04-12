import { connectDB } from '../lib/db'
import { AppError } from '../lib/appError'
import { RequestedProductModel } from '../models/requestedProduct.model'
import { IRequestedProduct } from '../types/backend.types'
import { z } from 'zod'
import {
  createRequestedProductSchema,
  updateRequestedProductSchema,
} from '../validators/requestedProduct.validator'

type CreateRequestedProductInput = z.infer<typeof createRequestedProductSchema>
type UpdateRequestedProductInput = z.infer<typeof updateRequestedProductSchema>

export async function createRequestedProduct(
  data: CreateRequestedProductInput,
  userId: string
): Promise<IRequestedProduct> {
  await connectDB()
  const request = await RequestedProductModel.create({ ...data, user: userId })
  return request.toObject() as IRequestedProduct
}

export async function getRequestedProducts(filters: {
  page?: number
  limit?: number
  search?: string
  category?: string
  isNegotiable?: boolean
  isFulfilled?: boolean
  minPrice?: number
  maxPrice?: number
  userId?: string
}) {
  await connectDB()
  const { page = 1, limit = 10, search, category, isNegotiable, isFulfilled, minPrice, maxPrice, userId } = filters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {}

  if (search) {
    const regex = new RegExp(search, 'i')
    query.$or = [{ name: regex }, { category: regex }]
  }
  if (category) query.category = category
  if (isNegotiable !== undefined) query.isNegotiable = isNegotiable
  if (isFulfilled !== undefined) query.isFulfilled = isFulfilled
  if (userId) query.user = userId
  if (minPrice !== undefined) query['price.from'] = { $gte: minPrice }
  if (maxPrice !== undefined) query['price.to'] = { $lte: maxPrice }

  const skip = (page - 1) * limit
  const [requests, total] = await Promise.all([
    RequestedProductModel.find(query)
      .populate('user', 'name email')
      .skip(skip)
      .limit(limit)
      .lean(),
    RequestedProductModel.countDocuments(query),
  ])

  return {
    products: requests,
    total,
    page,
    limit,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  }
}

export async function getRequestedProductById(id: string): Promise<IRequestedProduct> {
  await connectDB()
  const request = await RequestedProductModel.findById(id).populate('user', 'name email').lean()
  if (!request) throw new AppError('Request not found', 404, 'NOT_FOUND')
  return request as unknown as IRequestedProduct
}

export async function updateRequestedProduct(
  id: string,
  userId: string,
  data: UpdateRequestedProductInput
): Promise<IRequestedProduct> {
  await connectDB()
  const request = await RequestedProductModel.findOneAndUpdate(
    { _id: id, user: userId },
    data,
    { new: true, runValidators: true }
  )
  if (!request) throw new AppError('Request not found or unauthorized', 404, 'NOT_FOUND')
  return request.toObject() as IRequestedProduct
}

export async function deleteRequestedProduct(id: string, userId: string): Promise<void> {
  await connectDB()
  const request = await RequestedProductModel.findOneAndDelete({ _id: id, user: userId })
  if (!request) throw new AppError('Request not found or unauthorized', 404, 'NOT_FOUND')
}
