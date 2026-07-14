import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { MicroserviceExceptionFilter } from './microservice-exception.filter';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PEDIDOS_TCP',
        transport: Transport.TCP,
        options: {
          host: process.env.SVC_PEDIDOS_HOST ?? 'localhost',
          port: Number(process.env.SVC_PEDIDOS_PORT ?? 3000),
        },
      },
      {
        name: 'PRODUCTOS_TCP',
        transport: Transport.TCP,
        options: {
          host: process.env.SVC_PRODUCTOS_HOST ?? 'localhost',
          port: Number(process.env.SVC_PRODUCTOS_PORT ?? 3001),
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [{ provide: APP_FILTER, useClass: MicroserviceExceptionFilter }],
})
export class AppModule {}
