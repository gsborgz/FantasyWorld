import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { WebsocketEvents, WebsocketMessage } from '../shared/ws-utils';
import { RedisService } from '../core/services/redis.service';
import { Handler } from '../types/ws.types';
import { DataSource } from 'typeorm';
import { Character } from '../core/entities/character.entity';
import { UpdatePositionRequest } from '../shared/dtos';

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
  private async handleJoinInstance(client: WebSocket, message: WebsocketMessage<any>, ctx: { allClients: Set<WebSocket> }) {
    const instancePath = (message.data.instance as string) ?? (message.data.instancePath as string);
    const clientId = client.id;
    
    if (!clientId) return;

    const previousInstancePath = client.character?.instancePath;

    try {
      const pipeline = this.redisService.client.multi();
      
      if (previousInstancePath) {
        pipeline.srem(this.redisService.keys.instanceClients(previousInstancePath), clientId);
      }

      pipeline.sadd(this.redisService.keys.instanceClients(instancePath), clientId);
      pipeline.set(this.redisService.keys.clientCurrentInstance(clientId), instancePath);
      await pipeline.exec();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Valkey error on joinInstance:', err);
    }

    client.character!.instancePath = instancePath;

    if (previousInstancePath) {
      this.broadcastToInstance(client, previousInstancePath, {
        type: WebsocketEvents.INSTANCE_LEFT,
        data: { clientId },
      }, ctx.allClients);
    }

    this.broadcastToInstance(client, instancePath, {
      type: WebsocketEvents.JOIN_INSTANCE,
      data: {
        clientId,
        characterId: client.character?.id,
        characterName: (client.character as any)?.name ?? (client as any).user?.username ?? "",
        x: (client.character as any)?.x,
        y: (client.character as any)?.y,
        direction: (client.character as any)?.direction,
        speed: (client.character as any)?.speed ?? 200,
      },
    }, ctx.allClients);

    // Envia imediatamente um UPDATE_POSITION para que clientes já presentes
    // possam instanciar o novo player sem depender do primeiro movimento
    if (client.character?.id) {
      this.broadcastToInstance(client, instancePath, {
        type: WebsocketEvents.UPDATE_POSITION,
        data: {
          clientId: client.id,
          characterId: client.character.id,
          characterName: client.character.name,
          x: client.character.x,
          y: client.character.y,
          direction: client.character.direction,
          speed: client.character?.speed ?? 200,
        },
      }, ctx.allClients);
    }
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
