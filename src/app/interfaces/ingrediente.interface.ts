export type Estado = 'A' | 'I';
export type SN = 'S' | 'N';

export interface Ingrediente {
  id: number;
  codigo: string;
  nombre: string;
  grupoIngredienteId: number;
  unidad: string | null;
  esExtra: SN;
  aplicaComida: SN;
  precioExtra: number | null;
  stockMinimo: number | null;
  estado: Estado;
  grupoNombre?: string;
}

export interface IngredienteCreate extends Omit<Ingrediente, 'id'> {}
export interface IngredienteUpdate extends Ingrediente {}