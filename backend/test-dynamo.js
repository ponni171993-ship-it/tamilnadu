import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.s3' });
dotenv.config();

const client = new DynamoDBClient({
  region: process.env._AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env._AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env._AWS_SECRET_ACCESS_KEY
  }
});

async function check() {
  try {
    const command = new ListTablesCommand({});
    const response = await client.send(command);
    console.log('✅ DynamoDB connection successful!');
    console.log('📦 Tables:', response.TableNames);
  } catch (error) {
    console.error('❌ DynamoDB connection failed:', error.message);
  }
}

check();
