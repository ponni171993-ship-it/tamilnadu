import { AmplifyError } from '@aws-amplify/core';
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Import your existing working utilities
import { generateUserPDF } from '../../../backend/pdfUtil.js';
import { generateVotingBadge, generateSimpleVotingBadge } from '../../../backend/votingBadgeUtil.js';

// Load environment variables
dotenv.config();

// Initialize DynamoDB
const ddbClient = new DynamoDBClient({ region: process.env._AWS_REGION || 'eu-north-1' });
const docClient = DynamoDBDocumentClient.from(ddbClient);
const TABLE_NAME = 'users';

// DynamoDB functions
const checkDuplicatePhone = async (phone) => {
  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { phone }
    });
    const response = await docClient.send(command);
    return response.Item;
  } catch (error) {
    console.error('Error checking duplicate phone:', error);
    return null;
  }
};

const saveUser = async (userData) => {
  try {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        phone: userData.phone,
        name: userData.name,
        pdf_path: userData.pdf_path,
        photo_path: userData.photo_path,
        registeredAt: userData.registeredAt.toISOString()
      }
    });
    await docClient.send(command);
    console.log('✅ User saved to DynamoDB:', userData.phone);
    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
};

// Use underscore-prefixed environment variables for AWS
const AWS_CONFIG = {
  ACCESS_KEY_ID: process.env._AWS_ACCESS_KEY_ID,
  SECRET_ACCESS_KEY: process.env._AWS_SECRET_ACCESS_KEY,
  REGION: process.env._AWS_REGION || 'eu-north-1',
  S3_BUCKET_NAME: process.env._AWS_S3_BUCKET_NAME
};

console.log('✅ DynamoDB initialized for AWS region:', AWS_CONFIG.REGION);

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

// Registration endpoint
export const handler = async (event) => {
  try {
    console.log('🚀 Registration handler called with event:', { 
      method: event.requestContext?.http?.method, 
      path: event.rawPath,
      requestPath: event.requestContext?.http?.path
    });
    
    // Normalize path - remove trailing slash
    const normalizedPath = event.rawPath?.replace(/\/$/, '') || '';
    
    // Handle preflight requests
    if (event.requestContext?.http?.method === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      };
    }
    
    // Handle GET requests (for testing/health check)
    if (event.requestContext?.http?.method === 'GET') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'Registration endpoint is ready', timestamp: new Date().toISOString() })
      };
    }
    
    // Handle POST requests
    if (event.requestContext?.http?.method !== 'POST') {
      return {
        statusCode: 405,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }
    
    // Parse the event body
    let body = event.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch(e) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ error: 'Invalid JSON in request body' })
        };
      }
    }
    
    const { name, phone, photo } = body;
    
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
    
    // Check for duplicate in DynamoDB
    const existingUser = await checkDuplicatePhone(phone);
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
    
    // Generate real PDF and badge using your existing working code
    const registrationId = `REG${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Generate PDF using your existing utility
    let pdfBase64 = null;
    try {
      const pdfBuffer = await generateUserPDF({
        name,
        phone,
        userPhotoBuffer: photo ? Buffer.from(photo, 'base64') : null, // Convert base64 photo back to buffer
        userId: phone,
        outputDir: '/tmp' // Use temp directory for Amplify
      });
      pdfBase64 = pdfBuffer.toString('base64');
      console.log('✅ PDF generated successfully');
    } catch (pdfError) {
      console.error('❌ PDF generation error:', pdfError);
    }
    
    // Generate badge using your existing voting badge utility
    let badgeBase64 = null;
    try {
      console.log('🎨 Starting badge generation...');
      const votingBadgeBuffer = await generateVotingBadge({ 
        name: name.trim(), 
        phone: phone.trim(), 
        userPhotoBuffer: photo ? Buffer.from(photo, 'base64') : null
      });
      badgeBase64 = `data:image/png;base64,${votingBadgeBuffer.toString('base64')}`;
      console.log('✅ Badge generated successfully');
    } catch (badgeError) {
      console.error('❌ Badge generation error:', badgeError);
      // Fallback to simple badge if voting badge fails
      try {
        const simpleBadgeBuffer = await generateSimpleVotingBadge({ 
          name: name.trim(), 
          phone: phone.trim() 
        });
        badgeBase64 = `data:image/png;base64,${simpleBadgeBuffer.toString('base64')}`;
        console.log('✅ Simple badge generated as fallback');
      } catch (simpleBadgeError) {
        console.error('❌ Even simple badge failed:', simpleBadgeError);
      }
    }
    
    // Save to DynamoDB
    const userData = {
      name: name.trim(),
      phone: phone.trim(),
      pdf_path: `user-${phone}.pdf`,
      photo_path: `photo-${phone}.jpeg`,
      registeredAt: new Date()
    };
    
    const saved = await saveUser(userData);
    if (!saved) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'Failed to save user data' })
      };
    }
    
    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        registrationId,
        name,
        phone,
        pdf: pdfBase64 ? `data:application/pdf;base64,${pdfBase64}` : null,
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
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Registration failed',
        details: error.message
      })
    };
  }
};
