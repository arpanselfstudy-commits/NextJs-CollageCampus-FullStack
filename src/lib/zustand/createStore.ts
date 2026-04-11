import { create, type StateCreator } from 'zustand'

export function createStore<T>(initializer: StateCreator<T>) {
  return create<T>(initializer)
}
