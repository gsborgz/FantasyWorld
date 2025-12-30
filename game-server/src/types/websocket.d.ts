/* eslint-disable @typescript-eslint/naming-convention */
import 'ws';

declare module 'ws' {
  interface WebSocket {
    id?: string;
    sid?: string;
    user?: {
      id: string;
      username: string;
    };
    character?: {
      id: string;
      instancePath: string;
      x: number;
      y: number;
      direction: number;
      lastPositionUpdate: number;
    }
  }
}

export {};
