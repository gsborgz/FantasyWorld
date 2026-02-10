import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { GameServerResponse } from './game-server.dto';

dotenv.config();

@Injectable()
export class GameServerService {

  constructor() {}

  public async getServers(): Promise<GameServerResponse[]> {
    const servers = process.env.GAME_SERVERS ? process.env.GAME_SERVERS.split(';') || [] : [];
    const serversInfos: GameServerResponse[] = servers.map((serverString) => {
      const [name, region, url] = serverString.split(',');
      const serverInfo = new GameServerResponse();
  
      serverInfo.name = name || 'Unknown';
      serverInfo.region = region || 'Unknown';
      serverInfo.url = url || '';

      return serverInfo;
    });

    return serversInfos;
  }

}
