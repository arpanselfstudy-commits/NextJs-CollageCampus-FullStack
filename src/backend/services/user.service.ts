import { UserRepository } from '../repositories/user.repository'

export const UserService = {
  async getAll() {
    return UserRepository.findAll()
  },

  async create(data: { email: string; name: string }) {
    if (!data.email || !data.name) throw new Error('Missing required fields')
    return UserRepository.create(data)
  },
}
