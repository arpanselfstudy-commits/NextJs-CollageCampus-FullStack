export const queryKeys = {
  auth: {
    profile: ['auth', 'profile'] as const,
  },
  jobs: {
    all: (params?: object) => ['jobs', params] as const,
    byId: (id: string) => ['jobs', id] as const,
  },
  shops: {
    all: (params?: object) => ['shops', params] as const,
    byId: (id: string) => ['shops', id] as const,
  },
  listedProducts: {
    all: (params?: object) => ['listed-products', params] as const,
    byId: (id: string) => ['listed-products', id] as const,
  },
  requestedProducts: {
    all: (params?: object) => ['requested-products', params] as const,
    byId: (id: string) => ['requested-products', id] as const,
  },
  users: {
    all: ['users'] as const,
    byId: (id: string) => ['users', id] as const,
  },
}
