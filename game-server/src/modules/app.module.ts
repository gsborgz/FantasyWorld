import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import { AppGateway } from './app.gateway';
import { RouterService } from '../core/services/router.service';
import { PostgresConfig } from '../core/datasources/postgres.datasource';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisConfig } from '../core/datasources/redis.datasource';
import { RedisService } from '../core/services/redis.service';
import { AuthHandler } from '../handlers/auth.handler';
import { CharacterHandler } from '../handlers/character.handler';
import { ChatHandler } from '../handlers/chat.handler';
import { InstanceHandler } from '../handlers/instance.handler';
import { PingHandler } from '../handlers/ping.handler';

const handlers = [
  AuthHandler,
  CharacterHandler,
  ChatHandler,
  InstanceHandler,
  PingHandler,
];

@Module({
  imports: [
    TypeOrmModule.forRoot(PostgresConfig),
    RedisModule.forRoot(RedisConfig),
  ],
  providers: [
    AppGateway,
    RouterService,
    RedisService,
    ...handlers
  ],
})
export class AppModule {}
