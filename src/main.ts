import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
// import * as cookieParser from 'cookie-parser'; // TODO: Encrypt cookie

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('트센 API 설계')
    .setDescription('우와우웅~~~~~~~')
    .setVersion('1.0')
    .addTag('inssa')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // app.use(cookieParser(process.env.COOKIE_SECRET)); // TODO: Env config. Encrypt cookie
  const DOMAIN = process.env.DOMAIN; // TODO: Env config
  const PORT = process.env.PORT; // TODO: Env config
  app.enableShutdownHooks();
  await app.listen(PORT);

  Logger.log(`Application is running on: ${DOMAIN}:${PORT}`); // Logger.log
}
bootstrap();
