import fs from 'fs';
import path from 'path';

// Configuration Manager - Uses JSON files instead of .env
class ConfigManager {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, 'config', `${this.environment}.json`);
      
      if (!fs.existsSync(configPath)) {
        throw new Error(`Configuration file not found: ${configPath}`);
      }
      
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      console.error('Error loading configuration:', error);
      process.exit(1);
    }
  }

  get(key) {
    const keys = key.split('.');
    let value = this.config;
    
    for (const k of keys) {
      value = value[k];
      if (value === undefined) {
        throw new Error(`Configuration key not found: ${key}`);
      }
    }
    
    return value;
  }

  getAll() {
    return this.config;
  }
}

// Usage example
const config = new ConfigManager();

export const databaseConfig = {
  mongodbUri: config.get('database.mongodbUri')
};

export const awsConfig = {
  region: config.get('aws.region'),
  s3Bucket: config.get('aws.s3Bucket')
};

export const appConfig = {
  port: config.get('app.port'),
  environment: config.get('app.environment'),
  logLevel: config.get('app.logLevel')
};
