import { WebSocket } from 'ws';
import { WebsocketMessage } from '../shared/dtos';

export type Handler = (
  client: WebSocket,
  message: WebsocketMessage<any>
) => void | Promise<void>;
