export type Estado = 'A' | 'I';
export type SN = 'S' | 'N';

export interface Plato {
  id: number;
  codigo: string;
  nombre: string;
  grupoPlatoId: number;
  precioBase: number | null;
  estado: Estado;
  enPromocion: SN;
  descuentoPct: number;
  grupoNombre?: string;
}

export interface PlatoCreate extends Omit<Plato, 'id'> {}
export interface PlatoUpdate extends Plato {}

