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
  INSTANCE_LEFT,
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
