import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { WebsocketEvents, WebsocketMessage } from '../../shared/ws-utils';
import { Handler, HandlerContext } from './ws.types';
import { AuthService } from '../../modules/auth/auth.service';
import { PingService } from '../../modules/ping/ping.service';
import { ChatService } from '../../modules/chat/chat.service';
import { InstanceService } from '../../modules/instance/instance.service';

@Injectable()
export class RouterService {
  private handlers: Partial<Record<WebsocketEvents, Handler>> = {};

  constructor(
    private readonly auth: AuthService,
    private readonly ping: PingService,
    private readonly chat: ChatService,
    private readonly instance: InstanceService,
  ) {
    this.handlers = {
      ...this.auth.getHandlers(),
      ...this.ping.getHandlers(),
      ...this.chat.getHandlers(),
      ...this.instance.getHandlers(),
    };
  }

  dispatchMessage(client: WebSocket, message: WebsocketMessage<any>, allClients: Set<WebSocket>) {
    const handler = this.handlers[message.type as WebsocketEvents];
    if (!handler) {
      client.send(JSON.stringify({ type: 'echo' }));
      return;
    }
    const ctx: HandlerContext = { allClients };
    return handler(client, message, ctx);
  }
}
