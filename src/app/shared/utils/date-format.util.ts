/**
 * Convierte datetime-local de HTML5 a LocalDateTime de Java
 * @param dateTimeLocal - Fecha en formato "2025-10-24T19:30" (input type="datetime-local")
 * @returns Fecha en formato "2025-10-24 19:30:00" (LocalDateTime)
 * @example
 * formatToBackendDateTime("2025-10-24T19:30") // → "2025-10-24 19:30:00"
 */
export function formatToBackendDateTime(dateTimeLocal: string): string {
  if (!dateTimeLocal) return '';
  return dateTimeLocal.replace('T', ' ') + ':00';
}

/**
 * Convierte LocalDateTime de Java a datetime-local de HTML5
 * @param backendDateTime - Fecha en formato "2025-10-24 19:30:00" (LocalDateTime)
 * @returns Fecha en formato "2025-10-24T19:30" (input type="datetime-local")
 * @example
 * formatFromBackendDateTime("2025-10-24 19:30:00") // → "2025-10-24T19:30"
 */
export function formatFromBackendDateTime(backendDateTime: string): string {
  if (!backendDateTime) return '';
  return backendDateTime.substring(0, 16).replace(' ', 'T');
}

// ============================================================================
// ZONA HORARIA: Ecuador (ECT - UTC-5)
// ============================================================================

/**
 * Obtiene la fecha actual en zona horaria de Ecuador (UTC-5)
 * @returns Date ajustado a zona horaria ECT
 */
export function getTodayECT(): Date {
  const now = new Date();
  // Convertir a UTC-5 (Ecuador)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const ectOffset = -5 * 60 * 60000; // -5 horas en milisegundos
  return new Date(utc + ectOffset);
}

/**
 * Obtiene la fecha de hoy en formato yyyy-MM-dd en zona horaria ECT
 * @returns Fecha en formato "2025-11-01"
 */
export function getTodayDateStringECT(): string {
  const today = getTodayECT();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ============================================================================
// CONVERSIONES PARA FILTROS: Date ↔ LocalDateTime (rangos de búsqueda)
// ============================================================================

/**
 * Convierte fecha simple a LocalDateTime del backend (inicio del día 00:00:00)
 * Útil para filtros "desde" en búsquedas por rango
 * @param date - Fecha en formato "2025-10-24" (input type="date")
 * @returns Fecha en formato "2025-10-24 00:00:00" (LocalDateTime)
 * @example
 * dateToBackendDateTimeStart("2025-10-24") // → "2025-10-24 00:00:00"
 */
export function dateToBackendDateTimeStart(date: string): string {
  if (!date) return '';
  return date + ' 00:00:00';
}

/**
 * Convierte fecha simple a LocalDateTime del backend (fin del día 23:59:59)
 * Útil para filtros "hasta" en búsquedas por rango
 * @param date - Fecha en formato "2025-10-24" (input type="date")
 * @returns Fecha en formato "2025-10-24 23:59:59" (LocalDateTime)
 * @example
 * dateToBackendDateTimeEnd("2025-10-24") // → "2025-10-24 23:59:59"
 */
export function dateToBackendDateTimeEnd(date: string): string {
  if (!date) return '';
  return date + ' 23:59:59';
}

// ============================================================================
// UTILIDADES DE CONVERSIÓN
// ============================================================================

/**
 * Extrae la fecha (sin hora) de un string ISO 8601
 * @param isoDate - Fecha ISO como "2025-10-24T19:30:00.000Z"
 * @returns Fecha en formato "2025-10-24"
 * @example
 * isoToSimpleDate("2025-10-24T19:30:00.000Z") // → "2025-10-24"
 */
export function isoToSimpleDate(isoDate: string): string {
  if (!isoDate) return '';
  return isoDate.split('T')[0];
}
