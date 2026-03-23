import dotenv from 'dotenv';
dotenv.config({ path: '.env.cloudinary' });
dotenv.config(); // Also load regular .env file

// Validate required environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Missing Cloudinary configuration. Please check your .env.cloudinary file.');
  console.log('Available env vars:', {
    CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET
  });
  process.exit(1);
}

import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { generateUserPDF } from './pdfUtil.js';
import cloudinary from './cloudinaryUtil.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

// Improved CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup for memory storage (no local files)
const upload = multer({ storage: multer.memoryStorage() });

// In-memory storage for phone numbers (development without MongoDB)
const registeredPhoneNumbers = new Set();


// MongoDB integration
import connectMongo from './mongoUtil.js';
import User from './models/User.js';
import mongoose from 'mongoose';
connectMongo();

// Register endpoint with PDF-only storage in database
app.post('/register', upload.single('photo'), async (req, res) => {
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
    
    // Check for duplicate phone number
    let isDuplicate = false;
    const cleanPhone = phone.trim();
    
    if (mongoose.connection.readyState === 1) {
      try {
        const existingUser = await User.findOne({ phone: cleanPhone });
        if (existingUser) {
          isDuplicate = true;
        }
      } catch (dbError) {
        console.error('Database query error:', dbError);
      }
    } else {
      if (registeredPhoneNumbers.has(cleanPhone)) {
        isDuplicate = true;
      }
    }
    
    if (isDuplicate) {
      return res.status(409).json({ error: 'A user with this phone number is already registered' });
    }
    
    try {
      // Generate PDF first
      const pdfPath = await generateUserPDF({
        name,
        phone: cleanPhone, // Pass phone number to PDF
        photo: req.file.buffer, // Pass photo buffer to PDF
        userId: `temp_${Date.now()}`, // Temporary ID for PDF generation
        outputDir: __dirname,
      });
      
      // Read PDF as buffer
      const pdfBuffer = fs.readFileSync(pdfPath);
      
      // Clean up temporary PDF file
      fs.unlink(pdfPath, (err) => {
        if (err) console.error('Failed to clean up temp PDF:', err);
      });
      
      // Save user with PDF data only (if MongoDB is connected)
      if (mongoose.connection.readyState === 1) {
        const newUser = new User({
          name: name.trim(),
          phone: phone.trim(),
          pdf_data: pdfBuffer
        });
        
        await newUser.save();
        
        // Add phone number to in-memory storage for development
        if (mongoose.connection.readyState !== 1) {
          registeredPhoneNumbers.add(cleanPhone);
        }
        
        // Return PDF as base64 for download
        const pdfBase64 = pdfBuffer.toString('base64');
        res.json({ 
          success: true, 
          id: newUser._id, 
          pdf: `data:application/pdf;base64,${pdfBase64}`
        });
      } else {
        // In-memory storage for development without MongoDB
        const tempId = `temp_${Date.now()}`;
        registeredPhoneNumbers.add(cleanPhone);
        
        // Return PDF as base64 for download
        const pdfBase64 = pdfBuffer.toString('base64');
        res.json({ 
          success: true, 
          id: tempId, 
          pdf: `data:application/pdf;base64,${pdfBase64}`
        });
      }
      
    } catch (fileError) {
      console.error('File processing error:', fileError);
      return res.status(500).json({ error: 'File processing failed', details: fileError.message });
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// Get user data endpoint
app.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        name: user.name,
        phone: user.phone,
        created_at: user.created_at
      });
    } else {
      res.status(503).json({ error: 'Database not available' });
    }
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Failed to retrieve user data' });
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
