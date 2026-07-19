import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { ProductosService } from './productos.service';

/**
 * Servidor gRPC (Avance 2). Controlador separado del de TCP para que aplique
 * el manejo de errores propio de gRPC (códigos de estado) sin mezclarse con el
 * RpcExceptionFilter de TCP.
 */
@Controller()
export class ProductosGrpcController {
  constructor(private readonly productosService: ProductosService) {}

  @GrpcMethod('ProductosService', 'ObtenerProducto')
  async obtenerProducto(data: { id: string }) {
    try {
      const p = await this.productosService.obtener(data.id);
      return { id: p.id, nombre: p.nombre, precio: Number(p.precio), stock: p.stock };
    } catch {
      // Error controlado: producto inexistente no tumba el servidor gRPC,
      // se responde NOT_FOUND al cliente.
      throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: `Producto ${data.id} no encontrado` });
    }
  }
}
