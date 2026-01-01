import Redis from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

const host = process.env.REDIS_HOST || '127.0.0.1';
const port = Number(process.env.REDIS_PORT) || 6379;
const username = process.env.REDIS_USERNAME || undefined;
const password = process.env.REDIS_PASSWORD || undefined;
const db = Number(process.env.REDIS_DB) || 0;

const client = new Redis({ host, port, username, password, db });

async function main() {
  await client.set('fw:test:key', 'hello-redis');
  const value = await client.get('fw:test:key');
  console.log('Redis test value:', value);
  await client.quit();
}

main().catch((err) => {
  console.error('Redis test error:', err);
  process.exit(1);
});
