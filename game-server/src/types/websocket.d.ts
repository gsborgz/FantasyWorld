/* eslint-disable @typescript-eslint/naming-convention */
import 'ws';
import { ClientCharacter } from '../shared/dtos';

declare module 'ws' {
  interface WebSocket {
    id: string;
    isProbe: boolean;
    sid: string;
    user: {
      id: string;
      username: string;
    };
    character: ClientCharacter
  }
}

export {};
