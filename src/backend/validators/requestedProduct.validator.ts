import { z } from 'zod'
import { ProductCategory } from '../types/backend.types'

const contactDetailsSchema = z.object({
  phoneNo: z.string().min(1),
  email: z.string().email(),
})

export const createRequestedProductSchema = z.object({
  name: z.string().min(1),
  images: z.array(z.string().url()).optional(),
  category: z.nativeEnum(ProductCategory),
  price: z.object({ from: z.number().min(0), to: z.number().min(0) }),
  isNegotiable: z.boolean(),
  description: z.string().min(1),
  contactDetails: contactDetailsSchema,
  isFulfilled: z.boolean().optional(),
})
export const updateRequestedProductSchema = createRequestedProductSchema.partial()

export const listRequestedProductsQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  search: z.string().optional(),
  category: z.nativeEnum(ProductCategory).optional(),
  isNegotiable: z.string().transform(v => v === 'true').optional(),
  isFulfilled: z.string().transform(v => v === 'true').optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
})
