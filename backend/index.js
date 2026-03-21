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

// Register endpoint
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
        // Continue with registration even if DB check fails
      }
    } else {
      // Check in-memory storage for development
      if (registeredPhoneNumbers.has(cleanPhone)) {
        isDuplicate = true;
      }
    }
    
    if (isDuplicate) {
      return res.status(409).json({ error: 'A user with this phone number is already registered' });
    }
    
    // Create user first to get ID (only if MongoDB is connected)
    let tempUser;
    try {
      if (mongoose.connection.readyState === 1) {
        tempUser = new User({
          name: name.trim(),
          phone: phone.trim(),
          photo_path: 'pending',
          pdf_path: 'pending'
        });
        await tempUser.save();
      } else {
        // Generate a mock ID for development without MongoDB
        tempUser = { _id: `temp_${Date.now()}` };
      }
    } catch (validationError) {
      if (validationError.code === 11000) {
        return res.status(409).json({ error: 'A user with this phone number already exists' });
      }
      return res.status(400).json({ error: validationError.message });
    }
    
    // Upload photo to Cloudinary with proper error handling
    try {
      const photoResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
          folder: 'tamilnadu/photos',
          resource_type: 'image',
        }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
        
        uploadStream.on('error', (error) => {
          reject(error);
        });
        
        uploadStream.end(req.file.buffer);
      });
      
      try {
        // Generate PDF with actual user ID
        const pdfPath = await generateUserPDF({
          name,
          userId: tempUser._id.toString(),
          outputDir: __dirname,
        });
        
        try {
          // Upload PDF to Cloudinary
          const pdfResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(pdfPath, {
              folder: 'tamilnadu/pdfs',
              resource_type: 'raw',
            }, (err, pdfResult) => {
              if (err) reject(err);
              else resolve(pdfResult);
            });
          });
          
          try {
            // Update user with Cloudinary URLs (only if MongoDB is connected)
            if (mongoose.connection.readyState === 1) {
              await User.findByIdAndUpdate(tempUser._id, {
                photo_path: photoResult.secure_url,
                pdf_path: pdfResult.secure_url
              }).catch(() => {});
            }
            
            // Clean up local PDF file
            fs.unlink(pdfPath, (err) => {
              if (err) console.error('Failed to clean up PDF:', err);
            });
            
            // Add phone number to in-memory storage for development
            if (mongoose.connection.readyState !== 1) {
              registeredPhoneNumbers.add(cleanPhone);
            }
            
            res.json({ success: true, id: tempUser._id, pdf: pdfResult.secure_url });
          } catch (updateError) {
            console.error('User update error:', updateError);
            // Clean up user from MongoDB if it was saved
            if (mongoose.connection.readyState === 1 && tempUser._id.toString().startsWith('temp_') === false) {
              await User.findByIdAndDelete(tempUser._id).catch(() => {});
            }
            throw updateError;
          }
        } catch (pdfUploadError) {
          console.error('PDF upload error:', pdfUploadError);
          // Clean up user from MongoDB if it was saved
          if (mongoose.connection.readyState === 1 && tempUser._id.toString().startsWith('temp_') === false) {
            await User.findByIdAndDelete(tempUser._id).catch(() => {});
          }
          throw pdfUploadError;
        }
      } catch (pdfError) {
        console.error('PDF generation error:', pdfError);
        // Clean up user from MongoDB if it was saved
        if (mongoose.connection.readyState === 1 && tempUser._id.toString().startsWith('temp_') === false) {
          await User.findByIdAndDelete(tempUser._id).catch(() => {});
        }
        throw pdfError;
      }
    } catch (photoError) {
      console.error('Photo upload error:', photoError);
      // Clean up user from MongoDB if it was saved
      if (mongoose.connection.readyState === 1 && tempUser._id.toString().startsWith('temp_') === false) {
        await User.findByIdAndDelete(tempUser._id).catch(() => {});
      }
      return res.status(500).json({ error: 'Photo upload failed', details: photoError.message });
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
