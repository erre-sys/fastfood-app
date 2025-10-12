export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'DEPOSITO' | 'TARJETA';

export interface PagoProveedor {
  id: number;
  proveedorId: number;
  proveedorNombre?: string;
  fecha: string;              
  metodo: MetodoPago;
  referencia?: string | null;
  montoTotal: number;
  observaciones?: string | null;
}

export interface PagoProveedorCreate {
  proveedorId: number;
  metodo: MetodoPago;
  referencia?: string | null;
  montoTotal: number;
  observaciones?: string | null;
}
