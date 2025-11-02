import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { Pager } from '../interfaces/pagination.interface';
import { CompraCreate } from '../interfaces/compra.interface';
import { withSuccess } from '../core/interceptors/toast-context';


@Injectable({ providedIn: 'root' })
export class CompraService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/compras`;

  /**
   * Listar todas las compras (sin paginación)
   */
  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.base);
  }

  /**
   * Buscar compras con paginación
   */
  buscarPaginado(pager: Pager, filtros: any[] = []): Observable<{
    contenido?: any[];
    totalRegistros?: number;
    content?: any[];
    totalElements?: number;
  }> {
    const params = new HttpParams({
      fromObject: {
        page: String(pager.page ?? 0),
        size: String(pager.size ?? 10),
        orderBy: pager.orderBy || 'fecha',
        direction: pager.direction || 'desc',
      },
    });

    return this.http.post<{
      contenido?: any[];
      totalRegistros?: number;
      content?: any[];
      totalElements?: number;
    }>(`${this.base}/search`, filtros, { params });
  }

  /**
   * Obtener una compra por ID
   */
  obtener(id: number): Observable<any> {
    return this.http.get<any>(`${this.base}/${id}`);
  }

  /**
   * Crear una nueva compra con sus items
   */
  crear(dto: CompraCreate): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.base, dto, {
      context: withSuccess('Compra creada correctamente.'),
    });
  }
}
