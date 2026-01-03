/* eslint-disable @typescript-eslint/naming-convention */
import 'ws';
import { ClientCharacter } from '../shared/dtos';

declare module 'ws' {
  interface WebSocket {
    id?: string;
    sid?: string;
    user?: {
      id: string;
      username: string;
    };
    character?: ClientCharacter
  }
}

export {};
