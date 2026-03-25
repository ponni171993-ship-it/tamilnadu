import fs from 'fs';
import path from 'path';

console.log('🚀 AWS S3 Setup Helper\n');

// Check if AWS variables are configured
const envPath = path.join(process.cwd(), '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ .env file found');
} else {
  console.log('❌ .env file not found - creating one');
  envContent = '';
}

// AWS variables to add
const awsVariables = `
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here  
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=tamilnadu-voting-app-bucket
`;

// Check if AWS variables already exist
if (envContent.includes('AWS_ACCESS_KEY_ID')) {
  console.log('⚠️  AWS variables already exist in .env');
  console.log('📝 Please update them with your actual credentials');
} else {
  // Add AWS variables
  fs.appendFileSync(envPath, awsVariables);
  console.log('✅ AWS variables added to .env');
}

console.log('\n📋 Next Steps:');
console.log('1. Update .env with your actual AWS credentials');
console.log('2. Create S3 bucket: tamilnadu-voting-app-bucket');
console.log('3. Test S3 connection with: node test-s3.js');
console.log('\n🔗 AWS Console Links:');
console.log('- S3: https://console.aws.amazon.com/s3/');
console.log('- IAM: https://console.aws.amazon.com/iam/');
