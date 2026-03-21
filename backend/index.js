import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateUserPDF } from './pdfUtil.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});
const upload = multer({ storage });


// MongoDB integration
import connectMongo from './mongoUtil.js';
import User from './models/User.js';
connectMongo();

// Register endpoint
app.post('/register', upload.single('photo'), async (req, res) => {
  try {
    const { name, phone } = req.body;
    const photo = req.file ? req.file.filename : null;
    if (!name || !phone || !photo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Generate PDF
    const pdfPath = await generateUserPDF({
      name,
      userId: null, // MongoDB will generate _id
      outputDir: path.join(__dirname, 'uploads'),
    });
    // Insert user into MongoDB
    const newUser = new User({
      name,
      phone,
      photo_path: photo,
      pdf_path: pdfPath
    });
    await newUser.save();
    // Return relative path for frontend download
    const downloadPath = `/uploads/${path.basename(pdfPath)}`;
    res.json({ success: true, id: newUser._id, pdf: downloadPath });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
