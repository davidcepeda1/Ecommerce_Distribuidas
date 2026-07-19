import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './producto.entity';
import { VerificarStockDto } from './dto/verificar-stock.dto';

@Injectable()
export class ProductosService {
  private readonly logger = new Logger(ProductosService.name);

  constructor(
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
    @Inject('STOCK_RMQ') private readonly stockClient: ClientProxy,
  ) {}

  async listar(): Promise<Producto[]> {
    return this.productoRepo.find();
  }

  async crear(data: Partial<Producto>): Promise<Producto> {
    const producto = this.productoRepo.create(data);
    return this.productoRepo.save(producto);
  }

  async obtener(id: string): Promise<Producto> {
    const producto = await this.productoRepo.findOne({ where: { id } });
    if (!producto) {
      throw new RpcException({ status: 404, message: `Producto ${id} no encontrado` });
    }
    return producto;
  }

  /**
   * Llamado por MS Pedidos vía TCP (salto síncrono de la cadena).
   * Reserva stock de forma atómica descontando directamente en la BD.
   *
   * LATENCIA_SIMULADA_MS emula trabajo real downstream (ej. consultar un
   * sistema externo de inventario). En una red Docker local el round-trip
   * TCP es de 1-2ms, así que sin este delay la acumulación de latencia del
   * camino síncrono no sería medible ni visible en el benchmark.
   */
  async verificarYReservarStock(dto: VerificarStockDto): Promise<{ ok: boolean; producto?: Producto; motivo?: string }> {
    const delay = Number(process.env.LATENCIA_SIMULADA_MS ?? 0);
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const producto = await this.productoRepo.findOne({ where: { id: dto.productoId } });

    if (!producto) {
      return { ok: false, motivo: `Producto ${dto.productoId} no existe` };
    }

    if (producto.stock < dto.cantidad) {
      this.logger.warn(`Stock insuficiente para ${producto.nombre}: pedido=${dto.cantidad} disponible=${producto.stock}`);
      return { ok: false, motivo: 'Stock insuficiente', producto };
    }

    producto.stock -= dto.cantidad;
    const actualizado = await this.productoRepo.save(producto);

    // Segundo transporte (Avance 2 — RabbitMQ, cola): si el stock queda por
    // debajo del umbral, publica 'stock.bajo' para alertar reabastecimiento.
    // Flujo distinto al 'pedido.creado' de Redis; el emisor no espera al consumidor.
    const umbral = Number(process.env.UMBRAL_STOCK_BAJO ?? 5);
    if (actualizado.stock < umbral) {
      this.stockClient.emit('stock.bajo', {
        productoId: actualizado.id,
        nombre: actualizado.nombre,
        stock: actualizado.stock,
      });
    }

    return { ok: true, producto: actualizado };
  }
}
