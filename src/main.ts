import { NestFactory } from '@nestjs/core';
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

  app.use(cookieParser(process.env.COOKIE_SECRET)); // TODO: env config
  await app.listen(process.env.PORT); // TODO: env config
}
bootstrap();
