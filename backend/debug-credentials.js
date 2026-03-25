import dotenv from 'dotenv';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

// Load environment variables
dotenv.config();

console.log('🔍 Debugging AWS Credentials\n');

// Show what we're working with
console.log('📋 Environment Variables:');
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID?.substring(0, 8) + '...');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY?.substring(0, 8) + '...');
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME);
console.log('');

// Test with explicit configuration
try {
  console.log('🧪 Testing S3 connection...');
  
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  
  const command = new ListBucketsCommand({});
  const response = await s3Client.send(command);
  
  console.log('✅ S3 connection successful!');
  console.log('📦 Number of buckets:', response.Buckets.length);
  response.Buckets.forEach((bucket, index) => {
    console.log(`   ${index + 1}. ${bucket.Name}`);
  });
  
} catch (error) {
  console.log('❌ S3 connection failed');
  console.log('🔍 Error details:', error.message);
  console.log('🔍 Error name:', error.name);
  console.log('🔍 Error code:', error.Code || 'N/A');
  
  // Common issues and solutions
  console.log('\n🔧 Possible Solutions:');
  
  if (error.message.includes('credential')) {
    console.log('1. Check AWS_ACCESS_KEY_ID is correct (20 characters)');
    console.log('2. Check AWS_SECRET_ACCESS_KEY is correct (40 characters)');
    console.log('3. Ensure no extra spaces or quotes in credentials');
  }
  
  if (error.message.includes('region')) {
    console.log('4. Verify AWS_REGION is set to ap-south-1');
  }
  
  if (error.message.includes('permission')) {
    console.log('5. Ensure IAM user has S3FullAccess permission');
  }
}
