import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

// AWS Secrets Manager - Most secure option for AWS deployments
class SecretsManager {
  constructor() {
    this.client = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'eu-north-1'
    });
  }

  async getSecret(secretName) {
    try {
      const command = new GetSecretValueCommand({
        SecretId: secretName
      });
      
      const response = await this.client.send(command);
      
      if (response.SecretString) {
        return JSON.parse(response.SecretString);
      }
      
      return response.SecretBinary;
    } catch (error) {
      console.error('Error retrieving secret:', error);
      throw error;
    }
  }
}

// Usage example
const secrets = new SecretsManager();

export async function getDatabaseConfig() {
  const secret = await secrets.getSecret('tamilnadu-db-credentials');
  return {
    mongodbUri: secret.MONGODB_URI,
    dbUser: secret.DB_USER,
    dbPassword: secret.DB_PASSWORD
  };
}

export async function getAWSConfig() {
  const secret = await secrets.getSecret('tamilnadu-aws-credentials');
  return {
    accessKeyId: secret.AWS_ACCESS_KEY_ID,
    secretAccessKey: secret.AWS_SECRET_ACCESS_KEY,
    region: secret.AWS_REGION,
    bucketName: secret.AWS_S3_BUCKET_NAME
  };
}
