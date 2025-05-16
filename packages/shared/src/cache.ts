import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));

export const cache = {
  async get(key: string) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  async set(key: string, value: any, ttlSeconds?: number) {
    try {
      const stringValue = JSON.stringify(value);
      if (ttlSeconds) {
        await redisClient.setEx(key, ttlSeconds, stringValue);
      } else {
        await redisClient.set(key, stringValue);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  async del(key: string) {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  },
}; 