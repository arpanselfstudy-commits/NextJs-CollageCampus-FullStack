export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum JobType {
  PART_TIME = 'part-time',
  FULL_TIME = 'full-time',
}

export enum ProductCategory {
  ELECTRONICS = 'ELECTRONICS',
  CLOTHING_FASHION = 'CLOTHING_FASHION',
  HOME_KITCHEN = 'HOME_KITCHEN',
  BEAUTY_PERSONAL_CARE = 'BEAUTY_PERSONAL_CARE',
  SPORTS_FITNESS = 'SPORTS_FITNESS',
  BOOKS_STATIONERY = 'BOOKS_STATIONERY',
  TOYS_GAMES = 'TOYS_GAMES',
  AUTOMOTIVE = 'AUTOMOTIVE',
  GROCERIES_FOOD = 'GROCERIES_FOOD',
  HEALTH_WELLNESS = 'HEALTH_WELLNESS',
}

export enum ProductCondition {
  NEW = 'NEW',
  USED = 'USED',
  REFURBISHED = 'REFURBISHED',
}

export enum CmsType {
  TERMS_AND_CONDITIONS = 'TERMS_AND_CONDITIONS',
  PRIVACY_POLICY = 'PRIVACY_POLICY',
  ABOUT_US = 'ABOUT_US',
  FAQ = 'FAQ',
}

export interface IUser {
  _id: string
  name: string
  email: string
  password: string
  role: UserRole
  phoneNumber?: string
  photo?: string
  resetPasswordToken?: string
  resetPasswordExpire?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IRefreshToken {
  _id: string
  userId: string
  token: string
  expiresAt: Date
  deviceInfo?: { ip?: string; name?: string }
  createdAt: Date
}

export interface IDayTiming {
  isOpen: boolean
  opensAt: string | null
  closesAt: string | null
}

export interface IShopTiming {
  monday: IDayTiming
  tuesday: IDayTiming
  wednesday: IDayTiming
  thursday: IDayTiming
  friday: IDayTiming
  saturday: IDayTiming
  sunday: IDayTiming
}

export interface IOffer {
  offerId: string
  shopId: string
  offerName: string
  startDate: Date
  endDate: Date
  description: string
  photo: string
}

export interface IShop {
  _id: string
  name: string
  createdBy: string
  shopId: string
  type: string
  location: string
  distance?: string
  photo?: string
  photos?: string[]
  poster?: string
  topItems?: string[]
  allItems?: string[]
  contactDetails: { email: string; phoneNo: string }
  shopTiming: IShopTiming
  offers?: IOffer[]
  createdAt: Date
  updatedAt: Date
}

export interface IJob {
  _id: string
  jobName: string
  jobId: string
  createdBy: string
  jobProvider: string
  type: JobType
  deadline: Date
  location: string
  experience: number
  salary: { from: number; to: number }
  jobDescription: string
  responsibilities: string[]
  contactDetails: { email: string; phoneNo: string }
  createdAt: Date
  updatedAt: Date
}

export interface IListedProduct {
  _id: string
  user: string
  productName: string
  images: string[]
  category: ProductCategory
  condition: ProductCondition
  price: string
  isNegotiable: boolean
  description: string
  yearUsed: number
  contactDetails: { phoneNo: string; email: string }
  isAvailable: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IRequestedProduct {
  _id: string
  user: string
  name: string
  images?: string[]
  category: ProductCategory
  price: { from: number; to: number }
  isNegotiable: boolean
  description: string
  contactDetails: { phoneNo: string; email: string }
  isFulfilled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ICms {
  _id: string
  cmsId: string
  type: string
  title: string
  content: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T = unknown> {
  code: number
  success: boolean
  message: string
  data: T | null
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  limit: number
}

export interface ErrorResponse {
  code: number
  success: false
  message: string
  errorCode: string
  data: null
  details?: unknown[]
}
