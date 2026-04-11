// Placeholder — swap with your DB client (Prisma, Drizzle, etc.)
export const db = {
  query: async (sql: string, params?: unknown[]) => {
    console.log('[db]', sql, params)
    return []
  },
}
