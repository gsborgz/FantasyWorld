import { WebSocket } from 'ws';
import { WebsocketEvents, WebsocketMessage } from '../../../shared/ws-utils';
import type { Handler } from '../../router';

export const handlePing: Handler = (client: WebSocket, _message: WebsocketMessage<any>, ctx) => {
  client.send(
    JSON.stringify({ type: WebsocketEvents.PONG, data: { clientsCount: ctx.allClients.size } })
  );
};

