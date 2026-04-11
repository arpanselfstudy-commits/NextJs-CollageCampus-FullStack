import { dehydrate } from '@tanstack/react-query'
import { queryClient } from './queryClient'

export function getDehydratedState() {
  return dehydrate(queryClient)
}
