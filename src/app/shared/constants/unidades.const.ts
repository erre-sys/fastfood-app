/**
 * Constantes para las unidades de medida de ingredientes
 * Centraliza los mapeos de códigos a nombres completos
 */

export const UNIDAD_MAP: Record<string, string> = {
  'PORC': 'Porcentaje',
  'G': 'Gramos',
  'LT': 'Litros',
  'UND': 'Unidad',
  'KG': 'Kilogramos',
  'PACK': 'Paquete',
  'ML': 'Mililitros'
};

/**
 * Obtiene el nombre completo de una unidad a partir de su código
 * @param codigo - Código de la unidad (ej: 'G', 'KG', 'LT')
 * @returns Nombre completo de la unidad o el código original si no se encuentra
 */
export function getNombreUnidad(codigo: string): string {
  return UNIDAD_MAP[codigo] || codigo || '—';
}
