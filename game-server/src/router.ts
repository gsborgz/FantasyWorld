import { WebSocket } from 'ws';
import { WebsocketEvents, WebsocketMessage } from './shared/ws-utils';
import { Modules } from './modules/modules';

type HandlerContext = {
  allClients: Set<WebSocket>;
};

export type Handler = (
  client: WebSocket,
  message: WebsocketMessage<any>,
  ctx: HandlerContext
) => void | Promise<void>;

const handlers: Partial<Record<WebsocketEvents, Handler>> = {
  ...Modules
};

export function dispatchMessage(
  client: WebSocket,
  message: WebsocketMessage<any>,
  allClients: Set<WebSocket>
) {
  const handler = handlers[message.type as WebsocketEvents];

  if (!handler) {
    client.send(JSON.stringify({ type: 'echo' }));
    return;
  }

  return handler(client, message, { allClients });
}
