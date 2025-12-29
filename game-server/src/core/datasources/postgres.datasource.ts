import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const entities = [];

export const Datasource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  ssl: process.env.POSTGRES_SSLMODE === 'require' ? { rejectUnauthorized: false } : false,
  synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
  logging: false,
  migrations: [__dirname + '/../migration/*.{ts,js}'],
  entities,
  extra: {
    max: Number(process.env.POSTGRES_POOLSIZE) || 10,
    idleTimeoutMillis: Number(process.env.POSTGRES_IDLE_TIMEOUT) || 30000,
    connectionTimeoutMillis: Number(process.env.POSTGRES_CONN_TIMEOUT) || 5000
  },
});
