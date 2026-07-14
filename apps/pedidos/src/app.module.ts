import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './pedido.entity';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'app',
      password: process.env.DB_PASSWORD ?? 'app',
      database: process.env.DB_NAME ?? 'app',
      entities: [Pedido],
      synchronize: true, // MVP académico: sin migraciones
    }),
    TypeOrmModule.forFeature([Pedido]),
    ClientsModule.register([
      {
        // Cliente TCP hacia MS Productos: salto síncrono de la cadena.
        name: 'PRODUCTOS_TCP',
        transport: Transport.TCP,
        options: {
          host: process.env.SVC_PRODUCTOS_HOST ?? 'localhost',
          port: Number(process.env.SVC_PRODUCTOS_PORT ?? 3001),
        },
      },
      {
        // Cliente Redis para publicar eventos: camino asíncrono.
        name: 'EVENTOS_REDIS',
        transport: Transport.REDIS,
        options: {
          host: process.env.REDIS_HOST ?? 'localhost',
          port: Number(process.env.REDIS_PORT ?? 6379),
        },
      },
    ]),
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class AppModule {}
