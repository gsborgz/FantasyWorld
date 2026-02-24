import type { Character } from "../core/entities/character.entity";

export enum WebsocketEvents {
  NONE,
  
  // Requests
  SELECT_CHARACTER,
  UPDATE_POSITION,
  JOIN_INSTANCE,
  LOGIN,
  PING,
  ADD_CHARACTER,
  LIST_CHARACTERS,
  DELETE_CHARACTER,
  
  // Responses
  POSITION_UPDATED,
  CHARACTER_ADDED,
  CHARACTERS_LISTED,
  CHARACTER_SELECTED,
  CHARACTER_DELETED,
  LEFT_INSTANCE,
  PONG,
  OK_RESPONSE,
  DENY_RESPONSE,
  
  // Request and Response
  GLOBAL_CHAT_MESSAGE,
  INSTANCE_CHAT_MESSAGE,
}

export class WebsocketMessage<T> {
  clientId: string;
  type: WebsocketEvents;
  data: T;
}

export enum WorldInstance {
  Forest = 'forest',
  Village = 'village',
}

export enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

export class ChatMessage {
  text: string;
  senderName: string;
}

export class AuthenticationRequest {
  sid: string;
}

export class SelectCharacterRequest {
  characterId: string;
}

export class DeleteCharacterRequest {
  characterId: string;
}

export class AddCharacterRequest {
  name: string;
}

export type ClientCharacter = Character & {
  speed: number; // Float
  lastPositionUpdate: number; // Integer
  is_moving: boolean;
  is_running: boolean;
};

export class GameServerResponse {
  name: string;
  region: string;
  url: string;
}
