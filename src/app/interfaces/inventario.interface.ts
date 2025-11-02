export interface Inventario {
  ingredienteId: number;
  codigo: string;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  unidad: string;
  actualizadoEn: string;
}

export interface AjusteInventario {
  ingredienteId: number;
  cantidad: number; // Positivo = SUMAR, Negativo = RESTAR
  referencia?: string; // Motivo del ajuste
  permitirNegativo?: boolean; // Permitir que el stock quede negativo
}
