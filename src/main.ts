import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('트센 API 설계')
    .setDescription('우와우웅~~~~~~~')
    .setVersion('1.0')
    .addTag('inssa')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.use(cookieParser('6C18F65F7391AF35E97971B25A499')); // TODO: env config
  await app.listen(3000);
}
bootstrap();
