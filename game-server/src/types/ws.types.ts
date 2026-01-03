import { WebSocket } from 'ws';
import { WebsocketMessage } from '../shared/ws-utils';

export type HandlerContext = {
  allClients: WebSocket[];
};

export type Handler = (
  client: WebSocket,
  message: WebsocketMessage<any>,
  ctx: HandlerContext
) => void | Promise<void>;
