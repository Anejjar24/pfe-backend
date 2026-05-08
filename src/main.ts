import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // API versioning (optional)
  app.setGlobalPrefix('api');

  // Listen
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);

  logger.log(`AquaFlow API listening on port ${port}`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
