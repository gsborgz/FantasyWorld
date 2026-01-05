import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { WebsocketEvents, WebsocketMessage } from '../shared/ws-utils';
import { Handler } from '../types/ws.types';
import { ClientsRegistryService } from '../core/services/clients-registry.service';
import { GameServerResponse } from '../shared/dtos';

@Injectable()
export class PingHandler {

  constructor(private readonly clientsRegistry: ClientsRegistryService) {}

  public getHandlers() {
    return {
      [WebsocketEvents.PING]: this.handlePing.bind(this),
    } satisfies Partial<Record<WebsocketEvents, Handler>>;
  }

  // Handlers
  private handlePing(client: WebSocket) {
    const message = new WebsocketMessage<GameServerResponse>();
    const serverInfo = new GameServerResponse();

    serverInfo.clientsCount = this.clientsRegistry.size;
    serverInfo.maxClients = this.clientsRegistry.maxClients;

    message.type = WebsocketEvents.PONG;
    message.data = serverInfo;

    client.send(JSON.stringify(message), () => {
      if (client.isProbe) {
        try {
          client.close();
        } catch {}
      }
    });
  }

}
