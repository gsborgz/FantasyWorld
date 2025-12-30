import { Controller, Get } from '@nestjs/common';
import { GameServerService } from './game-server.service';
import { GameServerResponse } from '../../shared/dtos';

@Controller('v1/game-servers')
export class GameServerController {

  constructor(private readonly serverService: GameServerService) {}

  @Get()
  public getServers(): Promise<GameServerResponse[]> {
    return this.serverService.getServers();
  }

}
