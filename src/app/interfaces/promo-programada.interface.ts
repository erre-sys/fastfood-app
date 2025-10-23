export type Estado = 'A' | 'I';

export interface PromoProgramada {
  id: number;
  platoId: number;
  fechaInicio: string; // ISO 8601: 'yyyy-MM-ddTHH:mm:ss'
  fechaFin: string;
  descuentoPct: number;
  estado: Estado;
  platoNombre?: string; // opcional, desde JOIN con platos
}

export interface PromoProgramadaCreate extends Omit<PromoProgramada, 'id' | 'platoNombre'> {}
export interface PromoProgramadaUpdate extends Omit<PromoProgramada, 'platoNombre'> {}
