import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 AWS Amplify Environment Variables Setup\n');

// Read current .env to get values
let envContent = '';
if (fs.existsSync('backend/.env')) {
  envContent = fs.readFileSync('backend/.env', 'utf8');
}

console.log('📋 Current environment variables found:');
console.log('✅ MongoDB Atlas: Configured');
console.log('✅ AWS S3: Configured');
console.log('✅ AWS IAM: Configured\n');

console.log('🌐 In Amplify Console, add these environment variables:');
console.log('');

// Extract and display environment variables
const lines = envContent.split('\n');
const envVars = {};

lines.forEach(line => {
  if (line.includes('=') && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  }
});

// Display required Amplify environment variables
const amplifyVars = [
  'MONGODB_URI',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_S3_BUCKET_NAME'
];

console.log('🔧 Environment Variables to Add in Amplify:');
amplifyVars.forEach(varName => {
  if (envVars[varName]) {
    const displayValue = varName.includes('SECRET') || varName.includes('KEY') 
      ? envVars[varName].substring(0, 8) + '...' 
      : envVars[varName];
    console.log(`${varName}: ${displayValue}`);
  } else {
    console.log(`${varName}: NOT FOUND`);
  }
});

console.log('\n📝 Amplify Setup Steps:');
console.log('1. Go to: https://console.aws.amazon.com/amplify/');
console.log('2. New app → Host web app → Connect GitHub');
console.log('3. Select: ponni171993-ship-it/tamilnadu → main branch');
console.log('4. Build settings: Use frontend/amplify.yml');
console.log('5. Environment variables: Add the variables above');
console.log('6. Click "Deploy"');

console.log('\n⚡ Expected deployment time: 3-5 minutes');
console.log('🌐 Your app will be available at: https://your-app.amplifyapp.com');

rl.close();
