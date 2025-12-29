import { WebsocketEvents } from "../../../shared/ws-utils";
import { handleJoinInstance } from "./instance.handler";

export const InstanceModule = {
  [WebsocketEvents.JOIN_INSTANCE]: handleJoinInstance
}
