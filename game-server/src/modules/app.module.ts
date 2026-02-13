import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { RouterService } from '../core/services/router.service';
import { PostgresConfig } from '../core/datasources/postgres.datasource';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthHandler } from '../handlers/auth.handler';
import { CharacterHandler } from '../handlers/character.handler';
import { ChatHandler } from '../handlers/chat.handler';
import { PingHandler } from '../handlers/ping.handler';
import { BroadcastHelper } from '../helpers/broadcast.helper';
import { ClientsRegistryService } from '../core/services/clients-registry.service';

const handlers = [
  AuthHandler,
  CharacterHandler,
  ChatHandler,
  PingHandler,
];

@Module({
  imports: [
    TypeOrmModule.forRoot(PostgresConfig),
  ],
  providers: [
    AppGateway,
    RouterService,
    ClientsRegistryService,
    BroadcastHelper,
    ...handlers
  ],
})
export class AppModule {}
