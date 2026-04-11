import { queryClient } from './queryClient'

export function invalidate(queryKey: readonly unknown[]) {
  return queryClient.invalidateQueries({ queryKey })
}

export function invalidateAll() {
  return queryClient.invalidateQueries()
}
