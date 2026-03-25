import crypto from 'crypto';

// Encrypted Configuration - For sensitive data
class EncryptedConfig {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.tagLength = 16;
  }

  // Generate encryption key from environment variable
  getEncryptionKey() {
    const secret = process.env.ENCRYPTION_SECRET || 'default-secret-change-in-production';
    return crypto.scryptSync(secret, 'salt', this.keyLength);
  }

  encrypt(text) {
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(this.ivLength);
    
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from('additional-data'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  decrypt(encryptedData) {
    const key = this.getEncryptionKey();
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    
    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAuthTag(tag);
    decipher.setAAD(Buffer.from('additional-data'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// Usage example
const encryptedConfig = new EncryptedConfig();

// Store encrypted configuration
const sensitiveData = {
  mongodbUri: 'mongodb+srv://...actual-uri...',
  awsSecretKey: 'actual-secret-key'
};

const encrypted = encryptedConfig.encrypt(JSON.stringify(sensitiveData));
console.log('Encrypted config:', encrypted);

// Decrypt when needed
const decrypted = JSON.parse(encryptedConfig.decrypt(encrypted));
console.log('Decrypted config:', decrypted);

export default EncryptedConfig;
