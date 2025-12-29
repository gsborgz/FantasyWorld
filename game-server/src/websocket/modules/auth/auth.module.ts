import { WebsocketEvents } from "../../../shared/ws-utils";
import { handleLogin } from "./auth.handler";

export const AuthModule = {
  [WebsocketEvents.LOGIN_REQUEST]: handleLogin,
}
