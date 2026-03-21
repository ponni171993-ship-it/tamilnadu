// MongoDB connection utility for backend
import mongoose from 'mongoose';

const connectMongo = async () => {
  const uri = process.env.MONGODB_URI || 'YOUR_MONGODB_ATLAS_URI_HERE';
  
  // Skip MongoDB connection if not configured (for development)
  if (uri === 'YOUR_MONGODB_ATLAS_URI_HERE') {
    console.warn('MongoDB not configured. Running without database persistence.');
    return;
  }
  
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.warn('Continuing without database connection...');
    // Don't exit the process, just warn the user
  }
};

export default connectMongo;
