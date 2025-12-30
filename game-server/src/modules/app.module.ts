import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { RouterService } from '../core/ws/router.service';
import { AuthModule } from './auth/auth.module';
import { PingModule } from './ping/ping.module';
import { ChatModule } from './chat/chat.module';
import { InstanceModule } from './instance/instance.module';
import { PostgresConfig } from '../core/datasources/postgres.datasource';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterModule } from './character/character.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(PostgresConfig),
    AuthModule,
    PingModule,
    ChatModule,
    InstanceModule,
    CharacterModule,
  ],
  providers: [AppGateway, RouterService],
})
export class AppModule {}
