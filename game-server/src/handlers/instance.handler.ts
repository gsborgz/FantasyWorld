import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { Handler } from '../types/ws.types';
import { DataSource } from 'typeorm';
import { Character } from '../core/entities/character.entity';
import { WebsocketEvents, WebsocketMessage, ClientCharacter, JoinInstanceRequest, CharacterPosition } from '../shared/dtos';
import { BroadcastHelper } from '../helpers/broadcast.helper';
import { ClientsRegistryService } from '../core/services/clients-registry.service';

@Injectable()
export class InstanceHandler {

  constructor(
    private readonly dataSource: DataSource,
    private readonly broadcastHelper: BroadcastHelper,
    private readonly clientsRegistry: ClientsRegistryService,
  ) {}

  public getHandlers() {
    return {
      [WebsocketEvents.JOIN_INSTANCE]: this.handleJoinInstance.bind(this),
      [WebsocketEvents.UPDATE_POSITION]: this.handlePositionUpdate.bind(this),
    } satisfies Partial<Record<WebsocketEvents, Handler>>;
  }

  // Handlers
  private async handleJoinInstance(sender: WebSocket, message: WebsocketMessage<JoinInstanceRequest>) {
    const clientId = sender.id;
    
    if (!clientId) return;
    
    const newSenderInstancePath = message.data.instancePath;
    const previousInstance = sender.character?.instancePath;

    this.updateClientCharacterInstance(sender, newSenderInstancePath);
    
    const { x, y, direction } = message.data as Partial<JoinInstanceRequest> & { x?: number; y?: number; direction?: number };
    
    if (typeof x === 'number' && typeof y === 'number' && sender.character) {
      sender.character.x = x;
      sender.character.y = y;
      
      if (typeof direction === 'number') {
        sender.character.direction = direction as any;
      }
      
      await this.dataSource.getRepository(Character).update(
        { id: sender.character.id },
        { x: sender.character.x, y: sender.character.y, direction: sender.character.direction }
      );
    }
    
    this.sendClientCharacterToInstanceClients(sender);
    this.sendPreviousCharactersInInstanceToClient(sender);
    
    if (previousInstance && previousInstance !== newSenderInstancePath) {
      this.sendInstanceLeftMessageToPreviousInstance(sender, previousInstance);
    }
  }

  private async handlePositionUpdate(client: WebSocket, message: WebsocketMessage<CharacterPosition>) {
    const instancePath = client.character?.instancePath;
    const clientId = client.id;
    const data = message.data;

    if (!clientId || !instancePath) return;

    this.updateClientCharacterPosition(client, data);

    const newMessage = new WebsocketMessage<ClientCharacter>();

    newMessage.clientId = client.id!;
    newMessage.type = WebsocketEvents.UPDATE_POSITION;
    newMessage.data = client.character!;

    this.broadcastHelper.broadcastToInstance(client, instancePath, newMessage);
  }

  // Utils
  public sendInstanceLeftMessageToPreviousInstance(sender: WebSocket, previousSenderInstancePath: string) {
    const message = new WebsocketMessage<ClientCharacter>();
    
    message.clientId = sender.id!;
    message.type = WebsocketEvents.INSTANCE_LEFT;
    message.data = sender.character!;

    this.broadcastHelper.broadcastToInstance(sender, previousSenderInstancePath, message);
  }

  private async sendPreviousCharactersInInstanceToClient(sender: WebSocket) {
    const instanceClients = this.clientsRegistry.getInstanceClients(sender.character!.instancePath!);
    const characters = instanceClients.map(client => client.character).filter(Boolean) as ClientCharacter[];
    const chunkSize = 10;

    for (let i = 0; i < characters.length; i += chunkSize) {
      const chunk = characters.slice(i, i + chunkSize);
      const message = new WebsocketMessage<ClientCharacter>();

      message.clientId = sender.id!;
      message.type = WebsocketEvents.UPDATE_POSITION;
      
      chunk.forEach(char => {
        message.data = char;

        sender.send(JSON.stringify(message));
      });

      await new Promise(resolve => setTimeout(resolve, 100)); // adicionar uma pausa de 100ms entre os envios
    }
  }

  private sendClientCharacterToInstanceClients(sender: WebSocket) {
    const message = new WebsocketMessage<ClientCharacter>();

    message.clientId = sender.id;
    message.type = WebsocketEvents.JOIN_INSTANCE;
    message.data = sender.character;
    
    this.broadcastHelper.broadcastToInstance(sender, sender.character.instancePath, message);
  }

  private updateClientCharacterPosition(client: WebSocket, data: CharacterPosition) {
    const x = data.x;
    const y = data.y;
    const direction = data.direction;

    if (client.character) {
      client.character.x = x;
      client.character.y = y;
      client.character.direction = direction;
      client.character.lastPositionUpdate = Date.now();
      
      this.dataSource.getRepository(Character).update({ id: client.character.id }, { x, y, direction });
    }
  }

  private updateClientCharacterInstance(client: WebSocket, instancePath: string) {
      client.character.instancePath = instancePath;

      this.dataSource.getRepository(Character).update({ id: client.character.id }, { instancePath });
  }

}
