import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`🟢 API Gateway HTTP escuchando en puerto ${process.env.PORT ?? 3000}`);
}
bootstrap();
