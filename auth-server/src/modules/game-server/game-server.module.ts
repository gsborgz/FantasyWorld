import { Module } from '@nestjs/common';
import { GameServerController } from './game-server.controller';
import { GameServerService } from './game-server.service';
import { DictionaryService } from '../../core/services/dictionary.service';
import { WebsocketService } from '../../core/services/websocket.service';

@Module({
  imports: [],
  controllers: [GameServerController],
  providers: [GameServerService, DictionaryService, WebsocketService]
})
export class GameServerModule {}
