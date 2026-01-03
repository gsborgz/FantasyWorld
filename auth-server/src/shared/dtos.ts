

export enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

export class LoginData {

  username: string;
  password: string;

}

export class RegisterData {

  username: string;
  password: string;
  passwordConfirmation: string;

}

export class BaseMessage {

  message: string | { key: string; args?: Record<string, any> };

}

export class MeResponse {

  id: string;
  username: string;

}

export class SessionData {

  token: string;

}

export class ChatMessage {

  text: string;
  senderName: string;

}

export class LoginRequest {

  sid: string;

}

export class SelectCharacterRequest {

  characterId: string;

}

export class UpdatePositionRequest {

  x: number;
  y: number;
  direction: Direction;
  speed: number;

}

export class DeleteCharacterRequest {

  characterId: string;

}

export class AddCharacterRequest {

  name: string;

}

export class JoinInstanceRequest {

  instancePath: string;

}

export class ClientCharacter {

  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  instancePath: string;
  x: number;
  y: number;
  direction: Direction;
  userId: string;
  speed: number;
  lastPositionUpdate: number;

}

export class UpdatePositionResponse {

  characterId: string;
  characterName: string;
  x: number;
  y: number;
  direction: Direction;
  speed: number;

}

export class GameServerResponse {

  name: string;
  location: string;
  url: string;
  status?: 'online' | 'offline';
  clientsCount?: number;

}

