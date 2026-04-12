/**
 * Lazy env accessor — reads process.env at call time, not at module load time.
 * This prevents crashes during Next.js build/edge cold starts before env is populated.
 */
function getEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Environment variable "${key}" is not defined. Please add it to your .env file.`)
  }
  return value
}

export const env = {
  get MONGODB_URI() { return getEnv('MONGODB_URI') },
  get JWT_ACCESS_SECRET() { return getEnv('JWT_ACCESS_SECRET') },
  get JWT_REFRESH_SECRET() { return getEnv('JWT_REFRESH_SECRET') },
  get EMAIL_HOST() { return getEnv('EMAIL_HOST') },
  get EMAIL_PORT() { return getEnv('EMAIL_PORT') },
  get EMAIL_USER() { return getEnv('EMAIL_USER') },
  get EMAIL_PASS() { return getEnv('EMAIL_PASS') },
  get NEXT_PUBLIC_APP_URL() {
    return process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'http://localhost:3000'
  },
}
