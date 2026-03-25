import { SSMClient, GetParametersByPathCommand } from '@aws-sdk/client-ssm';

// AWS Parameter Store - Good for configuration values
class ParameterStore {
  constructor() {
    this.client = new SSMClient({
      region: process.env.AWS_REGION || 'eu-north-1'
    });
  }

  async getParameters(path) {
    try {
      const command = new GetParametersByPathCommand({
        Path: path,
        Recursive: true,
        WithDecryption: true
      });
      
      const response = await this.client.send(command);
      
      // Convert parameters to key-value object
      const params = {};
      response.Parameters.forEach(param => {
        const key = param.Name.split('/').pop();
        params[key] = param.Value;
      });
      
      return params;
    } catch (error) {
      console.error('Error retrieving parameters:', error);
      throw error;
    }
  }
}

// Usage example
const paramStore = new ParameterStore();

export async function getConfig() {
  const config = await paramStore.getParameters('/tamilnadu-app/');
  return {
    mongodbUri: config.MONGODB_URI,
    awsRegion: config.AWS_REGION,
    s3Bucket: config.AWS_S3_BUCKET_NAME
  };
}
