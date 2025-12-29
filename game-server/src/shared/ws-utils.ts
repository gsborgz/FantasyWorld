export enum WebsocketEvents {
  NONE,
  JOIN_INSTANCE,
  GLOBAL_CHAT_MESSAGE,
  LEAVE_INSTANCE,
  LOGIN_REQUEST,
  REGISTER_REQUEST,
  OK_RESPONSE,
  DENY_RESPONSE,
  PING,
  PONG
}

export class JoinInstanceData {
  instance: string;
}

export class WebsocketMessage<T> {
  client_sid: string;
  type: WebsocketEvents;
  data: T;
}
