export interface Ingrediente {
  ingrediente_id: number;
  codigo: string;
  nombre: string;
  grupo_ingrediente_id: number;
  unidad: string;           
  es_extra: boolean;
  precio_extra: number | null;
  stock_minimo: number | null;
  estado: string;
}
