import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

console.log('🔍 Environment Variables Status:\n');

// Check if .env file exists
if (fs.existsSync('.env')) {
  console.log('✅ .env file found');
  
  // Read and display .env content (without showing secrets)
  const envContent = fs.readFileSync('.env', 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    if (line.includes('AWS_ACCESS_KEY_ID')) {
      const hasValue = line.split('=')[1]?.trim();
      console.log(`AWS_ACCESS_KEY_ID: ${hasValue ? '✅ SET' : '❌ MISSING'}`);
    } else if (line.includes('AWS_SECRET_ACCESS_KEY')) {
      const hasValue = line.split('=')[1]?.trim();
      console.log(`AWS_SECRET_ACCESS_KEY: ${hasValue ? '✅ SET' : '❌ MISSING'}`);
    } else if (line.includes('AWS_REGION')) {
      const hasValue = line.split('=')[1]?.trim();
      console.log(`AWS_REGION: ${hasValue || '❌ MISSING'}`);
    } else if (line.includes('AWS_S3_BUCKET_NAME')) {
      const hasValue = line.split('=')[1]?.trim();
      console.log(`AWS_S3_BUCKET_NAME: ${hasValue || '❌ MISSING'}`);
    }
  });
  
} else {
  console.log('❌ .env file not found');
  console.log('📝 Creating .env file with AWS template...');
  
  const envTemplate = `# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=tamilnadu-voting-app-bucket

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
`;
  
  fs.writeFileSync('.env', envTemplate);
  console.log('✅ .env file created with template');
  console.log('📝 Please update with your actual AWS credentials');
}

console.log('\n🔧 Process Environment Variables:');
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ LOADED' : '❌ NOT LOADED');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ LOADED' : '❌ NOT LOADED');
console.log('AWS_REGION:', process.env.AWS_REGION || '❌ NOT LOADED');
console.log('AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME || '❌ NOT LOADED');
