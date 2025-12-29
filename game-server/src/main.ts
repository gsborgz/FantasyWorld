
import { WebSocketServer, WebSocket } from 'ws';
import { WebsocketMessage } from './shared/ws-utils';
import { valkey, keys } from './core/datasources/valkey.datasource';
import { dispatchMessage } from './websocket/router';
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

    dispatchMessage(client, msg, allClients);
	});

	client.on('close', async () => {
    if (allClients.has(client)) {
      allClients.delete(client);
    }

		const clientId = (client as any).id as string | undefined;
    const sid = (client as any).sid as string | undefined;
    const instancePath = (client as any).instancePath as string | undefined;

    if (!clientId) return;

    try {
      const pipeline = valkey.multi();
      
      if (instancePath) {
        pipeline.srem(keys.instanceClients(instancePath), clientId);
      }
      
      pipeline.srem(keys.clientSet, clientId);
      
      if (sid) {
        pipeline.del(keys.session(sid));
      }
      
      pipeline.del(keys.clientCurrentInstance(clientId));
      
      await pipeline.exec();
    } catch (err) {
      console.error('Valkey error on leaveInstance:', err);
    }

    console.log('Client disconnected, removed from instances');
	});
});

console.log(`Websocket server running on port ${port}`);
