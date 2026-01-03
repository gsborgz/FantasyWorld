import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { WebsocketEvents, WebsocketMessage } from '../shared/ws-utils';
import { Handler } from '../types/ws.types';
import { Character } from '../core/entities/character.entity';
import { DataSource } from 'typeorm';
import { WorldInstancePath } from '../shared/world-instances';
import { AddCharacterRequest, CharacterResponse, DeleteCharacterRequest, Direction, SelectCharacterRequest } from '../shared/dtos';
import { BroadcastHelper } from '../helpers/broadcast.helper';

@Injectable()
export class CharacterHandler {

  constructor(
    private readonly dataSource: DataSource,
    private readonly broadcastHelper: BroadcastHelper
  ) {}

  getHandlers() {
    return {
      [WebsocketEvents.LIST_CHARACTERS]: this.handleGetCharacters.bind(this),
      [WebsocketEvents.ADD_CHARACTER]: this.handleCharacterAdd.bind(this),
      [WebsocketEvents.SELECT_CHARACTER]: this.handleCharacterSelect.bind(this),
      [WebsocketEvents.DELETE_CHARACTER]: this.handleCharacterDelete.bind(this),
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

    client.send(JSON.stringify({ clientId: client.id, type: WebsocketEvents.CHARACTERS_LISTED, data: { characters } }));
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
    character.instancePath = WorldInstancePath.MainCity.MainCityA;
    character.x = 100;
    character.y = 100;
    character.direction = Direction.DOWN;
    
    await this.dataSource.getRepository(Character).save(character);

    client.send(JSON.stringify({ clientId: client.id, type: WebsocketEvents.CHARACTER_ADDED }));
  }

  private async handleCharacterSelect(sender: WebSocket, message: WebsocketMessage<SelectCharacterRequest>, ctx: { allClients: Set<WebSocket> }) {
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
      id: character.id,
      name: character.name,
      instancePath: character.instancePath,
      x: character.x,
      y: character.y,
      direction: character.direction,
      lastPositionUpdate: Date.now(),
    };
    
    const joinMessage: WebsocketMessage<CharacterResponse> = {
      clientId: sender.id!,
      type: WebsocketEvents.JOIN_INSTANCE,
      data: sender.character as unknown as CharacterResponse,
    };
    
    this.broadcastHelper.broadcastToInstance(sender, joinMessage, ctx.allClients);
    sender.send(JSON.stringify({ clientId: sender.id, type: WebsocketEvents.CHARACTER_SELECTED, data: character }));
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

}
