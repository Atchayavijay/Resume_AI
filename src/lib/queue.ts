import { Queue, ConnectionOptions } from 'bullmq';

const REDIS_URL = process.env.REDIS_URL;

export const isQueueEnabled = !!REDIS_URL;

const getRedisConnection = (): ConnectionOptions => {
  if (!REDIS_URL) {
    return { host: 'localhost', port: 6379 };
  }
  
  try {
    const redisUrl = new URL(REDIS_URL);
    return {
      host: redisUrl.hostname,
      port: parseInt(redisUrl.port),
      password: redisUrl.password,
      username: redisUrl.username,
      maxRetriesPerRequest: null,
    };
  } catch (e) {
    console.error('Invalid REDIS_URL:', REDIS_URL);
    return { host: 'localhost', port: 6379 };
  }
};

export const connection = getRedisConnection();

export const pdfQueue = isQueueEnabled 
  ? new Queue('pdf-generation', {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    })
  : null as any; // Cast to any to maintain type compatibility in routes if needed
