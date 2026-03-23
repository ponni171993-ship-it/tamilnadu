import dotenv from 'dotenv';
dotenv.config({ path: '.env.s3' });
dotenv.config(); // Also load regular .env file

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
// S3 imports commented out - using local storage
// import { uploadPDFToS3, getPDFFromS3 } from './s3Util.js';
import { generateWhatsAppBadge, generateSimpleBadge } from './badgeUtil.js';
import { generateVotingBadge, generateSimpleVotingBadge } from './votingBadgeUtil.js';

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
      // Generate PDF first (local storage - S3 disabled)
      const pdfFileName = `user-${cleanPhone}.pdf`;
      const pdfPath = path.join(__dirname, 'uploads', pdfFileName);
      
      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      await generateUserPDF({
        name,
        phone: cleanPhone,
        photo: req.file.buffer, // Still using buffer from memory upload
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
      
      // Save user with local PDF and photo paths (if MongoDB is connected)
      if (mongoose.connection.readyState === 1) {
        const newUser = new User({
          name: name.trim(),
          phone: phone.trim(),
          pdf_path: pdfFileName, // Using local path instead of S3 URL
          photo_path: newPhotoName, // Store renamed photo filename
          // pdf_url: s3Url // S3 URL commented out
        });
        
        await newUser.save();
        
        // Add phone number to in-memory storage for development
        if (mongoose.connection.readyState !== 1) {
          registeredPhoneNumbers.add(cleanPhone);
        }
        
        // Return PDF as base64 for download
        const pdfBuffer = fs.readFileSync(pdfPath);
        const pdfBase64 = pdfBuffer.toString('base64');
        
        // Generate voting badge for download
        let badgeBase64 = null;
        try {
          console.log('Starting badge generation for registration...');
          console.log('Photo path:', newPhotoPath);
          
          if (fs.existsSync(newPhotoPath)) {
            const userPhotoBuffer = fs.readFileSync(newPhotoPath);
            console.log('Photo buffer size:', userPhotoBuffer.length);
            
            const votingBadgeBuffer = await generateVotingBadge({ 
              name: name.trim(), 
              phone: phone.trim(), 
              userPhotoBuffer 
            });
            
            console.log('Badge generated successfully, size:', votingBadgeBuffer.length);
            badgeBase64 = `data:image/png;base64,${votingBadgeBuffer.toString('base64')}`;
          } else {
            console.error('Photo file not found:', newPhotoPath);
          }
        } catch (badgeError) {
          console.error('Badge generation error during registration:', badgeError);
          console.error('Error stack:', badgeError.stack);
        }
        
        res.json({ 
          success: true, 
          id: newUser._id, 
          pdf: `data:application/pdf;base64,${pdfBase64}`,
          pdf_path: `/uploads/${pdfFileName}`, // Local path instead of S3 URL
          badge: badgeBase64, // Voting badge as base64
          badge_style: 'voting', // Badge style info
          // s3_url: s3Url // S3 URL commented out
        });
      } else {
        // In-memory storage for development without MongoDB
        const tempId = cleanPhone; // Use phone number as ID
        registeredPhoneNumbers.add(cleanPhone);
        
        // Read PDF as buffer for response
        const pdfBuffer = fs.readFileSync(pdfPath);
        const pdfBase64 = pdfBuffer.toString('base64');
        
        // Generate voting badge for download (in-memory mode)
        let badgeBase64 = null;
        try {
          console.log('Starting badge generation for registration (in-memory mode)...');
          console.log('Photo path:', newPhotoPath);
          
          if (fs.existsSync(newPhotoPath)) {
            const userPhotoBuffer = fs.readFileSync(newPhotoPath);
            console.log('Photo buffer size:', userPhotoBuffer.length);
            
            const votingBadgeBuffer = await generateVotingBadge({ 
              name: name.trim(), 
              phone: phone.trim(), 
              userPhotoBuffer 
            });
            
            console.log('Badge generated successfully, size:', votingBadgeBuffer.length);
            badgeBase64 = `data:image/png;base64,${votingBadgeBuffer.toString('base64')}`;
          } else {
            console.error('Photo file not found:', newPhotoPath);
          }
        } catch (badgeError) {
          console.error('Badge generation error during registration:', badgeError);
          console.error('Error stack:', badgeError.stack);
        }
        
        res.json({ 
          success: true, 
          id: tempId, 
          pdf: `data:application/pdf;base64,${pdfBase64}`,
          pdf_path: `/uploads/${pdfFileName}`, // Local path
          badge: badgeBase64, // Voting badge as base64
          badge_style: 'voting' // Badge style info
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

// Download PDF by phone number (force download) - Local Storage
app.get('/download/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    // Validate phone number format
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ phone: phone.trim() });
      if (!user) {
        return res.status(404).json({ error: 'User not found with this phone number' });
      }
      
      // Use local file path instead of S3
      const pdfPath = path.join(__dirname, 'uploads', user.pdf_path);
      
      // Check if file exists
      if (!fs.existsSync(pdfPath)) {
        return res.status(404).json({ error: 'PDF file not found' });
      }
      
      // Set headers for PDF download (force download)
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="registration-${phone}.pdf"`);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Send local file
      res.sendFile(pdfPath);
      
      // S3 code commented out:
      // const urlParts = user.pdf_url.split('/');
      // const fileName = urlParts[urlParts.length - 1];
      // const pdfStream = await getPDFFromS3(fileName);
      // pdfStream.pipe(res);
      
    } else {
      res.status(503).json({ error: 'Database not available' });
    }
  } catch (err) {
    console.error('Download PDF error:', err);
    res.status(500).json({ error: 'Failed to download PDF' });
  }
});

// Preview PDF by phone number (inline display) - Local Storage
app.get('/preview/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    // Validate phone number format
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ phone: phone.trim() });
      if (!user) {
        return res.status(404).json({ error: 'User not found with this phone number' });
      }
      
      // Use local file path instead of S3
      const pdfPath = path.join(__dirname, 'uploads', user.pdf_path);
      
      // Check if file exists
      if (!fs.existsSync(pdfPath)) {
        return res.status(404).json({ error: 'PDF file not found' });
      }
      
      // Set headers for PDF preview (inline display)
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="registration-${phone}.pdf"`);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      
      // Send local file
      res.sendFile(pdfPath);
      
      // S3 code commented out:
      // const urlParts = user.pdf_url.split('/');
      // const fileName = urlParts[urlParts.length - 1];
      // const pdfStream = await getPDFFromS3(fileName);
      // pdfStream.pipe(res);
      
    } else {
      res.status(503).json({ error: 'Database not available' });
    }
  } catch (err) {
    console.error('Preview PDF error:', err);
    res.status(500).json({ error: 'Failed to preview PDF' });
  }
});

// Get PDF metadata and URLs by phone number - Local Storage
app.get('/pdf-info/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    // Validate phone number format
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ phone: phone.trim() });
      if (!user) {
        return res.status(404).json({ error: 'User not found with this phone number' });
      }
      
      // Return PDF information with local paths
      res.json({
        success: true,
        user: {
          name: user.name,
          phone: user.phone,
          created_at: user.created_at
        },
        pdf: {
          download_url: `${req.protocol}://${req.get('host')}/download/${phone}`,
          preview_url: `${req.protocol}://${req.get('host')}/preview/${phone}`,
          local_path: `/uploads/${user.pdf_path}` // Local path instead of S3 URL
          // s3_url: user.pdf_url // S3 URL commented out
        }
      });
      
    } else {
      res.status(503).json({ error: 'Database not available' });
    }
  } catch (err) {
    console.error('PDF info error:', err);
    res.status(500).json({ error: 'Failed to get PDF information' });
  }
});

// Generate WhatsApp badge by phone number
app.get('/badge/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const { type = 'full', style = 'whatsapp' } = req.query; // 'full' or 'simple', 'whatsapp' or 'voting'
    
    // Validate phone number format
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ phone: phone.trim() });
      if (!user) {
        return res.status(404).json({ error: 'User not found with this phone number' });
      }
      
      // Generate badge
      const registrationDate = user.created_at ? 
        new Date(user.created_at).toLocaleDateString('en-IN') : 
        new Date().toLocaleDateString('en-IN');
      
      // Get user photo from stored file
      let userPhotoBuffer = null;
      try {
        // Read the user's uploaded photo file
        const photoPath = path.join(__dirname, 'uploads', user.photo_path);
        if (fs.existsSync(photoPath)) {
          userPhotoBuffer = fs.readFileSync(photoPath);
        }
      } catch (photoError) {
        console.error('Error getting user photo:', photoError);
        userPhotoBuffer = null;
      }
      
      let badgeBuffer;
      
      if (style === 'voting') {
        // Generate voting badge
        badgeBuffer = type === 'simple' ? 
          await generateSimpleVotingBadge({ 
            name: user.name, 
            phone: user.phone, 
            userPhotoBuffer 
          }) :
          await generateVotingBadge({ 
            name: user.name, 
            phone: user.phone, 
            userPhotoBuffer 
          });
      } else {
        // Generate WhatsApp badge (default)
        badgeBuffer = type === 'simple' ? 
          await generateSimpleBadge({ 
            name: user.name, 
            phone: user.phone, 
            userPhotoBuffer 
          }) :
          await generateWhatsAppBadge({ 
            name: user.name, 
            phone: user.phone, 
            registrationDate,
            userPhotoBuffer 
          });
      }
      
      // Set headers for image response
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      res.setHeader('Content-Disposition', `inline; filename="badge-${phone}.png"`);
      
      // Send image
      res.send(badgeBuffer);
      
    } else {
      res.status(503).json({ error: 'Database not available' });
    }
  } catch (err) {
    console.error('Badge generation error:', err);
    res.status(500).json({ error: 'Failed to generate badge' });
  }
});

// Get badge URLs and sharing info by phone number - Local Storage
app.get('/badge-info/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    // Validate phone number format
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ phone: phone.trim() });
      if (!user) {
        return res.status(404).json({ error: 'User not found with this phone number' });
      }
      
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      // Return badge information with local storage
      res.json({
        success: true,
        user: {
          name: user.name,
          phone: user.phone,
          created_at: user.created_at
        },
        badges: {
          // WhatsApp style badges
          whatsapp_full_url: `${baseUrl}/badge/${phone}?type=full&style=whatsapp`,
          whatsapp_simple_url: `${baseUrl}/badge/${phone}?type=simple&style=whatsapp`,
          
          // Voting style badges (new design)
          voting_full_url: `${baseUrl}/badge/${phone}?type=full&style=voting`,
          voting_simple_url: `${baseUrl}/badge/${phone}?type=simple&style=voting`,
          
          // Sharing URLs
          whatsapp_share_url: `https://wa.me/?text=${encodeURIComponent(`I'm registered! 🎉\nName: ${user.name}\nPhone: ${user.phone}\n\nView my certificate: ${baseUrl}/preview/${phone}\n\nGet your badge: ${baseUrl}/badge/${phone}`)}`,
          voting_share_url: `https://wa.me/?text=${encodeURIComponent(`I'm ready to vote! 🗳️\nName: ${user.name}\nPhone: ${user.phone}\n\nGet my voting badge: ${baseUrl}/badge/${phone}?style=voting`)}`,
          status_share_url: `https://wa.me/?text=${encodeURIComponent(`📱 Share this badge on WhatsApp status!\n\n${baseUrl}/badge/${phone}?type=simple`)}`,
        },
        pdf: {
          download_url: `${baseUrl}/download/${phone}`,
          preview_url: `${baseUrl}/preview/${phone}`,
          local_path: `/uploads/${user.pdf_path}` // Local path
        }
      });
      
    } else {
      res.status(503).json({ error: 'Database not available' });
    }
  } catch (err) {
    console.error('Badge info error:', err);
    res.status(500).json({ error: 'Failed to get badge information' });
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
