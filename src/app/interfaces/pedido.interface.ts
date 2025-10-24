export type EstadoPedido = 'C' | 'L' | 'E' | 'A'; // C:Creado, L:Listo, E:Entregado, A:Anulado

export interface PedidoItemExtra {
  id?: number;
  pedidoItemId: number;
  ingredienteId: number;
  cantidad: number;
  precioExtra?: number; // Calculado por backend
  ingredienteNombre?: string; // Para display
}

export interface PedidoItem {
  id?: number;
  pedidoId?: number;
  platoId: number;
  cantidad: number;
  precioUnitario?: number; // Calculado por backend con promo
  descuentoPct?: number; // Calculado por backend
  descuentoMonto?: number; // Calculado por backend
  subtotal?: number; // Calculado por backend
  platoNombre?: string; // Para display
  extras?: PedidoItemExtra[];
}

export interface Pedido {
  id: number;
  estado: EstadoPedido;
  totalBruto: number;
  totalExtras: number;
  totalNeto: number;
  observaciones?: string;
  entregadoPorSub?: string;
  creadoEn: string; // yyyy-MM-dd HH:mm:ss
  actualizadoEn?: string;
  entregadoEn?: string;
  items?: PedidoItem[];
  // Información de pagos
  totalPagado?: number; // Suma de pagos aprobados (estado P)
  montoPendiente?: number; // totalNeto - totalPagado
}

export interface PedidoCreate {
  observaciones?: string;
  items?: PedidoItemCreate[];
}

export interface PedidoItemCreate {
  platoId: number;
  cantidad: number;
  extras?: PedidoItemExtraCreate[];
}

export interface PedidoItemExtraCreate {
  ingredienteId: number;
  cantidad: number;
}
