import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

console.log('🧪 Testing IAM User Permissions...\n');

// Test S3 access with IAM user
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function testIAMUser() {
  try {
    console.log('🔍 Checking S3 permissions...');
    
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    
    console.log('✅ IAM user has S3 access!');
    console.log('📦 Buckets you can access:', response.Buckets.length);
    console.log('🔑 IAM user is working correctly!');
    
    // Check if our bucket exists
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (bucketName) {
      const hasBucket = response.Buckets.some(bucket => bucket.Name === bucketName);
      if (hasBucket) {
        console.log(`✅ Bucket "${bucketName}" found and accessible`);
      } else {
        console.log(`⚠️  Bucket "${bucketName}" not found - you may need to create it`);
      }
    }
    
  } catch (error) {
    console.log('❌ IAM user test failed:', error.message);
    console.log('\n🔧 Possible issues:');
    console.log('1. Access keys are incorrect');
    console.log('2. IAM user lacks S3 permissions');
    console.log('3. Region is not configured correctly');
    console.log('4. AWS credentials not set in environment');
  }
}

testIAMUser();
