import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { Character } from '../entities/character.entity';

dotenv.config();

export const entities = [Character];

function resolveDatabaseName(): string | undefined {
  const isTest = process.env.NODE_ENV === 'test';
  const isProd = process.env.NODE_ENV === 'production';
  const isLocalMigration = !isProd && Array.isArray(process.argv) && process.argv.some((a) => /migration:(run|generate|create|revert)/.test(a));

  if (isTest) {
    if (process.env.POSTGRES_DB_TEST) {
      return process.env.POSTGRES_DB_TEST;
    } else {
      throw new Error('TEST environment requires POSTGRES_DB_TEST to be set');
    }
  }

  if (isLocalMigration) {
    if (process.env.POSTGRES_DB_MIGRATION) {
      return process.env.POSTGRES_DB_MIGRATION;
    } else {
      throw new Error('Migration commands require POSTGRES_DB_MIGRATION to be set');
    }
  }

  if (!process.env.POSTGRES_DB) {
    throw new Error('POSTGRES_DB must be set in non-test, non-migration environments');
  }

  return process.env.POSTGRES_DB;
}

export const PostgresConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: resolveDatabaseName(),
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
};

const PostgresMigrationDatasourceConfig = {
  ...PostgresConfig,
};

export const PostgresMigrationDatasource = new DataSource(PostgresMigrationDatasourceConfig);
