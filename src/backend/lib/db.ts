import mongoose from 'mongoose'

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: typeof mongoose | undefined
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not defined')
  }

  // Reuse existing connection (handles Next.js hot-reload)
  if (global._mongooseConn) {
    return global._mongooseConn
  }

  if (mongoose.connection.readyState >= 1) {
    global._mongooseConn = mongoose
    return mongoose
  }

  const conn = await mongoose.connect(uri)
  global._mongooseConn = conn
  return conn
}
