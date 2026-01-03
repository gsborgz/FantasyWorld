import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { WebsocketEvents, WebsocketMessage } from '../shared/ws-utils';
import { Handler } from '../types/ws.types';
import { ChatMessage } from '../shared/dtos';

@Injectable()
export class ChatHandler {

  getHandlers() {
    return {
      [WebsocketEvents.GLOBAL_CHAT_MESSAGE]: this.handleGlobalChat.bind(this),
      [WebsocketEvents.INSTANCE_CHAT_MESSAGE]: this.handleInstanceChat.bind(this),
    } satisfies Partial<Record<WebsocketEvents, Handler>>;
  }

  // Handlers
  private handleGlobalChat(sender: WebSocket, message: WebsocketMessage<ChatMessage>, ctx: { allClients: Set<WebSocket> }) {
    message.data.senderName = sender.character?.name || 'Unknown';
    
    for (const client of ctx.allClients) {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    }
  }

  private handleInstanceChat(sender: WebSocket, message: WebsocketMessage<ChatMessage>, ctx: { allClients: Set<WebSocket> }) {
    const senderInstancePath = sender.character?.instancePath;

    if (!senderInstancePath) return;

    message.data.senderName = sender.character?.name || 'Unknown';

    for (const client of ctx.allClients) {
      const clientInstancePath = client.character?.instancePath;
      
      if (client == sender || !clientInstancePath || clientInstancePath !== senderInstancePath) continue;
      
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    }
  }
}
