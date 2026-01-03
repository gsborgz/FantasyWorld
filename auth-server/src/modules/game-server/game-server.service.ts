import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { WebsocketService } from '../../core/services/websocket.service';
import { GameServerResponse } from '../../shared/dtos';

dotenv.config();

@Injectable()
export class GameServerService {

  constructor(private readonly wsService: WebsocketService) {}

  public async getServers(): Promise<GameServerResponse[]> {
    const serverInfos = this.getBasicServersInfos();
    const promises = serverInfos.map((server) => this.getAndSetServerStatus(server));
    const filledServerInfos = await Promise.all(promises);
    
    return filledServerInfos;
  }

  private getBasicServersInfos(): GameServerResponse[] {
    const servers = process.env.GAME_SERVERS ? process.env.GAME_SERVERS.split(';') || [] : [];
    const serversInfos: GameServerResponse[] = servers.map((serverString) => {
      const [name, location, url] = serverString.split(',');
      const serverInfo = new GameServerResponse();
  
      serverInfo.name = name || 'Unknown';
      serverInfo.location = location || 'Unknown';
      serverInfo.url = url || '';

      return serverInfo;
    });

    return serversInfos;
  }

  private async getAndSetServerStatus(server: GameServerResponse): Promise<GameServerResponse> {
    if (!server.url) {
      server.status = 'offline';

      return server;
    }

    const timeoutMs = 2000;
    const result = await this.wsService.ping(server.url, timeoutMs);

    if (result.ok) {
      const data: GameServerResponse = result.message?.data;

      server.status = 'online';
      server.clientsCount = Math.max(0, data.clientsCount - 1); // Exclude the ping client
      server.maxClients = data.maxClients;
    } else {
      server.status = 'offline';
      server.clientsCount = 0;
      server.maxClients = 0;
    }

    return server;
  }

}
