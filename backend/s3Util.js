import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

// S3 Configuration with better error handling
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// Validate S3 configuration
if (!BUCKET_NAME) {
  throw new Error('AWS_S3_BUCKET_NAME environment variable is required');
}

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error('AWS credentials are required');
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

export default s3Client;
