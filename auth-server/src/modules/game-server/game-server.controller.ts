import { Controller, Get } from '@nestjs/common';
import { GameServerService } from './game-server.service';
import { GameServerInfo } from '../../shared/game-server';

@Controller('v1/game-servers')
export class GameServerController {

  constructor(private readonly serverService: GameServerService) {}

  @Get()
  public getServers(): Promise<GameServerInfo[]> {
    return this.serverService.getServers();
  }

}
