import { connectDB } from '../lib/db'
import { AppError } from '../lib/appError'
import { ListedProductModel } from '../models/listedProduct.model'
import { IListedProduct } from '../types/backend.types'
import { z } from 'zod'
import { createListedProductSchema, updateListedProductSchema } from '../validators/listedProduct.validator'

type CreateListedProductInput = z.infer<typeof createListedProductSchema>
type UpdateListedProductInput = z.infer<typeof updateListedProductSchema>

export async function createListedProduct(
  data: CreateListedProductInput,
  userId: string
): Promise<IListedProduct> {
  await connectDB()
  const product = await ListedProductModel.create({ ...data, user: userId })
  return product.toObject() as IListedProduct
}

export async function getListedProducts(filters: {
  page?: number
  limit?: number
  search?: string
  category?: string
  condition?: string
  minPrice?: number
  maxPrice?: number
  minYearUsed?: number
  maxYearUsed?: number
  userId?: string
}) {
  await connectDB()
  const { page = 1, limit = 10, search, category, condition, minPrice, maxPrice, minYearUsed, maxYearUsed, userId } = filters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {}

  if (search) query.productName = new RegExp(search, 'i')
  if (category) query.category = category
  if (condition) query.condition = condition
  if (userId) query.user = userId
  if (minYearUsed !== undefined || maxYearUsed !== undefined) {
    query.yearUsed = {}
    if (minYearUsed !== undefined) query.yearUsed.$gte = minYearUsed
    if (maxYearUsed !== undefined) query.yearUsed.$lte = maxYearUsed
  }

  const skip = (page - 1) * limit
  const [products, total] = await Promise.all([
    ListedProductModel.find(query)
      .populate('user', 'name email')
      .skip(skip)
      .limit(limit)
      .lean(),
    ListedProductModel.countDocuments(query),
  ])

  return { products, total, page, limit }
}

export async function getListedProductById(id: string): Promise<IListedProduct> {
  await connectDB()
  const product = await ListedProductModel.findById(id).populate('user', 'name email').lean()
  if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND')
  return product as unknown as IListedProduct
}

export async function updateListedProduct(
  id: string,
  userId: string,
  data: UpdateListedProductInput
): Promise<IListedProduct> {
  await connectDB()
  const product = await ListedProductModel.findOneAndUpdate(
    { _id: id, user: userId },
    data,
    { new: true, runValidators: true }
  )
  if (!product) throw new AppError('Product not found or unauthorized', 404, 'NOT_FOUND')
  return product.toObject() as IListedProduct
}

export async function deleteListedProduct(id: string, userId: string): Promise<void> {
  await connectDB()
  const product = await ListedProductModel.findOneAndDelete({ _id: id, user: userId })
  if (!product) throw new AppError('Product not found or unauthorized', 404, 'NOT_FOUND')
}
