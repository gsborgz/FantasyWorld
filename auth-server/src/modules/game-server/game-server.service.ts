import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { WebsocketService } from '../../core/services/websocket.service';
import { GameServerInfo } from '../../shared/dtos';

dotenv.config();

@Injectable()
export class GameServerService {

  constructor(private readonly wsService: WebsocketService) {}

  public async getServers(): Promise<GameServerInfo[]> {
    const serverInfos = this.getBasicServersInfos();
    const promises = serverInfos.map((server) => this.getAndSetServerStatus(server));
    const filledServerInfos = await Promise.all(promises);
    
    return filledServerInfos;
  }

  private getBasicServersInfos(): GameServerInfo[] {
    const servers = process.env.GAME_SERVERS ? process.env.GAME_SERVERS.split(';') || [] : [];
    const serversInfos: GameServerInfo[] = servers.map((serverString) => {
      const [name, location, url] = serverString.split(',');
  
      return {
        name: name || 'Unknown',
        location: location || 'Unknown',
        url: url || '',
      };
    });

    return serversInfos;
  }

  private async getAndSetServerStatus(server: GameServerInfo): Promise<GameServerInfo> {
    if (!server.url) {
      server.status = 'offline';

      return server;
    }

    const timeoutMs = 2000;
    const result = await this.wsService.ping(server.url, timeoutMs);

    server.status = result.ok ? 'online' : 'offline';
    server.clientsCount = result.ok ? result.message?.data?.clientsCount || 0 : 0;

    return server;
  }

}
