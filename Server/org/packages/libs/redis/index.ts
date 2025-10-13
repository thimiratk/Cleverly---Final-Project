import Redis from 'ioredis';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from the .env file in the project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Create Redis client with support for both Redis URL and individual config
const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL)
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0'),
    });

redis.on('connect', () => {
  console.log('✅ Connected to Redis successfully');
});

redis.on('ready', () => {
  console.log('🚀 Redis client is ready');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('close', () => {
  console.log('❌ Redis connection closed');
});

export default redis;