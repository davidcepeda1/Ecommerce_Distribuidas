import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';

/**
 * Los microservicios (Pedidos/Productos) rechazan sus llamadas TCP con
 * objetos { status, message } vía RpcException. Este filtro los traduce
 * a respuestas HTTP normales para el cliente del Gateway.
 */
@Catch()
export class MicroserviceExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MicroserviceExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      return res.status(exception.getStatus()).json(exception.getResponse());
    }

    // Errores gRPC (Avance 2) llegan con { code, details } en vez de { status, message }.
    if (typeof exception?.code === 'number' && exception?.status === undefined) {
      const grpcToHttp: Record<number, number> = { 3: 400, 5: 404, 7: 403, 16: 401 };
      const grpcStatus = grpcToHttp[exception.code] ?? 500;
      const grpcMsg = exception.details ?? exception.message ?? 'Error en llamada gRPC';
      if (grpcStatus >= 500) this.logger.error(`gRPC ${exception.code} - ${grpcMsg}`);
      return res.status(grpcStatus).json({ statusCode: grpcStatus, message: grpcMsg });
    }

    const status = typeof exception?.status === 'number' ? exception.status : 500;
    const message = exception?.message ?? 'Error inesperado en el sistema';

    if (status >= 500) {
      this.logger.error(`${status} - ${message}`, exception?.stack);
    }

    res.status(status).json({ statusCode: status, message });
  }
}
