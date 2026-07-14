import { Controller, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { RpcExceptionFilter } from './rpc-exception.filter';

@Controller()
@UseFilters(new RpcExceptionFilter())
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @MessagePattern('pedidos.listar')
  listar() {
    return this.pedidosService.listar();
  }

  @MessagePattern('pedidos.crear')
  @UsePipes(new ValidationPipe({ transform: true }))
  crear(@Payload() dto: CreatePedidoDto) {
    return this.pedidosService.crear(dto);
  }

  @MessagePattern('pedidos.crearAsync')
  @UsePipes(new ValidationPipe({ transform: true }))
  crearAsync(@Payload() dto: CreatePedidoDto) {
    return this.pedidosService.crearAsync(dto);
  }
}
