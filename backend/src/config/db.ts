import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new Error('DATABASE_URL is not set in environment variables');
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 60000,
    });
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB runtime error:', err);
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
};
