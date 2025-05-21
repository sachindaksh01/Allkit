require('dotenv').config();

module.exports = {
  // Server
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://mongodb:27017/allkit',
  
  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://redis:6379/1',
  
  // AWS S3
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  S3_BUCKET: process.env.S3_BUCKET || 'allkit-storage',
  
  // Security
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-here',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30m',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
}; 