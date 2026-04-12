import { z } from 'zod'

const dayTimingSchema = z.object({
  isOpen: z.boolean(),
  opensAt: z.string().nullable(),
  closesAt: z.string().nullable(),
})

const shopTimingSchema = z.object({
  monday: dayTimingSchema,
  tuesday: dayTimingSchema,
  wednesday: dayTimingSchema,
  thursday: dayTimingSchema,
  friday: dayTimingSchema,
  saturday: dayTimingSchema,
  sunday: dayTimingSchema,
})

const contactDetailsSchema = z.object({
  email: z.string().email(),
  phoneNo: z.string(),
})

export const createOfferSchema = z.object({
  offerId: z.string().optional(),
  shopId: z.string().optional(),
  offerName: z.string().min(1),
  startDate: z.string().transform(s => new Date(s)),
  endDate: z.string().transform(s => new Date(s)),
  description: z.string().min(1),
  photo: z.string(),
})
export const updateOfferSchema = createOfferSchema.partial()

export const createShopSchema = z.object({
  name: z.string().min(1),
  shopId: z.string().optional(),
  type: z.string().min(1),
  location: z.string().min(1),
  distance: z.string().optional(),
  photo: z.string().optional(),
  photos: z.array(z.string()).optional(),
  poster: z.string().optional(),
  topItems: z.array(z.string()).optional(),
  allItems: z.array(z.string()).optional(),
  contactDetails: contactDetailsSchema,
  shopTiming: shopTimingSchema,
  offers: z.array(createOfferSchema).optional(),
})
export const updateShopSchema = createShopSchema.partial()

export const listShopsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  distance: z.string().optional(),
  openDay: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).optional(),
})
