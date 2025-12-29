import { OnModuleDestroy } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { WebSocketServer as WsServer, WebSocket } from 'ws';
import { WebsocketMessage } from '../shared/ws-utils';
import { valkey, keys } from '../core/datasources/valkey.datasource';
import { RouterService } from '../core/ws/router.service';

@WebSocketGateway({ path: '/ws' })
export class AppGateway implements OnModuleDestroy {
  @WebSocketServer()
  server!: WsServer;

  private readonly allClients: Set<WebSocket> = new Set();
  private readonly maxClients = 1000;

  constructor(private readonly router: RouterService) {}

  afterInit() {
    // Attach low-level handlers for raw 'ws' messages
    this.server.on('connection', (client: WebSocket) => {
      if (!client) return;

      if (this.allClients.size >= this.maxClients) {
        try {
          client.send(JSON.stringify({ type: 'error', error: 'Server full' }));
        } finally {
          client.close();
        }
        return;
      }

      if (!this.allClients.has(client)) {
        this.allClients.add(client);
      }

      client.on('message', (data) => {
        let msg: WebsocketMessage<any>;
        try {
          msg = JSON.parse(data.toString());
        } catch {
          client.send(JSON.stringify({ type: 'error', error: 'Invalid JSON' }));
          return;
        }

        void this.router.dispatchMessage(client, msg, this.allClients);
      });

      client.on('close', () => {
        void this.cleanupOnClose(client);
      });
    });
  }

  public async onModuleDestroy() {
    try {
      this.server?.clients.forEach((c) => c.close());
      this.server?.close();
    } catch {}
  }

  private async cleanupOnClose(client: WebSocket) {
    if (this.allClients.has(client)) {
      this.allClients.delete(client);
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
      // eslint-disable-next-line no-console
      console.error('Valkey error on leaveInstance:', err);
    }
  }
}
