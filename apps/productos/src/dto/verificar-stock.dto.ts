import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class VerificarStockDto {
  @IsUUID()
  productoId: string;

  @IsInt()
  @IsPositive()
  cantidad: number;
}
