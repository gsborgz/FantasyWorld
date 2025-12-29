import { AuthModule } from "./auth/auth.module";
import { ChatModule } from "./chat/chat.module";
import { InstanceModule } from "./instance/instance.module";
import { PingModule } from "./ping/ping.module";

export const Modules = {
  ...AuthModule,
  ...PingModule,
  ...ChatModule,
  ...InstanceModule
}
