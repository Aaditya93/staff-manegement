
import mongoose from 'mongoose';


const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI;


if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}


async function dbConnect() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI as string);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default dbConnect;

