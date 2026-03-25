// MongoDB connection utility for backend
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env.local') });
dotenv.config();

const connectMongo = async () => {
  const uri = process.env.MONGODB_URI || 'YOUR_MONGODB_ATLAS_URI_HERE';
  
  console.log('🔍 Checking MongoDB URI:', uri ? 'URI found' : 'URI not found');
  console.log('🔍 URI length:', uri.length);
  console.log('🔍 URI starts with:', uri.substring(0, 20) + '...');
  
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
