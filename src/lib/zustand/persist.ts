import { create, type StateCreator } from 'zustand'
import { persist as zustandPersist, type PersistOptions } from 'zustand/middleware'

export function createPersistedStore<T>(
  initializer: StateCreator<T>,
  options: PersistOptions<T>
) {
  return create<T>()(zustandPersist(initializer, options))
}
