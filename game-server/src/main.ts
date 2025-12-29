
import { WebSocketServer, WebSocket } from 'ws';
import { WebsocketMessage } from './shared/ws-utils';
import { leaveInstance, handleMessage } from './websocket/message-handler';
import * as dotenv from 'dotenv';

dotenv.config();

const maxClients = 1000;
const port = Number(process.env.PORT) || 8080;
const allClients: Set<WebSocket> = new Set();
const wss = new WebSocketServer({ port });

wss.on('connection', (client) => {
	console.log('New client connected');

  if (!client) return;

  if (allClients.size >= maxClients) {
    client.send(JSON.stringify({ type: 'error', error: 'Server full' }));
    client.close();
    return;
  }

  if (!allClients.has(client)) {
    allClients.add(client);
  }

	client.on('message', (data) => {
    let msg: WebsocketMessage<any>;

    try {
      msg = JSON.parse(data.toString());
    } catch (e) {
      client.send(JSON.stringify({ type: 'error', error: 'Invalid JSON' }));
      return;
    }

		handleMessage(client, msg, allClients);
	});

	client.on('close', () => {
    if (allClients.has(client)) {
      allClients.delete(client);
    }

		leaveInstance(client);
	});
});

console.log(`Websocket server running on port ${port}`);
