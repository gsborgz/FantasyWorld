import { RedisModuleOptions } from '@nestjs-modules/ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

export const RedisConfig: RedisModuleOptions = {
  type: 'single',
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  options: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: process.env.REDIS_USERNAME || undefined,
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB),
  }
};
