import { Module } from '@nestjs/common';
import { AuthHandler } from './auth.handler';
import { CharacterHandler } from './character.handler';
import { ChatHandler } from './chat.handler';
import { InstanceHandler } from './instance.handler';
import { PingHandler } from './ping.handler';
import { RedisService } from '../core/services/redis.service';

@Module({
  imports: [],
  providers: [RedisService, AuthHandler, CharacterHandler, ChatHandler, InstanceHandler, PingHandler],
  exports: [AuthHandler, CharacterHandler, ChatHandler, InstanceHandler, PingHandler],
})
export class HandlersModule {}
