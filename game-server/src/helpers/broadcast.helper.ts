import { Injectable } from "@nestjs/common";
import { WebsocketMessage } from "../shared/ws-utils";
import { WebSocket } from 'ws';
import { ClientsRegistryService } from "../core/services/clients-registry.service";

@Injectable()
export class BroadcastHelper {

  constructor(private readonly clientsRegistry: ClientsRegistryService) {}

  public broadcastToAll(sender: WebSocket, message: WebsocketMessage<any>) {
    if (!sender) return;
    
    for (const client of this.clientsRegistry.getAllClients()) {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    }
  }

  public broadcastToInstance(sender: WebSocket, instance: string, message: WebsocketMessage<any>) {
    if (!sender || !instance) return;

    for (const client of this.clientsRegistry.getInstanceClients(instance)) {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    }
  }

  public broadcastToAnotherClient(sender: WebSocket, characterName: string, message: WebsocketMessage<any>) {
    if (!sender || !characterName) return;

    const targetClient = this.clientsRegistry.getClientByCharacterName(characterName);

    if (targetClient && targetClient !== sender && targetClient.readyState === WebSocket.OPEN) {
      targetClient.send(JSON.stringify(message));
    }
  }

}
