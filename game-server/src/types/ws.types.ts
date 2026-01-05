import { WebSocket } from 'ws';
import { WebsocketMessage } from '../shared/ws-utils';

export type Handler = (
  client: WebSocket,
  message: WebsocketMessage<any>
) => void | Promise<void>;
