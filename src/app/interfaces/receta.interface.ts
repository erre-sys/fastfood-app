export interface RecetaItem {
  platoId: number;
  ingredienteId: number;
  cantidad: number;
  ingredienteNombre?: string;
  ingredienteCodigo?: string;
}

/**
 * DTO para guardar/actualizar receta completa
 * PUT /platos/{platoId}/receta
 * Reemplaza completamente la receta anterior
 */
export interface RecetaItemDTO {
  ingredienteId: number;
  cantidad: number; // Mínimo 0.0001, escala 3 decimales
}
