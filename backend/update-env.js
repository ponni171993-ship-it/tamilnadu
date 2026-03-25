import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 AWS Credentials Setup\n');

rl.question('Enter your AWS Access Key ID: ', (accessKeyId) => {
  rl.question('Enter your AWS Secret Access Key: ', (secretAccessKey) => {
    rl.question('Enter your S3 Bucket Name: ', (bucketName) => {
      
      const envPath = '.env';
      let envContent = '';
      
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
      
      // Update AWS variables
      const awsConfig = `
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=${accessKeyId}
AWS_SECRET_ACCESS_KEY=${secretAccessKey}
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=${bucketName}`;
      
      // Remove existing AWS variables
      envContent = envContent.replace(/# AWS S3 Configuration[\s\S]*?(?=\n#|$)/g, '').trim();
      
      // Add new AWS variables
      envContent += awsConfig;
      
      fs.writeFileSync(envPath, envContent.trim());
      
      console.log('✅ AWS credentials added to .env file');
      console.log('🧪 Testing credentials...');
      
      // Test the credentials
      import('@aws-sdk/client-s3').then(({ S3Client, ListBucketsCommand }) => {
        const s3Client = new S3Client({
          region: 'ap-south-1',
          credentials: {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey
          }
        });
        
        const command = new ListBucketsCommand({});
        s3Client.send(command).then(response => {
          console.log('✅ IAM user has S3 access!');
          console.log('📦 Buckets accessible:', response.Buckets.length);
          console.log('🎉 Ready for S3 setup!');
          rl.close();
        }).catch(error => {
          console.log('❌ Credentials test failed:', error.message);
          rl.close();
        });
      });
    });
  });
});
