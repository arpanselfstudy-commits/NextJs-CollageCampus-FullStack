export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
  appEnv: process.env.NODE_ENV ?? 'development',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
}
