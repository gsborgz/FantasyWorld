import { OnModuleDestroy } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { WebSocketServer as WsServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { WebsocketMessage } from '../shared/ws-utils';
import { RouterService } from '../core/services/router.service';
import { ClientsRegistryService } from '../core/services/clients-registry.service';
import { randomUUID } from 'node:crypto';
import { InstanceHandler } from '../handlers/instance.handler';

@WebSocketGateway({ path: '/ws' })
export class AppGateway implements OnModuleDestroy {

  @WebSocketServer()
  private readonly server: WsServer;

  constructor(
    private readonly router: RouterService,
    private readonly clientsRegistry: ClientsRegistryService,
    private readonly instanceHandler: InstanceHandler
  ) {}

  public afterInit() {
    this.server.on('connection', (client: WebSocket, request: IncomingMessage) => {
      const isProbe = this.isProbeConnection(request?.url);

      client.isProbe = isProbe;

      if (!isProbe) {
        this.validateClientConnection(client);

        if (!this.clientsRegistry.has(client)) {
          this.addClientToRegistry(client);
        }
      }

      client.on('message', (message: WebsocketMessage<any>) => {
        this.handleMessage(client, message);
      });

      client.on('close', () => {
        if (!client.isProbe) {
          this.handleClose(client);
        }
      });
    });
  }

  public onModuleDestroy() {
    try {
      this.server.clients.forEach((client) => client.close());
      this.server.close();
    } catch {}
  }

  private validateClientConnection(client: WebSocket) {
    if (!client) return;

    if (!this.clientsRegistry.hasSpace) {
      try {
        client.send(JSON.stringify({ clientId: client.id, type: 'error', error: 'Server full' }));
      } finally {
        client.close();
      }
      return;
    }
  }

  private isProbeConnection(rawUrl?: string): boolean {
    try {
      if (!rawUrl) return false;

      const urlObj = new URL(rawUrl, 'http://localhost');
      const flag = urlObj.searchParams.get('probe');

      return flag === '1' || flag === 'true';
    } catch {
      return false;
    }
  }

  private addClientToRegistry(client: WebSocket) {
    client.id = randomUUID() + Date.now().toString();

    this.clientsRegistry.add(client);
  }

  private handleMessage( client: WebSocket, message: WebsocketMessage<any>) {
    let msg: WebsocketMessage<any>;

    try {
      msg = JSON.parse(message.toString());
    } catch {
      client.send(JSON.stringify({ clientId: client.id, type: 'error', error: 'Invalid JSON' }));
      return;
    }

    this.router.dispatchMessage(client, msg);
  }

  private handleClose(client: WebSocket) {
    if (!this.clientsRegistry.has(client)) return;
    
    this.instanceHandler.sendInstanceLeftMessageToPreviousInstance(client);
    this.clientsRegistry.delete(client);
  }

}
