import { AmplifyError } from '@aws-amplify/core';
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Use existing badge design - no duplicate code needed

// Load environment variables
dotenv.config();

// Use underscore-prefixed environment variables for AWS
const AWS_CONFIG = {
  ACCESS_KEY_ID: process.env._AWS_ACCESS_KEY_ID,
  SECRET_ACCESS_KEY: process.env._AWS_SECRET_ACCESS_KEY,
  REGION: process.env._AWS_REGION || 'eu-north-1',
  S3_BUCKET_NAME: process.env._AWS_S3_BUCKET_NAME
};

// Validate environment variables
if (!process.env.MONGODB_URI) {
  console.warn('⚠️ MONGODB_URI not configured - using mock database');
}

if (!AWS_CONFIG.ACCESS_KEY_ID || !AWS_CONFIG.SECRET_ACCESS_KEY) {
  console.warn('⚠️ AWS credentials not configured - using mock data');
}

if (!AWS_CONFIG.S3_BUCKET_NAME) {
  console.warn('⚠️ S3 bucket name not configured - using mock data');
}

// Express app for Lambda
const app = express();

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Memory storage for file uploads
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

// Mock MongoDB connection (replace with real MongoDB in production)
const mockDatabase = {
  users: [],
  findByPhone: function(phone) {
    return this.users.find(user => user.phone === phone);
  },
  save: function(userData) {
    userData.id = Date.now().toString();
    this.users.push(userData);
    return userData;
  }
};

// Registration endpoint
export const handler = async (event) => {
  try {
    // Parse the event body
    const { name, phone, photo } = JSON.parse(event.body);
    
    // Validation
    if (!name || !phone) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'Name and phone are required' })
      };
    }
    
    if (name.length < 2 || name.length > 50) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'Name must be between 2 and 50 characters' })
      };
    }
    
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'Invalid Indian mobile number' })
      };
    }
    
    // Check for duplicate
    const existingUser = mockDatabase.findByPhone(phone);
    if (existingUser) {
      return {
        statusCode: 409,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'This phone number is already registered' })
      };
    }
    
    // Generate mock PDF and badge
    const registrationId = `REG${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Mock PDF data (base64)
    const mockPDF = 'JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDMgMCBSL1Jlc291cmNlczw8L0ZvbnQ8PC9GMSA0IDAgUj4+Pj4vTWVkaWFCb3hbWCAwIDAgNjEyIDc5Ml0+Pj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZS9QYWdlcy9Db3VudCAxL0tpZHNbMiAwIF0+PgplbmRvYmoKNCAwIG9iago8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9IZWx2ZXRpY2E+PgplbmRvYmoKeHJlZgowIDUKJSVFT0Y=';
    
    // Create a simple visible badge (blue rectangle)
    const badgeBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAVlpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KTMInWQAAABxJREFUGBljZGBg+M9AAWCiIFgYBiiwAAG0BIBJgAAAAASUVORK5CYII=';
    
    // Save to mock database
    const userData = {
      registrationId,
      name,
      phone,
      pdfUrl: `data:application/pdf;base64,${mockPDF}`,
      badgeUrl: badgeBase64,
      registeredAt: new Date().toISOString()
    };
    
    mockDatabase.save(userData);
    
    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        success: true,
        registrationId,
        name,
        phone,
        pdf: `data:application/pdf;base64,${mockPDF}`,
        badge: badgeBase64,
        message: 'Registration successful'
      })
    };
    
  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        error: 'Registration failed',
        details: error.message
      })
    };
  }
};
