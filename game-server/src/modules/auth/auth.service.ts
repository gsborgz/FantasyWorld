import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { randomUUID } from 'node:crypto';
import { WebsocketEvents, WebsocketMessage } from '../../shared/ws-utils';
import { keys, valkey } from '../../core/datasources/valkey.datasource';
import { Handler } from '../../core/ws/ws.types';
import { LoginRequest } from '../../shared/dtos';

@Injectable()
export class AuthService {
  getHandlers() {
    return {
      [WebsocketEvents.LOGIN]: this.handleLogin.bind(this),
    } satisfies Partial<Record<WebsocketEvents, Handler>>;
  }

  // Handlers
  private async handleLogin(client: WebSocket, message: WebsocketMessage<LoginRequest>) {
    const res = await fetch('http://localhost:3000/v1/auth/me', {
      headers: {
        Cookie: `sid=${message.data.sid}`,
      },
    });

    if (!res.ok) {
      client.send(JSON.stringify({ type: WebsocketEvents.DENY_RESPONSE }));
      return;
    }

    const user = await res.json();

    client.id = randomUUID();
    client.user = {
      id: user.id,
      username: user.username,
    };
    client.sid = message.data.sid;

    try {
      await valkey
        .multi()
        .hset(keys.session(message.data.sid), {
          client_id: client.id,
          user_id: String(user.id),
          username: String(user.username),
        })
        .sadd(keys.clientSet, client.id)
        .exec();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Valkey error on login:', err);
    }

    client.send(JSON.stringify({ type: WebsocketEvents.OK_RESPONSE }));
  }
}
