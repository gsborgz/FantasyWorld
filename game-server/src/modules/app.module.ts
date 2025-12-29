import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { RouterService } from '../core/ws/router.service';
import { AuthModule } from './auth/auth.module';
import { PingModule } from './ping/ping.module';
import { ChatModule } from './chat/chat.module';
import { InstanceModule } from './instance/instance.module';

@Module({
  imports: [AuthModule, PingModule, ChatModule, InstanceModule],
  providers: [AppGateway, RouterService],
})
export class AppModule {}
