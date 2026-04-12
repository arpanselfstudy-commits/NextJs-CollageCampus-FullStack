import { z } from 'zod'
import { ProductCategory, ProductCondition } from '../types/backend.types'

const contactDetailsSchema = z.object({
  phoneNo: z.string().min(1),
  email: z.string().email(),
})

export const createListedProductSchema = z.object({
  productName: z.string().min(1),
  images: z.array(z.string().url()).min(1),
  category: z.nativeEnum(ProductCategory),
  condition: z.nativeEnum(ProductCondition),
  price: z.string().min(1),
  isNegotiable: z.boolean(),
  description: z.string().min(1),
  yearUsed: z.number().min(0),
  contactDetails: contactDetailsSchema,
  isAvailable: z.boolean().optional(),
})
export const updateListedProductSchema = createListedProductSchema.partial()

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  search: z.string().optional(),
  category: z.nativeEnum(ProductCategory).optional(),
  condition: z.nativeEnum(ProductCondition).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minYearUsed: z.coerce.number().optional(),
  maxYearUsed: z.coerce.number().optional(),
})
