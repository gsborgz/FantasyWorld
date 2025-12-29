import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { WebsocketEvents, WebsocketMessage } from '../../shared/ws-utils';
import { Handler } from '../../core/ws/ws.types';

@Injectable()
export class ChatService {
  getHandlers() {
    return {
      [WebsocketEvents.GLOBAL_CHAT_MESSAGE]: this.handleGlobalChat.bind(this),
      [WebsocketEvents.INSTANCE_CHAT_MESSAGE]: this.handleInstanceChat.bind(this),
    } satisfies Partial<Record<WebsocketEvents, Handler>>;
  }

  // Handlers
  private handleGlobalChat(client: WebSocket, message: WebsocketMessage<any>, ctx: { allClients: Set<WebSocket> }) {
    for (const c of ctx.allClients) {
      if (c.readyState === WebSocket.OPEN) {
        c.send(JSON.stringify(message));
      }
    }
  }

  private handleInstanceChat(client: WebSocket, message: WebsocketMessage<any>, ctx: { allClients: Set<WebSocket> }) {
    const instancePath = message.data.instance as string;

    for (const c of ctx.allClients) {
      if (c === client) continue;
      if ((c as any).instancePath !== instancePath) continue;
      if (c.readyState === WebSocket.OPEN) {
        c.send(JSON.stringify(message));
      }
    }
  }
}
