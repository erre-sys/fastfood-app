import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { Pager } from '../interfaces/pagination.interface';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/inventario`;

  /**
   * Método 1: Buscar inventario (stock) paginado con filtro opcional por texto y bajo mínimo
   * POST /inventario/search
   * @param pager - Paginación y ordenamiento
   * @param q - Filtro de búsqueda por texto (opcional)
   * @param soloBajoMinimo - Mostrar solo items bajo stock mínimo (default: false)
   */
  buscarInventarioPaginado(
    pager: Pager,
    q?: string,
    soloBajoMinimo: boolean = false
  ): Observable<{
    contenido?: any[];
    totalRegistros?: number;
    content?: any[];
    totalElements?: number;
  }> {
    let params = new HttpParams({
      fromObject: {
        page: String(pager.page ?? 0),
        size: String(pager.size ?? 10),
        sortBy: pager.sortBy || 'nombre',
        direction: pager.direction || 'asc',
        soloBajoMinimo: String(soloBajoMinimo),
      },
    });

    if (q && q.trim()) {
      params = params.set('q', q.trim());
    }

    return this.http.post<{
      contenido?: any[];
      totalRegistros?: number;
      content?: any[];
      totalElements?: number;
    }>(`${this.base}/search`, {}, { params });
  }

  /**
   * Método 2: Buscar kardex (movimientos) paginado con filtros opcionales
   * POST /inventario/kardex/search
   * @param pager - Paginación y ordenamiento
   * @param ingredienteId - ID del ingrediente (opcional - si no se envía, trae todos)
   * @param desde - Fecha desde en formato ISO-8601 (opcional)
   * @param hasta - Fecha hasta en formato ISO-8601 (opcional)
   * @param tipo - Tipo de movimiento: COMPRA, CONSUMO, AJUSTE (opcional)
   */
  buscarKardexPaginado(
    pager: Pager,
    ingredienteId?: number | null,
    desde?: string,
    hasta?: string,
    tipo?: 'COMPRA' | 'CONSUMO' | 'AJUSTE' | null
  ): Observable<{
    contenido?: any[];
    totalRegistros?: number;
    content?: any[];
    totalElements?: number;
  }> {
    let params = new HttpParams({
      fromObject: {
        page: String(pager.page ?? 0),
        size: String(pager.size ?? 10),
        sortBy: pager.sortBy || 'fecha',
        direction: pager.direction || 'desc',
      },
    });

    // Solo agregar ingredienteId si existe
    if (ingredienteId != null && ingredienteId > 0) {
      params = params.set('ingredienteId', String(ingredienteId));
    }

    if (desde && desde.trim()) {
      params = params.set('desde', desde.trim());
    }

    if (hasta && hasta.trim()) {
      params = params.set('hasta', hasta.trim());
    }

    if (tipo) {
      params = params.set('tipo', tipo);
    }

    return this.http.post<{
      contenido?: any[];
      totalRegistros?: number;
      content?: any[];
      totalElements?: number;
    }>(`${this.base}/kardex/search`, {}, { params });
  }
}
