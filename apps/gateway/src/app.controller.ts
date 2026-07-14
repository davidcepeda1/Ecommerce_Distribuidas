import { Body, Controller, Get, Inject, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreatePedidoDto } from './dto/create-pedido.dto';

@Controller('api')
export class AppController {
  constructor(
    @Inject('PEDIDOS_TCP') private readonly pedidosClient: ClientProxy,
    @Inject('PRODUCTOS_TCP') private readonly productosClient: ClientProxy,
  ) {}

  // Camino A — síncrono: Gateway --TCP--> Pedidos --TCP--> Productos (espera respuesta).
  @Post('pedidos')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  crearPedido(@Body() dto: CreatePedidoDto) {
    return firstValueFrom(this.pedidosClient.send('pedidos.crear', dto));
  }

  // Camino B — asíncrono: Gateway --TCP--> Pedidos, que solo publica el
  // evento en Redis y responde sin esperar a MS Notificaciones.
  @Post('pedidos/async')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  crearPedidoAsync(@Body() dto: CreatePedidoDto) {
    return firstValueFrom(this.pedidosClient.send('pedidos.crearAsync', dto));
  }

  @Get('pedidos')
  listarPedidos() {
    return firstValueFrom(this.pedidosClient.send('pedidos.listar', {}));
  }

  @Get('productos')
  listarProductos() {
    return firstValueFrom(this.productosClient.send('productos.listar', {}));
  }

  @Get('productos/:id')
  obtenerProducto(@Param('id') id: string) {
    return firstValueFrom(this.productosClient.send('productos.obtener', { id }));
  }
}
