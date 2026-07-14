import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificacionesService } from './notificaciones.service';

@Controller()
export class NotificacionesController {
  private readonly logger = new Logger(NotificacionesController.name);

  constructor(private readonly notificacionesService: NotificacionesService) {}

  @EventPattern('pedido.creado')
  handlePedidoCreado(@Payload() data: { pedidoId: string; productoId: string; cantidad: number }) {
    try {
      this.notificacionesService.notificarPedidoCreado(data);
    } catch (err) {
      // Un fallo aquí nunca debe tumbar el proceso: es un consumidor async.
      this.logger.error(`Error procesando evento pedido.creado: ${err}`);
    }
  }
}
