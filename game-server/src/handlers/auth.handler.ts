import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { WebsocketEvents, WebsocketMessage } from '../shared/ws-utils';
import { RedisService } from '../core/services/redis.service';
import { Handler } from '../types/ws.types';
import { LoginRequest } from '../shared/dtos';

@Injectable()
export class AuthHandler {

  constructor(private readonly redisService: RedisService) {}

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
      client.send(JSON.stringify({ clientId: client.id, type: WebsocketEvents.DENY_RESPONSE }));
      return;
    }

    const user = await res.json();

    client.user = {
      id: user.id,
      username: user.username,
    };
    client.sid = message.data.sid;

    try {
      await this.redisService.client
        .multi()
        .hset(this.redisService.keys.session(message.data.sid), {
          client_id: client.id,
          user_id: String(user.id),
          username: String(user.username),
        })
        .sadd(this.redisService.keys.clientSet, client.id!)
        .exec();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Valkey error on login:', err);
    }

    client.send(JSON.stringify({ clientId: client.id, type: WebsocketEvents.OK_RESPONSE }));
  }
}
