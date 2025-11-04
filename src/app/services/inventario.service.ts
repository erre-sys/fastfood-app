import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments.development';
import { Pager } from '../interfaces/pagination.interface';
import { AjusteInventario } from '../interfaces/inventario.interface';

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
        orderBy: pager.orderBy || 'ingredienteId',
        direction: pager.direction || 'asc',
      },
    });

    // Solo agregar q si tiene valor
    if (q && q.trim()) {
      params = params.set('q', q.trim());
    }

    // Solo agregar soloBajoMinimo si es true
    if (soloBajoMinimo) {
      params = params.set('soloBajoMinimo', 'true');
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
   * @param ingredienteId - ID del ingrediente (OBLIGATORIO según backend)
   * @param desde - Fecha desde en formato 'yyyy-MM-dd HH:mm:ss' (opcional)
   * @param hasta - Fecha hasta en formato 'yyyy-MM-dd HH:mm:ss' (opcional)
   * @param tipo - Tipo de movimiento: COMPRA, CONSUMO, AJUSTE (opcional)
   */
  buscarKardexPaginado(
    pager: Pager,
    ingredienteId: number,
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
        orderBy: pager.orderBy || 'fecha',
        direction: pager.direction || 'desc',
        ingredienteId: String(ingredienteId), // OBLIGATORIO
      },
    });

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

  /**
   * Método 3: Ajustar inventario manualmente
   * POST /inventario/ajustar
   * @param ajuste - Datos del ajuste (ingredienteId, cantidad, referencia)
   * cantidad positiva = SUMAR stock, cantidad negativa = RESTAR stock
   */
  ajustar(ajuste: AjusteInventario): Observable<void> {
    return this.http.post<void>(`${this.base}/ajustar`, ajuste);
  }
}
