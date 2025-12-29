import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { WebsocketEvents, WebsocketMessage } from '../../shared/ws-utils';
import { valkey, keys } from '../../core/datasources/valkey.datasource';
import { Handler } from '../../core/ws/ws.types';

@Injectable()
export class InstanceService {
  getHandlers() {
    return {
      [WebsocketEvents.JOIN_INSTANCE]: this.handleJoinInstance.bind(this),
    } satisfies Partial<Record<WebsocketEvents, Handler>>;
  }

  // Handlers
  private async handleJoinInstance(client: WebSocket, message: WebsocketMessage<any>, ctx: { allClients: Set<WebSocket> }) {
    const instancePath = (message.data.instance as string) ?? (message.data.instancePath as string);
    const clientId = (client as any).id as string | undefined;
    if (!clientId) return;

    const previousInstancePath = (client as any).instancePath as string | undefined;

    try {
      const pipeline = valkey.multi();
      
      if (previousInstancePath) {
        pipeline.srem(keys.instanceClients(previousInstancePath), clientId);
      }

      pipeline.sadd(keys.instanceClients(instancePath), clientId);
      pipeline.set(keys.clientCurrentInstance(clientId), instancePath);
      await pipeline.exec();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Valkey error on joinInstance:', err);
    }

    (client as any).instancePath = instancePath;

    if (previousInstancePath) {
      this.broadcastToInstance(client, previousInstancePath, {
        type: WebsocketEvents.JOIN_INSTANCE,
        data: { left: clientId },
      }, ctx.allClients);
    }

    this.broadcastToInstance(client, instancePath, {
      type: WebsocketEvents.JOIN_INSTANCE,
      data: { joined: clientId },
    }, ctx.allClients);
  }

  // Utils
  private broadcastToInstance(sender: WebSocket, instancePath: string, message: any, allClients: Set<WebSocket>) {
    for (const c of allClients) {
      if (c === sender) continue;
      if ((c as any).instancePath !== instancePath) continue;
      if (c.readyState === WebSocket.OPEN) {
        c.send(JSON.stringify(message));
      }
    }
  }
}
