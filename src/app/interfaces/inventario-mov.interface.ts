export type TipoMovimiento = 'COMPRA' | 'CONSUMO' | 'AJUSTE';

export interface InventarioMov {
  id: number;
  ingredienteId: number;
  ingredienteNombre?: string; // opcional, desde JOIN
  fecha: string; // ISO 8601
  tipo: TipoMovimiento;
  cantidad: number;
  descuentoPct: number | null;
  referencia: string | null;
  compraItemId: number | null;
  pedidoId: number | null;
}
