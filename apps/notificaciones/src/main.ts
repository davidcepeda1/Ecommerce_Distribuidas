import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // App híbrida: HTTP mínimo (no expuesto) + dos transportes de eventos.
  const app = await NestFactory.create(AppModule);

  // Transporte del Avance 1 — Redis Pub/Sub (evento pedido.creado).
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT ?? 6379),
    },
  });

  // Transporte del Avance 2 — RabbitMQ (cola stock.bajo).
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672'],
      queue: 'notificaciones_stock',
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
  await app.listen(Number(process.env.HTTP_PORT ?? 3003), '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log('🟢 MS Notificaciones — Redis(pedido.creado) + RabbitMQ(stock.bajo)');
}
bootstrap();
