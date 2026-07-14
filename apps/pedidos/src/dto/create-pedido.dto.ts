import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class CreatePedidoDto {
  @IsUUID()
  productoId: string;

  @IsInt()
  @IsPositive()
  cantidad: number;
}
