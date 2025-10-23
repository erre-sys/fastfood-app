export type MetodoPago = 'efectivo' | 'transferencia';
export type EstadoPago = 'pendiente' | 'pagado' | 'anulado' | 'fiado';

export interface PagoCliente {
  id: number;
  pedidoId: number;
  fecha: string; // formato: yyyy-MM-dd HH:mm:ss
  montoTotal: number;
  metodo: MetodoPago;
  referencia?: string;
  estado?: EstadoPago;
  creadoPorSub?: string;
}

export interface PagoClienteCreate {
  pedidoId: number;
  montoTotal: number;
  metodo: MetodoPago;
  referencia?: string;
}
