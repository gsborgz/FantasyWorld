import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { WebsocketEvents, WebsocketMessage } from '../../shared/ws-utils';

export interface IWsSendOptions {
  timeoutMs?: number;
}


@Injectable()
export class WebsocketService {

  public async ping(url: string, timeoutMs = 2000): Promise<{ ok: boolean; message?: WebsocketMessage<any>; error?: any }> {
    const payload = { type: WebsocketEvents.PING };
    const probeUrl = this.addProbeFlag(url);

    return this.sendAndWait(probeUrl, payload, (m) => m && m.type === WebsocketEvents.PONG, { timeoutMs });
  }

  private async sendAndWait<T = any>(
    url: string,
    payload: unknown,
    responsePredicate: (msg: any) => boolean,
    options?: IWsSendOptions,
  ): Promise<{ ok: boolean; message?: T; error?: any }> {
    const timeoutMs = options?.timeoutMs ?? 2000;

    return new Promise((resolve) => {
      let isResolved = false;
      let connection: WebSocket | null = null;
      let timeoutHandle: NodeJS.Timeout | null = null;
      const resolveOnce = (ok: boolean, message?: T, error?: any) => {
        if (isResolved) return;

        isResolved = true;

        if (timeoutHandle) clearTimeout(timeoutHandle);

        this.closeConnection(connection);
        resolve({ ok, message, error });
      };

      try {
        connection = new WebSocket(url);
      } catch (_err) {
        resolveOnce(false, undefined, _err);

        return;
      }

      timeoutHandle = setTimeout(() => resolveOnce(false, undefined, new Error('timeout')), timeoutMs);

      connection.on('open', () => {
        try {
          const serialized = JSON.stringify(payload);

          connection!.send(serialized);
        } catch (_err) {
          resolveOnce(false, undefined, _err);
        }
      });

      connection.on('message', (data) => {
        const msg = this.parseMessage(data);

        if (msg === undefined) return;

        try {
          if (responsePredicate(msg)) {
            resolveOnce(true, msg);
          }
        } catch (_err) {
          // predicate threw; treat as non-match and continue
        }
      });

      connection.on('error', (_err) => {
        resolveOnce(false, undefined, _err);
      });

      connection.on('close', () => {
        // if closed before resolved, the timeout/error will handle resolution
      });
    });
  }

  private addProbeFlag(url: string): string {
    try {
      const urlObj = new URL(url);
      // Don't override existing probe flag if present
      
      if (!urlObj.searchParams.has('probe')) {
        urlObj.searchParams.set('probe', '1');
      }

      return urlObj.toString();
    } catch {
      // Fallback for relative/invalid URLs: naive append
      
      if (url.includes('?')) return `${url}&probe=1`;

      return `${url}?probe=1`;
    }
  }

  private closeConnection(connection: WebSocket | null): void {
    try {
      if (connection) {
        connection.removeAllListeners?.();
        connection.close();
      }
    } catch {
      // ignore
    }
  }

  private parseMessage(data: any): any | undefined {
    try {
      return JSON.parse(data?.toString?.() ?? data);
    } catch {
      return undefined;
    }
  }

}

