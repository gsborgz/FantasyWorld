import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { WebsocketEvents, WebsocketMessage } from '../../shared/ws-utils';
import { Handler, HandlerContext } from '../../types/ws.types';
import { AuthHandler } from '../../handlers/auth.handler';
import { PingHandler } from '../../handlers/ping.handler';
import { ChatHandler } from '../../handlers/chat.handler';
import { InstanceHandler } from '../../handlers/instance.handler';
import { CharacterHandler } from '../../handlers/character.handler';

@Injectable()
export class RouterService {
  private handlers: Partial<Record<WebsocketEvents, Handler>> = {};

  constructor(
    private readonly auth: AuthHandler,
    private readonly ping: PingHandler,
    private readonly chat: ChatHandler,
    private readonly instance: InstanceHandler,
    private readonly character: CharacterHandler,
  ) {
    this.handlers = {
      ...this.auth.getHandlers(),
      ...this.ping.getHandlers(),
      ...this.chat.getHandlers(),
      ...this.instance.getHandlers(),
      ...this.character.getHandlers(),
    };
  }

  dispatchMessage(client: WebSocket, message: WebsocketMessage<any>, allClients: Set<WebSocket>) {
    const handler = this.handlers[message.type as WebsocketEvents];
    if (!handler) {
      client.send(JSON.stringify({ clientId: client.id, type: 'echo' }));
      return;
    }
    const ctx: HandlerContext = { allClients };
    return handler(client, message, ctx);
  }
}
