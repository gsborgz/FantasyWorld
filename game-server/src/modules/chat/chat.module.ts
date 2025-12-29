import { WebsocketEvents } from "../../shared/ws-utils";
import { handleGlobalChat, handleInstanceChat } from "./chat.handler";

export const ChatModule = {
  [WebsocketEvents.GLOBAL_CHAT_MESSAGE]: handleGlobalChat,
  [WebsocketEvents.INSTANCE_CHAT_MESSAGE]: handleInstanceChat
}
