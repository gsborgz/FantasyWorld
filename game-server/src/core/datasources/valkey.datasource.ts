import Redis from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (value === undefined) return fallback;
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
};

const host = process.env.VALKEY_HOST || process.env.REDIS_HOST || '127.0.0.1';
const port = parseNumber(process.env.VALKEY_PORT ?? process.env.REDIS_PORT, 6379);
const rawPassword = process.env.VALKEY_PASSWORD ?? process.env.REDIS_PASSWORD;
const password = rawPassword && rawPassword.trim().length > 0 ? rawPassword : undefined;
const db = parseNumber(process.env.VALKEY_DB ?? process.env.REDIS_DB, 0);
const rawUsername = process.env.VALKEY_USERNAME ?? process.env.REDIS_USERNAME;
const username = rawUsername && rawUsername.trim().length > 0 ? rawUsername : undefined;

export const valkey = new Redis({
  host,
  port,
  username,
  password,
  db,
  retryStrategy: (times: number) => Math.min(times * 200, 2000),
  enableAutoPipelining: true,
});

export function makeKey(parts: string[]): string {
  return parts.join(':');
}

export const keys = {
  session: (sid: string) => makeKey(['ws', 'session', sid]),
  clientSet: makeKey(['ws', 'clients']),
  instanceClients: (path: string) => makeKey(['ws', 'instance', path, 'clients']),
  clientCurrentInstance: (clientId: string) => makeKey(['ws', 'client', clientId, 'instance']),
};
