import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { WebsocketEvents, WebsocketMessage } from '../shared/ws-utils';
import { Handler } from '../types/ws.types';
import { ChatMessage } from '../shared/dtos';
import { BroadcastHelper } from '../helpers/broadcast.helper';

@Injectable()
export class ChatHandler {

  constructor(private readonly broadcastHelper: BroadcastHelper) {}

  public getHandlers() {
    return {
      [WebsocketEvents.GLOBAL_CHAT_MESSAGE]: this.handleGlobalChat.bind(this),
      [WebsocketEvents.INSTANCE_CHAT_MESSAGE]: this.handleInstanceChat.bind(this),
    } satisfies Partial<Record<WebsocketEvents, Handler>>;
  }

  // Handlers
  private handleGlobalChat(sender: WebSocket, message: WebsocketMessage<ChatMessage>) {
    message.data.senderName = sender.character?.name || 'Unknown';
  
    this.broadcastHelper.broadcastToAll(sender, message);
  }

  private handleInstanceChat(sender: WebSocket, message: WebsocketMessage<ChatMessage>) {
    message.data.senderName = sender.character?.name || 'Unknown';

    this.broadcastHelper.broadcastToInstance(sender, sender.character?.instancePath!, message);
  }
}
