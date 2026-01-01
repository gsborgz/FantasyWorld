import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import { AppGateway } from './app.gateway';
import { RouterService } from '../core/services/router.service';
import { PostgresConfig } from '../core/datasources/postgres.datasource';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisConfig } from '../core/datasources/redis.datasource';
import { RedisService } from '../core/services/redis.service';
import { HandlersModule } from '../handlers/handlers.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(PostgresConfig),
    RedisModule.forRoot(RedisConfig),
    HandlersModule
  ],
  providers: [AppGateway, RouterService, RedisService],
})
export class AppModule {}
