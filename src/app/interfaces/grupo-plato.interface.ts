
export type Estado = 'A' | 'I';

export interface GrupoPlato {
  id: number;
  nombre: string;
  estado: Estado;
}

export interface GrupoPlatoCreate {
  nombre: string;
  estado: Estado;
}

export interface GrupoPlatoUpdate extends GrupoPlato {}