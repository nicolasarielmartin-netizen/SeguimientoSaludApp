import mongoose from 'mongoose'

mongoose.connection.on('disconnected', () => console.warn('MongoDB desconectado'))
mongoose.connection.on('error', (err) => console.error('Error MongoDB:', err.message))

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 5,
  })
  console.log('MongoDB conectado correctamente')
}
export default connectDB