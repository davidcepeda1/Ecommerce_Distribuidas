import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: Number(process.env.PORT ?? 3001),
    },
  });
  await app.listen();
  // eslint-disable-next-line no-console
  console.log(`🟢 MS Productos escuchando TCP en puerto ${process.env.PORT ?? 3001}`);
}
bootstrap();
