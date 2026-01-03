import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { WebsocketEvents, WebsocketMessage } from '../shared/ws-utils';
import { Handler } from '../types/ws.types';
import { ClientsRegistryService } from '../core/services/clients-registry.service';

@Injectable()
export class PingHandler {

  constructor(private readonly clientsRegistry: ClientsRegistryService) {}

  public getHandlers() {
    return {
      [WebsocketEvents.PING]: this.handlePing.bind(this),
    } satisfies Partial<Record<WebsocketEvents, Handler>>;
  }

  // Handlers
  private handlePing(client: WebSocket, _message: WebsocketMessage<any>) {
    client.send(
      JSON.stringify({ clientId: client.id, type: WebsocketEvents.PONG, data: { clientsCount: this.clientsRegistry.size } })
    );
  }

}
