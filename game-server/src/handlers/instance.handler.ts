import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { WebsocketEvents, WebsocketMessage } from '../shared/ws-utils';
import { RedisService } from '../core/services/redis.service';
import { Handler } from '../types/ws.types';
import { DataSource } from 'typeorm';
import { Character } from '../core/entities/character.entity';
import { CharacterResponse, InstanceJoinedResponse, JoinInstanceRequest, UpdatePositionRequest } from '../shared/dtos';

@Injectable()
export class InstanceHandler {

  constructor(private readonly dataSource: DataSource, private readonly redisService: RedisService) {}

  getHandlers() {
    return {
      [WebsocketEvents.JOIN_INSTANCE]: this.handleJoinInstance.bind(this),
      [WebsocketEvents.UPDATE_POSITION]: this.handlePositionUpdate.bind(this),
    } satisfies Partial<Record<WebsocketEvents, Handler>>;
  }

  // Handlers
  private async handleJoinInstance(sender: WebSocket, message: WebsocketMessage<JoinInstanceRequest>, ctx: { allClients: Set<WebSocket> }) {
    const newSenderInstancePath = message.data.instancePath;
    const clientId = sender.id;
    
    if (!clientId) return;

    const previousSenderInstancePath = sender.character?.instancePath;

    sender.character!.instancePath = newSenderInstancePath;

    if (previousSenderInstancePath) {
      this.broadcastToInstance(sender, previousSenderInstancePath, {
        type: WebsocketEvents.INSTANCE_LEFT,
        data: sender.character as unknown as CharacterResponse,
      }, ctx.allClients);
    }
    
    const instanceClients = Array.from(ctx.allClients).filter(client => client.character?.instancePath === newSenderInstancePath && client !== sender);
    const characters = instanceClients.map(client => client.character).filter(Boolean) as unknown as CharacterResponse[];
    const joinMessage: WebsocketMessage<CharacterResponse> = {
      clientId: sender.id!,
      type: WebsocketEvents.JOIN_INSTANCE,
      data: sender.character as unknown as CharacterResponse,
    };
    const joinedMessage: WebsocketMessage<InstanceJoinedResponse> = {
      clientId: sender.id!,
      type: WebsocketEvents.INSTANCE_JOINED,
      data: {
        clients: characters,
      }
    };

    this.broadcastToInstance(sender, newSenderInstancePath, joinMessage, ctx.allClients);

    if (sender.character?.id) {
      this.broadcastToInstance(sender, newSenderInstancePath, {
        type: WebsocketEvents.UPDATE_POSITION,
        data: sender.character as unknown as CharacterResponse,
      }, ctx.allClients);
    }

    sender.send(JSON.stringify(joinedMessage));
  }

  private async handlePositionUpdate(client: WebSocket, message: WebsocketMessage<UpdatePositionRequest>, ctx: { allClients: Set<WebSocket> }) {
    const instancePath = client.character?.instancePath;
    const clientId = client.id;
    const data = message.data;
    
    if (!clientId || !instancePath) return;

    this.updateClientPosition(client, data);

    this.broadcastToInstance(client, instancePath, {
      type: WebsocketEvents.UPDATE_POSITION,
      data: {
        clientId: client.id,
        characterId: client.character?.id,
        characterName: client.character?.name,
        x: data.x,
        y: data.y,
        direction: data.direction,
        speed: data.speed
      },
    }, ctx.allClients);
  }

  // Utils
  private broadcastToInstance(sender: WebSocket, instancePath: string, message: any, allClients: Set<WebSocket>) {
    for (const client of allClients) {
      if (client === sender) continue;

      const clientInstancePath = client.character?.instancePath;

      if (clientInstancePath !== instancePath) continue;

      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ clientId: sender.id, ...message }));
      }
    }
  }

  private updateClientPosition(client: WebSocket, data: UpdatePositionRequest) {
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

}
