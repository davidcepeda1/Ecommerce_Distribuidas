import { Injectable, Logger } from '@nestjs/common';

interface PedidoCreadoEvent {
  pedidoId: string;
  productoId: string;
  cantidad: number;
}

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  // Simula el envío de una notificación (email/push) con LATENCIA_SIMULADA_MS
  // de "trabajo" downstream. No hay respuesta que esperar: el emisor
  // (MS Pedidos) ya respondió al Gateway antes de que esto ocurra.
  async notificarPedidoCreado(evento: PedidoCreadoEvent) {
    const delay = Number(process.env.LATENCIA_SIMULADA_MS ?? 0);
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    this.logger.log(
      `📩 Notificación enviada: pedido ${evento.pedidoId} confirmado (producto ${evento.productoId}, cantidad ${evento.cantidad})`,
    );
  }

  // Consumido desde RabbitMQ (Avance 2). Simula avisar al equipo de compras.
  alertarStockBajo(evento: { productoId: string; nombre: string; stock: number }) {
    this.logger.warn(
      `⚠️  Stock bajo: "${evento.nombre}" (${evento.productoId}) quedó en ${evento.stock} unidades — alerta de reabastecimiento enviada.`,
    );
  }
}
