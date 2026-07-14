import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum EstadoPedido {
  CONFIRMADO = 'CONFIRMADO',
  RECHAZADO = 'RECHAZADO',
}

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  productoId: string;

  @Column('int')
  cantidad: number;

  @Column({ type: 'enum', enum: EstadoPedido })
  estado: EstadoPedido;

  @CreateDateColumn()
  createdAt: Date;
}
