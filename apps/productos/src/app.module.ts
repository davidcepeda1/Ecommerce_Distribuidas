import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './producto.entity';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'app',
      password: process.env.DB_PASSWORD ?? 'app',
      database: process.env.DB_NAME ?? 'app',
      entities: [Producto],
      synchronize: true, // MVP académico: sin migraciones
    }),
    TypeOrmModule.forFeature([Producto]),
  ],
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class AppModule implements OnModuleInit {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
  ) {}

  // Semilla mínima para poder probar el camino síncrono sin pasos manuales extra.
  async onModuleInit() {
    const count = await this.productoRepo.count();
    if (count === 0) {
      await this.productoRepo.save(
        this.productoRepo.create({ nombre: 'Teclado mecánico', precio: 45.99, stock: 25 }),
      );
      await this.productoRepo.save(
        this.productoRepo.create({ nombre: 'Mouse inalámbrico', precio: 19.99, stock: 40 }),
      );
      // Stock alto dedicado a las corridas de benchmark.js (200-300 peticiones)
      // para que no se agote a mitad de la prueba y distorsione la medición.
      await this.productoRepo.save(
        this.productoRepo.create({ nombre: 'Producto Benchmark', precio: 9.99, stock: 1_000_000 }),
      );
    }
  }
}
