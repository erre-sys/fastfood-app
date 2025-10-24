export type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'DEPOSITO';
export type EstadoPago = 'S' | 'P' | 'F'; // S=Solicitado, P=Pagado, F=Fiado

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
  fecha?: string; // formato: yyyy-MM-dd HH:mm:ss (opcional, el backend lo llena con LocalDateTime.now())
  montoTotal: number;
  metodo: MetodoPago;
  referencia?: string;
  creadoPorSub?: string; // identificador del usuario que registra el pago
}
