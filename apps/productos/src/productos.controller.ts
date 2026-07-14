import { Controller, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductosService } from './productos.service';
import { VerificarStockDto } from './dto/verificar-stock.dto';
import { RpcExceptionFilter } from './rpc-exception.filter';

@Controller()
@UseFilters(new RpcExceptionFilter())
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @MessagePattern('productos.listar')
  listar() {
    return this.productosService.listar();
  }

  @MessagePattern('productos.crear')
  crear(@Payload() data: { nombre: string; precio: number; stock: number }) {
    return this.productosService.crear(data);
  }

  @MessagePattern('productos.obtener')
  obtener(@Payload() data: { id: string }) {
    return this.productosService.obtener(data.id);
  }

  // Camino síncrono TCP: MS Pedidos espera esta respuesta antes de continuar.
  @MessagePattern('productos.verificarYReservarStock')
  @UsePipes(new ValidationPipe({ transform: true }))
  verificarYReservarStock(@Payload() dto: VerificarStockDto) {
    return this.productosService.verificarYReservarStock(dto);
  }
}
