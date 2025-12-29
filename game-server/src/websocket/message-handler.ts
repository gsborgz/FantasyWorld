import { WebSocket } from "ws";
import { randomUUID } from "node:crypto";
import { WebsocketEvents, WebsocketMessage } from "../shared/ws-utils";

export function handleMessage(client: WebSocket, message: WebsocketMessage<any>, allClients: Set<WebSocket>) {
  switch (message.type) {
    case WebsocketEvents.LOGIN_REQUEST:
      loginClient(client, message);
      break;

    case WebsocketEvents.PING:
      client.send(JSON.stringify({ type: WebsocketEvents.PONG }));
      break;

    case WebsocketEvents.JOIN_INSTANCE:
      joinInstance(client, message.data.instance, allClients);
      break;

    case WebsocketEvents.GLOBAL_CHAT_MESSAGE:
      broadcastGlobal(message, allClients);
      break;

    default:
      client.send(JSON.stringify({ type: 'echo' }));
  }
}

async function loginClient(client: WebSocket, message: WebsocketMessage<any>): Promise<void> {
  const res = await fetch("http://localhost:3000/v1/auth/me", {
    headers: {
      Cookie: `sid=${message.data.sid}`,
    },
  });

  if (!res.ok) {
    client.send(JSON.stringify({ type: WebsocketEvents.DENY_RESPONSE }));
    return;
  }

  const user = await res.json();

  (client as any).id = randomUUID();
  (client as any).user = user; // exemplo
  (client as any).sid = message.data.sid; // exemplo

  // salvar client na lista de clients logados valkey

  client.send(JSON.stringify({ type: WebsocketEvents.OK_RESPONSE }));
}

function joinInstance(client: WebSocket, instancePath: string, allClients: Set<WebSocket>) {
  // buscar a instancia no valkey pelo instancePath
	const newInstance = null; // await InstanceModel.find

  // buscar a instancia atual do jogador pelo instancePath dele
  const previousInstance = null; // await InstanceModel.find

  // Informar instância que ele saiu
	broadcastToInstance(client, previousInstance, null)

  // Informar instância que ele entrou
	broadcastToInstance(client, newInstance, null)
}

export function leaveInstance(client: WebSocket) {
  // remover client das instâncias que ele estiver
  console.log('Client disconnected, removing from instances');
}

function broadcastToInstance(client: WebSocket, instance: any, message: any) {
  // pegar os clients da instancia, exceto a do client que enviou a msg
  const clients: WebSocket[] = [];

  for (const c of clients) {
    if (c.readyState === WebSocket.OPEN) {
      c.send(JSON.stringify(message));
    }
  }
}

function broadcastGlobal(message: any, allClients: Set<WebSocket>) {
  for (const client of allClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}
