import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments.development';
import { RecetaItem, RecetaItemDTO } from '../interfaces/receta.interface';

@Injectable({
  providedIn: 'root',
})
export class RecetaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/platos`;

  /**
   * Obtener la receta de un plato
   * GET /platos/{platoId}/receta
   */
  obtenerReceta(platoId: number): Observable<RecetaItem[]> {
    return this.http.get<RecetaItem[]>(`${this.apiUrl}/${platoId}/receta`);
  }

  /**
   * Guardar/Actualizar la receta completa de un plato
   * PUT /platos/{platoId}/receta
   *
   * Este endpoint REEMPLAZA completamente la receta anterior.
   * Para "eliminar" un ingrediente, simplemente no lo incluyas en el array.
   *
   * Validaciones del backend:
   * - El plato debe existir y estar activo (estado = 'A')
   * - Cada ingrediente debe existir y estar activo
   * - Cada ingrediente debe aplicar para comida (aplicaComida = 'S')
   * - No puede haber ingredientes duplicados
   * - Todas las cantidades deben ser > 0 (mínimo 0.0001, escala 3 decimales)
   */
  guardarReceta(platoId: number, items: RecetaItemDTO[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/${platoId}/receta`, items);
  }
}
