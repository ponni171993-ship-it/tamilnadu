# Deployment Guide for AWS Amplify + S3 + MongoDB Atlas

## Prerequisites
1. AWS Account
2. MongoDB Atlas Account
3. GitHub Account
4. Node.js 18+ installed
5. AWS Amplify CLI installed

## Step 1: MongoDB Atlas Setup
1. Go to https://cloud.mongodb.com
2. Create free M0 cluster
3. Create database user with username/password
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/dbname`
5. Add your IP to Network Access whitelist

## Step 2: AWS S3 Setup
1. Go to AWS Console → S3 → Create bucket
2. Bucket name: `your-unique-bucket-name`
3. Region: us-east-1 (or your preferred region)
4. Block all public access (recommended)
5. Create IAM user with S3 permissions
6. Get Access Key ID and Secret Access Key

## Step 3: Backend Deployment (Amplify Functions)

### Install Amplify CLI
```bash
npm install -g @aws-amplify/cli
amplify configure
```

### Initialize Backend
```bash
cd backend
amplify init
# Choose: JavaScript, Node.js, us-east-1
```

### Add Function
```bash
amplify add function
# Function name: tamilnadu-backend
# Runtime: Node.js 18.x
```

### Configure Environment Variables
```bash
amplify update function
# Add these environment variables:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_REGION=us-east-1
```

### Deploy Backend
```bash
amplify push
```

## Step 4: Frontend Deployment (Amplify Console)

### Initialize Frontend
```bash
cd ../frontend
amplify init
# Choose: JavaScript, React, us-east-1
```

### Add Hosting
```bash
amplify add hosting
# Choose: Continuous deployment (Git-based)
# Connect to your GitHub repository
```

### Update API URL
Edit `.env.production`:
```bash
VITE_API_URL=https://your-backend-url.amplifyapp.com
```

### Deploy Frontend
```bash
amplify publish
```

## Step 5: Post-Deployment Configuration

### Update CORS in S3
1. Go to S3 bucket → Permissions → CORS configuration
2. Add:
```xml
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedMethod>DELETE</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
  </CORSRule>
</CORSConfiguration>
```

### Test Endpoints
- Frontend: https://your-frontend-url.amplifyapp.com
- Backend: https://your-backend-url.amplifyapp.com
- API Test: https://your-backend-url.amplifyapp.com/download/1234567890

## Cost Monitoring
- AWS Free Tier covers first 1 lakh users
- Monitor costs in AWS Billing Dashboard
- Set up billing alerts

## Troubleshooting
1. **Function timeouts**: Increase timeout in amplify.yml
2. **CORS errors**: Check Amplify CORS configuration
3. **S3 access denied**: Verify IAM permissions
4. **MongoDB connection failed**: Check IP whitelist and credentials
