import { WebsocketEvents } from "../../../shared/ws-utils";
import { handlePing } from "./ping.handler";

export const PingModule = {
  [WebsocketEvents.PING]: handlePing,
}
