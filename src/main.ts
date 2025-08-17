import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Middleware para cookies
  app.use(cookieParser());
  
  // Configuración de CORS para desarrollo
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Autenticación')
    .setDescription('Sistema de autenticación JWT con refresh tokens')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(3000);
}
bootstrap();