export type ListedProductCategory =
  | 'ELECTRONICS'
  | 'CLOTHING_FASHION'
  | 'HOME_KITCHEN'
  | 'BEAUTY_PERSONAL_CARE'
  | 'SPORTS_FITNESS'
  | 'BOOKS_STATIONERY'
  | 'TOYS_GAMES'
  | 'AUTOMOTIVE'
  | 'GROCERIES_FOOD'
  | 'HEALTH_WELLNESS'

export type ListedProductCondition = 'NEW' | 'USED' | 'REFURBISHED'

export const LISTED_CATEGORIES: ListedProductCategory[] = [
  'ELECTRONICS', 'CLOTHING_FASHION', 'HOME_KITCHEN', 'BEAUTY_PERSONAL_CARE',
  'SPORTS_FITNESS', 'BOOKS_STATIONERY', 'TOYS_GAMES', 'AUTOMOTIVE',
  'GROCERIES_FOOD', 'HEALTH_WELLNESS',
]

export const LISTED_CONDITIONS: ListedProductCondition[] = ['NEW', 'USED', 'REFURBISHED']

export const CATEGORY_LABEL: Record<ListedProductCategory, string> = {
  ELECTRONICS: 'Electronics',
  CLOTHING_FASHION: 'Clothing & Fashion',
  HOME_KITCHEN: 'Home & Kitchen',
  BEAUTY_PERSONAL_CARE: 'Beauty & Personal Care',
  SPORTS_FITNESS: 'Sports & Fitness',
  BOOKS_STATIONERY: 'Books & Stationery',
  TOYS_GAMES: 'Toys & Games',
  AUTOMOTIVE: 'Automotive',
  GROCERIES_FOOD: 'Groceries & Food',
  HEALTH_WELLNESS: 'Health & Wellness',
}

export interface ListedProduct {
  _id?: string
  user: string
  productName: string
  images: string[]
  category: string
  condition: string
  price: string
  isNegotiable: boolean
  description: string
  yearUsed: number
  contactDetails: { email: string; phoneNo: string }
  isAvailable: boolean
}

export interface ListedProductPayload {
  user: string
  productName: string
  images: string[]
  category: string
  condition: string
  price: string
  isNegotiable: boolean
  description: string
  yearUsed: number
  contactDetails: { email: string; phoneNo: string }
  isAvailable: boolean
}

export interface ListedProductsResponse {
  products: ListedProduct[]
  pagination: { total: number; page: number; limit: number; pages: number }
}

export interface ListedProductsParams {
  page?: number
  limit?: number
  search?: string
  category?: string
  condition?: string
  minPrice?: string
  maxPrice?: string
  minYearUsed?: number
  maxYearUsed?: number
}

export interface RequestedProduct {
  _id?: string
  user: string
  name: string
  images: string[]
  category: ListedProductCategory
  price: { from: number; to: number }
  isNegotiable: boolean
  description: string
  contactDetails: { email: string; phoneNo: string }
  isFulfilled: boolean
}

export interface RequestedProductPayload {
  user: string
  name: string
  images: string[]
  category: ListedProductCategory
  price: { from: number; to: number }
  isNegotiable: boolean
  description: string
  contactDetails: { email: string; phoneNo: string }
  isFulfilled: boolean
}

export interface RequestedProductsResponse {
  products: RequestedProduct[]
  pagination: { total: number; page: number; limit: number; pages: number }
}

export interface RequestedProductsParams {
  page?: number
  limit?: number
  search?: string
  category?: string
  isNegotiable?: string
  isFulfilled?: string
  minPrice?: number
  maxPrice?: number
}
