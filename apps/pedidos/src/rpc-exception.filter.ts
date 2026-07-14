import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';

/**
 * Traduce cualquier excepción no controlada dentro de la capa de servicios
 * en una respuesta RPC consistente en lugar de tumbar el microservicio.
 */
@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  catch(exception: unknown, _host: ArgumentsHost) {
    if (exception instanceof RpcException) {
      return throwError(() => exception.getError());
    }
    this.logger.error(exception instanceof Error ? exception.stack : exception);
    return throwError(() => ({ status: 500, message: 'Error interno del microservicio' }));
  }
}
