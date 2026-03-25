import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration for Amplify
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Memory storage for file uploads (works in Amplify)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mock registration endpoint for Amplify testing
app.post('/register', upload.single('photo'), async (req, res) => {
  try {
    const { name, phone } = req.body;
    const photo = req.file;

    // Validation
    if (!name || !phone || !photo) {
      return res.status(400).json({ error: 'Name, phone, and photo are required' });
    }

    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({ error: 'Name must be between 2 and 50 characters' });
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid Indian mobile number' });
    }

    // Generate mock responses for Amplify
    const registrationId = `REG${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Mock PDF and badge data (base64 encoded)
    const mockPDF = 'JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDMgMCBSL1Jlc291cmNlczw8L0ZvbnQ8PC9GMSA0IDAgUj4+Pj4vTWVkaWFCb3hbWCAwIDAgNjEyIDc5Ml0+Pj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZS9QYWdlcy9Db3VudCAxL0tpZHNbMiAwIF0+PgplbmRvYmoKNCAwIG9iago8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9IZWx2ZXRpY2E+PgplbmRvYmoKeHJlZgowIDUKJSVFT0Y=';
    
    const mockBadge = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

    // Mock success response
    res.json({
      success: true,
      registrationId,
      name,
      phone,
      pdf: `data:application/pdf;base64,${mockPDF}`,
      badge: `data:image/png;base64,${mockBadge}`,
      message: 'Registration successful (mock data for Amplify testing)'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed. Please try again.',
      details: error.message 
    });
  }
});

// Export for serverless function
export const handler = async (event, context) => {
  // AWS Lambda handler for Amplify
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: JSON.stringify({ message: 'Serverless function working' })
  };
};

// Local development
const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Mock server running on http://localhost:${PORT}`);
    console.log('📊 This is a mock server for Amplify testing');
    console.log('🔗 Use this for development and testing');
  });
}

export default app;
