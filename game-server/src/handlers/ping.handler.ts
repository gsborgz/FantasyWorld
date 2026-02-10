import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { Handler } from '../types/ws.types';
import { ClientsRegistryService } from '../core/services/clients-registry.service';
import { WebsocketEvents, WebsocketMessage } from '../shared/dtos';

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
    const message = new WebsocketMessage();

    message.type = WebsocketEvents.PONG;

    client.send(JSON.stringify(message), () => {
      if (client.isProbe) {
        try {
          client.close();
        } catch {}
      }
    });
  }

}
