import { Body, Controller, Get, Inject, OnModuleInit, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { CreatePedidoDto } from './dto/create-pedido.dto';

interface ProductoResponse {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
}

interface ProductosGrpcService {
  ObtenerProducto(data: { id: string }): Observable<ProductoResponse>;
}

@Controller('api')
export class AppController implements OnModuleInit {
  private productosGrpc: ProductosGrpcService;

  constructor(
    @Inject('PEDIDOS_TCP') private readonly pedidosClient: ClientProxy,
    @Inject('PRODUCTOS_TCP') private readonly productosClient: ClientProxy,
    @Inject('PRODUCTOS_GRPC') private readonly productosGrpcClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.productosGrpc = this.productosGrpcClient.getService<ProductosGrpcService>('ProductosService');
  }

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

  // Avance 2 — camino gRPC: Gateway --gRPC--> Productos (ObtenerProducto).
  // Un id inexistente devuelve NOT_FOUND controlado, mapeado a HTTP 404 por el filtro.
  @Get('grpc/productos/:id')
  obtenerProductoGrpc(@Param('id') id: string) {
    return firstValueFrom(this.productosGrpc.ObtenerProducto({ id }));
  }
}
