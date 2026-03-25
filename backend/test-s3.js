import { uploadPDFToS3 } from './s3Util.js';
import fs from 'fs';

console.log('🧪 Testing AWS S3 Connection...\n');

// Create a test PDF buffer
const testPDFContent = 'Test PDF content for S3 upload';
const testBuffer = Buffer.from(testPDFContent);

async function testS3Connection() {
  try {
    console.log('📤 Uploading test file to S3...');
    
    const fileName = `test-${Date.now()}.pdf`;
    const uploadUrl = await uploadPDFToS3(testBuffer, fileName);
    
    console.log('✅ S3 upload successful!');
    console.log('🔗 File URL:', uploadUrl);
    console.log('📁 File name:', fileName);
    
    console.log('\n🎉 S3 is ready for deployment!');
    
  } catch (error) {
    console.log('❌ S3 connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check AWS credentials in .env file');
    console.log('2. Verify bucket exists and has correct permissions');
    console.log('3. Ensure IAM user has S3FullAccess permissions');
    console.log('4. Check bucket name is correct and unique');
  }
}

testS3Connection();
