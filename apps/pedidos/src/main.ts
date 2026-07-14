import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: Number(process.env.PORT ?? 3000),
    },
  });
  await app.listen();
  // eslint-disable-next-line no-console
  console.log(`🟢 MS Pedidos escuchando TCP en puerto ${process.env.PORT ?? 3000}`);
}
bootstrap();
