import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { Handler } from '../types/ws.types';
import { WebsocketEvents, WebsocketMessage, AuthenticationRequest } from '../shared/dtos';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AuthHandler {

  constructor() {}

  public getHandlers() {
    return {
      [WebsocketEvents.LOGIN]: this.handleAuthentication.bind(this),
    } satisfies Partial<Record<WebsocketEvents, Handler>>;
  }

  // Handlers
  private async handleAuthentication(client: WebSocket, message: WebsocketMessage<AuthenticationRequest>) {
    const res = await fetch(`${process.env.AUTH_SERVER_URL}/v1/auth/me`, {
      headers: {
        Cookie: `sid=${message.data.sid}`,
      },
    });

    if (!res.ok) {
      client.send(JSON.stringify({ clientId: client.id, type: WebsocketEvents.DENY_RESPONSE }));
      return;
    }

    const user = await res.json();

    client.user = {
      id: user.id,
      username: user.username,
    };
    client.sid = message.data.sid;
  
    client.send(JSON.stringify({ clientId: client.id, type: WebsocketEvents.OK_RESPONSE }));
  }
}
