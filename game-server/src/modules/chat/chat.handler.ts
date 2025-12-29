import { WebSocket } from 'ws';
import { WebsocketMessage } from '../../shared/ws-utils';
import type { Handler } from '../../router';

export const handleGlobalChat: Handler = (_client: WebSocket, message: WebsocketMessage<any>, ctx) => {
  for (const c of ctx.allClients) {
    if (c.readyState === WebSocket.OPEN) {
      c.send(JSON.stringify(message));
    }
  }
};

export const handleInstanceChat: Handler = (_client: WebSocket, message: WebsocketMessage<any>, ctx) => {
  const instancePath = message.data.instance as string;

  for (const c of ctx.allClients) {
    if (c === _client) continue;
    if ((c as any).instancePath !== instancePath) continue;
    if (c.readyState === WebSocket.OPEN) {
      c.send(JSON.stringify(message));
    }
  }
}
