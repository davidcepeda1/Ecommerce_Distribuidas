import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  // App híbrida: HTTP mínimo (no expuesto) + dos transportes de microservicio.
  const app = await NestFactory.create(AppModule);

  // Transporte 1 — TCP: camino síncrono del Avance 1 (se conserva).
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port: Number(process.env.PORT ?? 3001) },
  });

  // Transporte 2 — gRPC (Avance 2): contrato productos.proto, canal de lectura.
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'productos',
      protoPath: join(process.cwd(), '..', '..', 'proto', 'productos.proto'),
      url: `0.0.0.0:${Number(process.env.GRPC_PORT ?? 5000)}`,
    },
  });

  await app.startAllMicroservices();
  await app.listen(Number(process.env.HTTP_PORT ?? 3002), '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(
    `🟢 MS Productos — TCP:${process.env.PORT ?? 3001} · gRPC:${process.env.GRPC_PORT ?? 5000}`,
  );
}
bootstrap();
