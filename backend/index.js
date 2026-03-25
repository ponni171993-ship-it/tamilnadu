import dotenv from 'dotenv';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

dotenv.config({ path: '.env.s3' });
dotenv.config(); // Also load regular .env file

// Initialize DynamoDB
const ddbClient = new DynamoDBClient({ 
  region: process.env._AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env._AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env._AWS_SECRET_ACCESS_KEY
  }
});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const TABLE_NAME = 'users';

// AWS S3 validation commented out - using local storage
// if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET_NAME) {
//   console.error('Missing AWS S3 configuration. Please check your .env.s3 file.');
//   console.log('Available env vars:', {
//     AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
//     AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
//     AWS_S3_BUCKET_NAME: !!process.env.AWS_S3_BUCKET_NAME
//   });
//   process.exit(1);
// }

import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { generateUserPDF } from './pdfUtil.js';
// import { generateWhatsAppBadge, generateSimpleBadge } from './badgeUtil.js';
// import { generateVotingBadge, generateSimpleVotingBadge } from './votingBadgeUtil.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

// Improved CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser clients (no Origin header)
    if (!origin) return callback(null, true);
    // Allow localhost on any port for local development
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Handle preflight requests
app.options('*', cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup for disk storage (local files - S3 disabled)
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadsDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      // Use timestamp for now, we'll rename after getting phone number
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `photo-${uniqueSuffix}${ext}`);
    },
  })
});

// DynamoDB functions
const checkDuplicatePhone = async (phone) => {
  try {
    if (typeof phone !== 'string' || !phone.trim()) return null;
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { phone: phone.trim() }
    });
    const response = await docClient.send(command);
    return response.Item;
  } catch (error) {
    console.error('Error checking duplicate phone:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      type: error?.__type,
      metadata: error?.$metadata
    });
    return null;
  }
};

const saveUser = async (userData) => {
  try {
    const phone = typeof userData?.phone === 'string' ? userData.phone.trim() : '';
    if (!phone) throw new Error('Missing phone for DynamoDB item');

    // DynamoDB does not allow empty string values. Only include non-empty strings.
    const item = {
      phone,
      registeredAt: userData?.registeredAt instanceof Date
        ? userData.registeredAt.toISOString()
        : new Date().toISOString()
    };

    const name = typeof userData?.name === 'string' ? userData.name.trim() : '';
    if (name) item.name = name;

    const pdfPath = typeof userData?.pdf_path === 'string' ? userData.pdf_path.trim() : '';
    if (pdfPath) item.pdf_path = pdfPath;

    const photoPath = typeof userData?.photo_path === 'string' ? userData.photo_path.trim() : '';
    if (photoPath) item.photo_path = photoPath;

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    });
    await docClient.send(command);
    console.log('✅ User saved to DynamoDB:', userData.phone);
    return true;
  } catch (error) {
    console.error('Error saving user:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      type: error?.__type,
      metadata: error?.$metadata
    });
    return false;
  }
};

console.log('✅ Local backend initialized with DynamoDB');

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'Tamil Nadu Voting App Backend API',
    time: new Date().toISOString()
  });
});

// Register endpoint with PDF-only storage in database
// Accept both /api/register and /api/register/ (with trailing slash)
app.post(['/api/register', '/api/register/'], upload.single('photo'), async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    // Enhanced input validation
    if (!name || !phone || !req.file) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({ error: 'Name must be between 2 and 50 characters' });
    }
    
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number' });
    }
    
    // Check file size (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Photo size must be less than 5MB' });
    }
    
    // Check file type
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Please upload a valid image file' });
    }
    
    // Check for duplicate phone number in DynamoDB
    const cleanPhone = phone.trim();
    const existingUser = await checkDuplicatePhone(cleanPhone);
    
    if (existingUser) {
      return res.status(409).json({ error: 'A user with this phone number is already registered' });
    }
    
    try {
      // Generate PDF first (local storage - S3 disabled)
      const pdfFileName = `user-${cleanPhone}.pdf`;
      const pdfPath = path.join(__dirname, 'uploads', pdfFileName);
      
      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Use the file path from disk since we are using diskStorage
      await generateUserPDF({
        name,
        phone: cleanPhone,
        photo: req.file.path, // Changed from req.file.buffer
        userId: cleanPhone,
        outputDir: uploadsDir,
      });
      
      // Verify PDF was created
      if (!fs.existsSync(pdfPath)) {
        throw new Error('PDF file was not created successfully');
      }
      
      console.log('PDF created successfully:', pdfPath);
      
      // S3 upload commented out - using local storage
      // const fileName = `user-${Date.now()}.pdf`;
      // const s3Url = await uploadPDFToS3(pdfBuffer, fileName);
      
      // Rename photo file to use phone number
      const photoExt = path.extname(req.file.filename);
      const newPhotoName = `photo-${cleanPhone}${photoExt}`;
      const oldPhotoPath = path.join(__dirname, 'uploads', req.file.filename);
      const newPhotoPath = path.join(__dirname, 'uploads', newPhotoName);
      
      // Rename the photo file
      if (fs.existsSync(oldPhotoPath)) {
        fs.renameSync(oldPhotoPath, newPhotoPath);
      }
      
      // Save user to DynamoDB
      const userData = {
        name: name.trim(),
        phone: phone.trim(),
        pdf_path: pdfFileName,
        photo_path: newPhotoName,
        registeredAt: new Date()
      };
      
      const saved = await saveUser(userData);
      if (!saved) {
        return res.status(500).json({ error: 'Failed to save user data' });
      }
      
      // Return PDF as base64 for download
      let pdfBase64 = '';
      try {
        const pdfBuffer = fs.readFileSync(pdfPath);
        if (!pdfBuffer || pdfBuffer.length === 0) {
          console.warn('⚠️ PDF buffer is empty');
          pdfBase64 = '';
        } else {
          pdfBase64 = pdfBuffer.toString('base64');
          console.log(`✅ PDF converted to base64 (${pdfBase64.length} characters)`);
        }
      } catch (pdfReadError) {
        console.error('❌ Error reading PDF file:', pdfReadError.message);
        pdfBase64 = '';
      }
      
      // Generate simple badge placeholder (canvas disabled)
      let badgeBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAVlpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KTMInWQAAABxJREFUGBljZGBg+M9AAWCiIFgYBiiwAAG0BIBJgAAAAASUVORK5CYII=';
      console.log('🎨 Using placeholder badge');
      
      res.json({ 
        success: true, 
        id: cleanPhone,
        name,
        phone: cleanPhone,
        pdf: pdfBase64 ? `data:application/pdf;base64,${pdfBase64}` : null,
        pdf_path: `/uploads/${pdfFileName}`,
        badge: badgeBase64,
        badge_style: 'voting'
      });
      
    } catch (fileError) {
      console.error('File processing error:', fileError);
      return res.status(500).json({ error: 'File processing failed', details: fileError.message });
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// Other endpoints temporarily disabled for DynamoDB testing
app.get('/user/:id', (req, res) => res.json({ message: 'Endpoint temporarily disabled' }));
app.get('/download/:phone', (req, res) => res.json({ message: 'Endpoint temporarily disabled' }));
app.get('/preview/:phone', (req, res) => res.json({ message: 'Endpoint temporarily disabled' }));
app.get('/pdf-info/:phone', (req, res) => res.json({ message: 'Endpoint temporarily disabled' }));
app.get('/badge/:phone', (req, res) => res.json({ message: 'Endpoint temporarily disabled' }));
app.get('/badge-info/:phone', (req, res) => res.json({ message: 'Endpoint temporarily disabled' }));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
