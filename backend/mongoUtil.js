// MongoDB connection utility for backend
import mongoose from 'mongoose';

const connectMongo = async () => {
  const uri = process.env.MONGODB_URI || 'YOUR_MONGODB_ATLAS_URI_HERE';
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

export default connectMongo;
