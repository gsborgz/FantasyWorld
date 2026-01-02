import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './modules/app.module';
import { ExceptionMiddleware } from './core/middleware/exception.middleware';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';
import * as useragent from 'express-useragent';
import cors from 'cors';
import { I18nService } from 'nestjs-i18n';
import { ResponseMiddleware } from './core/middleware/response.middleware';
import { DictionaryService } from './core/services/dictionary.service';

dotenv.config();

async function bootstrap() {
  const port = Number(process.env.PORT);
  const app = await NestFactory.create(AppModule);
  const i18n = app.get<I18nService>(I18nService);
  const dictionary = new DictionaryService(i18n);
  const corsOptions: cors.CorsOptions = {
    allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization', 'language', 'timezone'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  };

  app.use(cors(corsOptions));
  app.use(bodyParser.json({ type: ['application/json'], limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.use(useragent.express());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new ExceptionMiddleware(dictionary));
  app.useGlobalInterceptors(new ResponseMiddleware(dictionary));

  app.enableShutdownHooks();

  await app.listen(port);

  // eslint-disable-next-line no-console
  console.log(`Auth server running on port ${port}`);
}

void bootstrap();
