export interface GrupoIngrediente {
  grupo_ingrediente_id: number;
  nombre: string;
  estado: 'A' | 'I';
}

// payloads para no repetir modelos:
export type GrupoIngredienteCreate = Omit<GrupoIngrediente, 'grupo_ingrediente_id'>;
export type GrupoIngredienteUpdate = GrupoIngrediente;
