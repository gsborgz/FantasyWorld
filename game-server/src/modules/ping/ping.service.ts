import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { WebsocketEvents, WebsocketMessage } from '../../shared/ws-utils';
import { Handler } from '../../core/ws/ws.types';

@Injectable()
export class PingService {
  getHandlers() {
    return {
      [WebsocketEvents.PING]: this.handlePing.bind(this),
    } satisfies Partial<Record<WebsocketEvents, Handler>>;
  }

  // Handlers
  private handlePing(client: WebSocket, _message: WebsocketMessage<any>, ctx: { allClients: Set<WebSocket> }) {
    client.send(
      JSON.stringify({ clientId: client.id, type: WebsocketEvents.PONG, data: { clientsCount: ctx.allClients.size } })
    );
  }
}
