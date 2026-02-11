import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { WebsocketEvents, WebsocketMessage } from '../../shared/dtos';
import { Handler } from '../../types/ws.types';
import { AuthHandler } from '../../handlers/auth.handler';
import { PingHandler } from '../../handlers/ping.handler';
import { ChatHandler } from '../../handlers/chat.handler';
import { CharacterHandler } from '../../handlers/character.handler';

@Injectable()
export class RouterService {

  private handlers: Partial<Record<WebsocketEvents, Handler>> = {};

  constructor(
    private readonly auth: AuthHandler,
    private readonly ping: PingHandler,
    private readonly chat: ChatHandler,
    private readonly character: CharacterHandler
  ) {
    this.handlers = {
      ...this.auth.getHandlers(),
      ...this.ping.getHandlers(),
      ...this.chat.getHandlers(),
      ...this.character.getHandlers(),
    };
  }

  public dispatchMessage(client: WebSocket, message: WebsocketMessage<any>) {
    const handler = this.handlers[message.type as WebsocketEvents];

    if (!handler) {
      client.send(JSON.stringify({ clientId: client.id, type: 'echo' }));
      return;
    }

    return handler(client, message);
  }

}
