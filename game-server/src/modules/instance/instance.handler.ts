import { WebSocket } from 'ws';
import { WebsocketEvents, WebsocketMessage } from '../../shared/ws-utils';
import { valkey, keys } from '../../core/datasources/valkey.datasource';
import type { Handler } from '../../router';

export const handleJoinInstance: Handler = async (
  client: WebSocket,
  message: WebsocketMessage<any>,
  ctx
) => {
  const instancePath = message.data.instance as string;
  const clientId = (client as any).id as string | undefined;
  if (!clientId) return;

  const previousInstancePath = (client as any).instancePath as string | undefined;

  try {
    const pipeline = valkey.multi();
    
    if (previousInstancePath) {
      // Removes player from previous instance
      pipeline.srem(keys.instanceClients(previousInstancePath), clientId);
    }

    // Adds player to new instance
    pipeline.sadd(keys.instanceClients(instancePath), clientId);
    pipeline.set(keys.clientCurrentInstance(clientId), instancePath);
    await pipeline.exec();
  } catch (err) {
    console.error('Valkey error on joinInstance:', err);
  }

  (client as any).instancePath = instancePath;

  // Broadcast to previous instance that the client has left
  if (previousInstancePath) {
    broadcastToInstance(client, previousInstancePath, {
      type: WebsocketEvents.JOIN_INSTANCE,
      data: { left: clientId },
    }, ctx.allClients);
  }

  // Broadcast to instance that the client has joined
  broadcastToInstance(client, instancePath, {
    type: WebsocketEvents.JOIN_INSTANCE,
    data: { joined: clientId },
  }, ctx.allClients);
};

function broadcastToInstance(
  sender: WebSocket,
  instancePath: string,
  message: any,
  allClients: Set<WebSocket>
) {
  for (const c of allClients) {
    if (c === sender) continue;
    if ((c as any).instancePath !== instancePath) continue;
    if (c.readyState === WebSocket.OPEN) {
      c.send(JSON.stringify(message));
    }
  }
}
