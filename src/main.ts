import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';

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

	app.use(
		session({ resave: false, saveUninitialized: false, secret: '!Seoul' }),
	);
	app.use(passport.initialize());
	app.use(passport.session());
	await app.listen(3000);
}
bootstrap();
