/**
 * Global Static Data
 * All static/constant data used across the application.
 * Import from here instead of defining inline in components.
 */

// ── Hero images (Landing page) ───────────────────────────
export const HERO_IMAGES = [
  { src: 'https://images.pexels.com/photos/21714842/pexels-photo-21714842.jpeg', tall: true },
  { src: 'https://images.pexels.com/photos/8199187/pexels-photo-8199187.jpeg', tall: false },
  { src: 'https://images.pexels.com/photos/7972506/pexels-photo-7972506.jpeg', tall: false },
] as const

// ── Job type labels ──────────────────────────────────────
export const JOB_TYPE_LABEL: Record<string, string> = {
  FULL_TIME:   'Full-Time',
  PART_TIME:   'Part-Time',
  INTERNSHIP:  'Internship',
  CONTRACT:    'Contract',
}

// ── Job filter options ───────────────────────────────────
export const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'] as const

export const EXPERIENCE_LEVELS = ['Entry', 'Junior', 'Mid-Level', 'Senior'] as const

// ── Marketplace category colours ────────────────────────
export const CATEGORY_BG: Record<string, string> = {
  ELECTRONICS:          '#dcfce7',
  CLOTHING_FASHION:     '#fce7f3',
  HOME_KITCHEN:         '#fef9c3',
  BOOKS_STATIONERY:     '#e0e7ff',
  SPORTS_FITNESS:       '#dcfce7',
  BEAUTY_PERSONAL_CARE: '#fce7f3',
  TOYS_GAMES:           '#fef9c3',
  AUTOMOTIVE:           '#e5e7eb',
  GROCERIES_FOOD:       '#dcfce7',
  HEALTH_WELLNESS:      '#e0f2fe',
}

export const CATEGORY_TEXT: Record<string, string> = {
  ELECTRONICS:          '#166534',
  CLOTHING_FASHION:     '#9d174d',
  HOME_KITCHEN:         '#854d0e',
  BOOKS_STATIONERY:     '#3730a3',
  SPORTS_FITNESS:       '#166534',
  BEAUTY_PERSONAL_CARE: '#9d174d',
  TOYS_GAMES:           '#854d0e',
  AUTOMOTIVE:           '#374151',
  GROCERIES_FOOD:       '#166534',
  HEALTH_WELLNESS:      '#0369a1',
}

// ── Shop category filter items ───────────────────────────
export const SHOP_CATEGORY_ITEMS = [
  { label: 'Cafes',       value: 'cafe'        },
  { label: 'Restaurants', value: 'restaurant'  },
  { label: 'Bars',        value: 'bar'         },
  { label: 'Bookstores',  value: 'bookstore'   },
] as const

// ── Days of week (for shop opening hours) ───────────────
export const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday',
  'friday', 'saturday', 'sunday',
] as const

// ── Footer navigation links ──────────────────────────────
export const FOOTER_LEGAL_LINKS = [
  { label: 'Contact',  href: '/contact'  },
  { label: 'Support',  href: '/support'  },
  { label: 'Privacy',  href: '/privacy'  },
  { label: 'Terms',    href: '/terms'    },
  { label: 'Safety',   href: '/safety'   },
] as const

export const FOOTER_EXPLORE_LINKS = [
  { label: 'Jobs',        href: '/jobs'        },
  { label: 'Shops',       href: '/shops'       },
  { label: 'Marketplace', href: '/marketplace' },
] as const

export const FOOTER_ACCOUNT_LINKS = [
  { label: 'My Profile',  href: '/account/my-profile'     },
  { label: 'My Listings', href: '/account/manage-listing' },
  { label: 'My Requests', href: '/account/manage-request' },
] as const

// ── Sidebar navigation links (UserLayout) ───────────────
export const SIDEBAR_LINKS = [
  { href: '/account/my-profile',      label: 'My Profile',   icon: '👤' },
  { href: '/account/manage-listing',  label: 'My Listings',  icon: '🛍'  },
  { href: '/account/manage-request',  label: 'My Requests',  icon: '📋' },
  { href: '/account/list-product',    label: 'List Product', icon: '➕' },
  { href: '/account/request-product', label: 'Request Item', icon: '🔍' },
  { href: '/account/edit-profile',    label: 'Edit Profile', icon: '✏️' },
] as const

// ── Reset password decorative circle sizes ───────────────
export const RESET_PASSWORD_CIRCLES = [80, 140, 200, 260, 320] as const
