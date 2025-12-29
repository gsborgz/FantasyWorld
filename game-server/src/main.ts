import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import * as dotenv from 'dotenv';
import { AppModule } from './modules/app.module';

dotenv.config();

async function bootstrap() {
  const port = Number(process.env.PORT) || 8080;
  const app = await NestFactory.create(AppModule);

  app.useWebSocketAdapter(new WsAdapter(app));
  app.enableShutdownHooks();

  await app.listen(port);

  console.log(`Websocket server running on port ${port}`);
}

void bootstrap();
