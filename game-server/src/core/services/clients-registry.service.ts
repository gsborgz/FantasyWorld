import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';

@Injectable()
export class ClientsRegistryService {
  
  private readonly allClients: Set<WebSocket> = new Set();
  private _maxClients = 1000;

  public get size(): number {
    return this.allClients.size;
  }

  public get hasSpace(): boolean {
    return this.allClients.size < this._maxClients;
  }

  public get maxClients(): number {
    return this._maxClients;
  }

  public getAllClients(): WebSocket[] {
    return Array.from(this.allClients);
  }

  public getInstanceClients(instancePath: string): WebSocket[] {
    if (!instancePath) return [];

    return Array.from(this.allClients).filter(otherClient => otherClient.character?.instancePath === instancePath);
  }

  public getClientByCharacterName(characterName: string): WebSocket | undefined {
    return Array.from(this.allClients).find(client => client.character?.name === characterName);
  }

  public has(client: WebSocket): boolean {
    return this.allClients.has(client);
  }

  public add(client: WebSocket): void {
    this.allClients.add(client);
  }

  public delete(client: WebSocket): void {
    this.allClients.delete(client);
  }

}
