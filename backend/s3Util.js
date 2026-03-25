import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use environment variables from AWS Amplify
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  forcePathStyle: true
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// Validate S3 configuration
if (!BUCKET_NAME) {
  throw new Error('AWS_S3_BUCKET_NAME environment variable is required');
}

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error('AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables are required');
}

// Upload PDF to S3
export async function uploadPDFToS3(pdfBuffer, fileName) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
      Metadata: {
        uploadedAt: new Date().toISOString()
      }
    });

    const result = await s3Client.send(command);
    console.log('PDF uploaded to S3:', result);
    
    // Return the S3 URL
    return `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload PDF to S3');
  }
}

// Get PDF from S3
export async function getPDFFromS3(fileName) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName
    });

    const result = await s3Client.send(command);
    return result.Body;
  } catch (error) {
    console.error('S3 download error:', error);
    throw new Error('Failed to retrieve PDF from S3');
  }
}

// Upload photo to S3
export async function uploadPhotoToS3(photoBuffer, fileName) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `photos/${fileName}`,
      Body: photoBuffer,
      ContentType: 'image/jpeg',
      Metadata: {
        uploadedAt: new Date().toISOString(),
        fileType: 'user-photo'
      }
    });

    const result = await s3Client.send(command);
    console.log('Photo uploaded to S3:', result);
    
    // Return S3 URL
    return `https://${BUCKET_NAME}.s3.amazonaws.com/photos/${fileName}`;
  } catch (error) {
    console.error('Photo upload error:', error);
    throw new Error('Failed to upload photo to S3');
  }
}

// Upload badge to S3
export async function uploadBadgeToS3(badgeBuffer, fileName) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `badges/${fileName}`,
      Body: badgeBuffer,
      ContentType: 'image/png',
      Metadata: {
        uploadedAt: new Date().toISOString(),
        fileType: 'voting-badge'
      }
    });

    const result = await s3Client.send(command);
    console.log('Badge uploaded to S3:', result);
    
    // Return S3 URL
    return `https://${BUCKET_NAME}.s3.amazonaws.com/badges/${fileName}`;
  } catch (error) {
    console.error('Badge upload error:', error);
    throw new Error('Failed to upload badge to S3');
  }
}

// Get photo from S3
export async function getPhotoFromS3(fileName) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `photos/${fileName}`
    });

    const result = await s3Client.send(command);
    return result.Body;
  } catch (error) {
    console.error('Photo download error:', error);
    throw new Error('Failed to retrieve photo from S3');
  }
}

// Get badge from S3
export async function getBadgeFromS3(fileName) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `badges/${fileName}`
    });

    const result = await s3Client.send(command);
    return result.Body;
  } catch (error) {
    console.error('Badge download error:', error);
    throw new Error('Failed to retrieve badge from S3');
  }
}

// List all files in a folder
export async function listS3Files(prefix = '') {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: 100
    });

    const result = await s3Client.send(command);
    return result.Contents || [];
  } catch (error) {
    console.error('List S3 files error:', error);
    throw new Error('Failed to list S3 files');
  }
}

// Delete file from S3
export async function deleteFromS3(key) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    const result = await s3Client.send(command);
    console.log('File deleted from S3:', result);
    return true;
  } catch (error) {
    console.error('Delete S3 file error:', error);
    throw new Error('Failed to delete file from S3');
  }
}

export default s3Client;
