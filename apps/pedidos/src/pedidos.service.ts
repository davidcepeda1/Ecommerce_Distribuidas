import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { catchError, firstValueFrom, timeout } from 'rxjs';
import { Pedido, EstadoPedido } from './pedido.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';

@Injectable()
export class PedidosService {
  private readonly logger = new Logger(PedidosService.name);

  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,
    @Inject('PRODUCTOS_TCP') private readonly productosClient: ClientProxy,
    @Inject('EVENTOS_REDIS') private readonly eventosClient: ClientProxy,
  ) {}

  async listar(): Promise<Pedido[]> {
    return this.pedidoRepo.find();
  }

  /**
   * Camino síncrono (TCP): espera la respuesta de MS Productos antes de
   * continuar. Si Productos está caído o tarda, la petición completa falla
   * (acoplamiento temporal) y la latencia de este salto se SUMA a la total.
   */
  async crear(dto: CreatePedidoDto): Promise<Pedido> {
    const resultado = await firstValueFrom(
      this.productosClient.send('productos.verificarYReservarStock', dto).pipe(
        timeout(5000),
        catchError((err) => {
          this.logger.error(`Fallo al contactar MS Productos: ${err.message ?? err}`);
          throw new RpcException({
            status: 503,
            message: 'MS Productos no disponible: no se pudo verificar stock (acoplamiento temporal)',
          });
        }),
      ),
    );

    if (!resultado.ok) {
      throw new RpcException({ status: 409, message: resultado.motivo ?? 'No se pudo crear el pedido' });
    }

    const pedido = this.pedidoRepo.create({
      productoId: dto.productoId,
      cantidad: dto.cantidad,
      estado: EstadoPedido.CONFIRMADO,
    });
    const guardado = await this.pedidoRepo.save(pedido);

    // Camino asíncrono (Redis): se publica el evento y NO se espera a que
    // MS Notificaciones lo procese. Si Notificaciones está caído, este
    // pedido igual se crea con éxito.
    this.eventosClient.emit('pedido.creado', {
      pedidoId: guardado.id,
      productoId: guardado.productoId,
      cantidad: guardado.cantidad,
    });

    return guardado;
  }

  /**
   * Camino asíncrono "puro" (Redis): el emisor publica el evento y responde
   * de inmediato, SIN esperar ningún salto TCP síncrono. Se usa para
   * comparar en el benchmark contra crear() y evidenciar que no acumula
   * la latencia de saltos downstream.
   */
  async crearAsync(dto: CreatePedidoDto): Promise<{ aceptado: boolean; mensaje: string }> {
    this.eventosClient.emit('pedido.creado', {
      pedidoId: undefined,
      productoId: dto.productoId,
      cantidad: dto.cantidad,
    });
    return { aceptado: true, mensaje: 'Pedido aceptado, procesándose de forma asíncrona' };
  }
}
