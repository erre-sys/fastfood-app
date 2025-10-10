
export type Estado = 'A' | 'I';
export type SN = 'S' | 'N';

export interface GrupoIngrediente {
  id: number;
  nombre: string;
  estado: Estado;
  aplicaComida: SN;
}

export interface GrupoIngredienteCreate {
  nombre: string;
  estado: Estado;
  aplicaComida: SN;
}

export interface GrupoIngredienteUpdate extends GrupoIngrediente {}