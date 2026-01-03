import { OnModuleDestroy } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { WebSocketServer as WsServer, WebSocket } from 'ws';
import { WebsocketMessage } from '../shared/ws-utils';
import { RouterService } from '../core/services/router.service';
import { ClientsRegistryService } from '../core/services/clients-registry.service';
import { randomUUID } from 'node:crypto';

@WebSocketGateway({ path: '/ws' })
export class AppGateway implements OnModuleDestroy {

  @WebSocketServer()
  private readonly server!: WsServer;

  constructor(
    private readonly router: RouterService,
    private readonly clientsRegistry: ClientsRegistryService,
  ) {}

  afterInit() {
    this.server.on('connection', (client: WebSocket) => {
      if (!client) return;

      if (!this.clientsRegistry.hasSpace) {
        try {
          client.send(JSON.stringify({ clientId: client.id, type: 'error', error: 'Server full' }));
        } finally {
          client.close();
        }
        return;
      }

      if (!this.clientsRegistry.has(client)) {
        client.id = randomUUID() + Date.now().toString();

        this.clientsRegistry.add(client);
      }

      client.on('message', (data) => {
        let msg: WebsocketMessage<any>;
        try {
          msg = JSON.parse(data.toString());
        } catch {
          client.send(JSON.stringify({ clientId: client.id, type: 'error', error: 'Invalid JSON' }));
          return;
        }

        void this.router.dispatchMessage(client, msg);
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
    if (this.clientsRegistry.has(client)) {
      this.clientsRegistry.delete(client);
    }
  }

}
