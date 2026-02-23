import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { Handler } from '../types/ws.types';
import { Character } from '../core/entities/character.entity';
import { DataSource } from 'typeorm';
import { WebsocketEvents, WebsocketMessage, AddCharacterRequest, ClientCharacter, DeleteCharacterRequest, SelectCharacterRequest, WorldInstance } from '../shared/dtos';
import { BroadcastHelper } from '../helpers/broadcast.helper';
import { ClientsRegistryService } from '../core/services/clients-registry.service';

@Injectable()
export class CharacterHandler {

  constructor(
    private readonly dataSource: DataSource,
    private readonly broadcastHelper: BroadcastHelper,
    private readonly clientsRegistry: ClientsRegistryService,
  ) {}

  public getHandlers() {
    return {
      [WebsocketEvents.LIST_CHARACTERS]: this.handleGetCharacters.bind(this),
      [WebsocketEvents.ADD_CHARACTER]: this.handleCharacterAdd.bind(this),
      [WebsocketEvents.SELECT_CHARACTER]: this.handleCharacterSelect.bind(this),
      [WebsocketEvents.DELETE_CHARACTER]: this.handleCharacterDelete.bind(this),
      [WebsocketEvents.JOIN_INSTANCE]: this.handleJoinInstance.bind(this),
      [WebsocketEvents.UPDATE_POSITION]: this.handlePositionUpdate.bind(this),
    } satisfies Partial<Record<WebsocketEvents, Handler>>;
  }

  // Handlers
  private async handleGetCharacters(client: WebSocket) {
    if (!client.user?.id) {
      client.send(JSON.stringify({ clientId: client.id, type: WebsocketEvents.DENY_RESPONSE }));
      return;
    }
    
    const characters = await this.dataSource.getRepository(Character).find({
      where: { userId: client.user.id },
    });

    client.send(JSON.stringify({ clientId: client.id, type: WebsocketEvents.CHARACTERS_LISTED, data: characters }));
  }

  private async handleCharacterAdd(client: WebSocket, message: WebsocketMessage<AddCharacterRequest>) {
    if (!client.user?.id) {
      client.send(JSON.stringify({ clientId: client.id, type: WebsocketEvents.DENY_RESPONSE }));
      return;
    }
    
    const data = message.data;
    const character = new Character();

    character.userId = client.user.id;
    character.name = data.name;
    character.instancePath = WorldInstance.Village;
    character.x = 200;
    character.y = 200;

    await this.dataSource.getRepository(Character).save(character);

    client.send(JSON.stringify({ clientId: client.id, type: WebsocketEvents.CHARACTER_ADDED }));
  }

  private async handleCharacterSelect(sender: WebSocket, message: WebsocketMessage<SelectCharacterRequest>) {
    if (!sender.user?.id) {
      sender.send(JSON.stringify({ clientId: sender.id, type: WebsocketEvents.DENY_RESPONSE }));
      return;
    }
    
    const characterId = message.data.characterId as string;
    const character = await this.dataSource.getRepository(Character).findOne({
      where: { id: characterId, userId: sender.user.id },
    });

    if (!character) {
      sender.send(JSON.stringify({ clientId: sender.id, type: WebsocketEvents.DENY_RESPONSE }));
      return;
    }

    sender.character = {
      ...character,
      speed: 200,
      lastPositionUpdate: Date.now(),
    } as ClientCharacter;

    const joinMessage: WebsocketMessage<ClientCharacter> = {
      clientId: sender.id!,
      type: WebsocketEvents.JOIN_INSTANCE,
      data: sender.character,
    };

    this.broadcastHelper.broadcastToInstance(sender, sender.character?.instancePath, joinMessage);

    sender.send(JSON.stringify({ clientId: sender.id, type: WebsocketEvents.CHARACTER_SELECTED, data: sender.character }));
  }

  private async handleCharacterDelete(client: WebSocket, message: WebsocketMessage<DeleteCharacterRequest>) {    
    if (!client.user?.id) {
      client.send(JSON.stringify({ clientId: client.id, type: WebsocketEvents.DENY_RESPONSE }));
      return;
    }

    const characterId = message.data.characterId as string;
    const character = await this.dataSource.getRepository(Character).findOne({
      where: { id: characterId, userId: client.user.id },
    });

    if (!character) {
      client.send(JSON.stringify({ clientId: client.id, type: WebsocketEvents.DENY_RESPONSE }));
      return;
    }

    await this.dataSource.getRepository(Character).remove(character);

    client.send(JSON.stringify({ clientId: client.id, type: WebsocketEvents.CHARACTER_DELETED, data: character }));
  }

  private async handleJoinInstance(sender: WebSocket, message: WebsocketMessage<ClientCharacter>) {
    const clientId = sender.id;
    
    if (!clientId || !sender.character) return;
    
    const newSenderInstancePath = message.data.instancePath;
    const previousInstance = sender.character.instancePath;

    await this.updateClientCharacterPosition(sender, message.data);
    
    sender.send(JSON.stringify({ clientId, type: WebsocketEvents.JOIN_INSTANCE, data: sender.character }));
    
    this.sendClientCharacterToInstanceClients(sender);
    this.sendPreviousCharactersInInstanceToClient(sender);
    
    if (previousInstance && previousInstance !== newSenderInstancePath) {
      this.sendInstanceLeftMessageToPreviousInstance(sender, previousInstance);
    }
  }

  private async handlePositionUpdate(client: WebSocket, message: WebsocketMessage<ClientCharacter>) {
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
    message.type = WebsocketEvents.LEFT_INSTANCE;
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

      message.type = WebsocketEvents.JOIN_INSTANCE;
      
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

  private async updateClientCharacterPosition(client: WebSocket, data: ClientCharacter): Promise<void> {
    const { x, y, instancePath, direction } = data;

    if (client.character) {
      client.character.x = x;
      client.character.y = y;
      client.character.lastPositionUpdate = Date.now();
      client.character.direction = direction;

      if (instancePath) {
        client.character.instancePath = instancePath;
      }
      
      await this.dataSource.getRepository(Character).update({ id: client.character.id }, { x, y, direction, instancePath: client.character.instancePath });
    }
  }

}
