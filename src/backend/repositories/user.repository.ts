// Stub repository — replace db calls with your actual ORM/client
export const UserRepository = {
  async findAll() {
    return [] // TODO: db.query('SELECT * FROM users')
  },

  async findById(id: string) {
    return null // TODO: db.query('SELECT * FROM users WHERE id = ?', [id])
  },

  async create(data: { email: string; name: string }) {
    return { id: crypto.randomUUID(), ...data }
  },
}
