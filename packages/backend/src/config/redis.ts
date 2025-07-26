import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Create Redis client but don't connect automatically
let redisClient: any = null;

const createRedisClient = () => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err: any) => {
      console.error('Redis Client Error', err);
    });

    redisClient.on('connect', () => {
      console.log('Connected to Redis');
    });
  }
  return redisClient;
};

export const connectRedis = async () => {
  try {
    const client = createRedisClient();
    if (!client.isOpen) {
      await client.connect();
    }
    return client;
  } catch (error) {
    console.log('Redis connection failed, continuing without caching');
    throw error;
  }
};

export const disconnectRedis = async () => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.disconnect();
  }
};

export const getRedisClient = () => {
  return redisClient;
};

export default null; // Don't export a connected client by default