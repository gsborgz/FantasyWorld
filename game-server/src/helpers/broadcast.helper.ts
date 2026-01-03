import { Injectable } from "@nestjs/common";
import { WebsocketMessage } from "../shared/ws-utils";
import { WebSocket } from 'ws';

@Injectable()
export class BroadcastHelper {

  constructor() {}

  public broadcastToInstance(sender: WebSocket, message: WebsocketMessage<any>, allClients: Set<WebSocket>) {
    for (const client of allClients) {
      if (client === sender) continue;

      const clientInstancePath = client.character?.instancePath;

      if (clientInstancePath !== message.data.instancePath) continue;

      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    }
  }

}
