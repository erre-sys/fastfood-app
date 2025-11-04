import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environments.development';
import { withSuccess } from '../core/interceptors/toast-context';
import { Filtro, Pager } from '../interfaces/pagination.interface';
import { PromoProgramada, PromoProgramadaCreate, PromoProgramadaUpdate, Estado } from '../interfaces/promo-programada.interface';

@Injectable({ providedIn: 'root' })
export class PromoProgramadaService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/promos`;

  private pickId(r: any): number {
    for (const k of ['id', 'promoId', 'promo_id']) {
      const v = r?.[k];
      if (v !== null && v !== undefined && !Number.isNaN(Number(v)))
        return Number(v);
    }
    return -1;
  }

  public normalize = (r: any): PromoProgramada => ({
    id: this.pickId(r),
    platoId: r?.platoId ?? r?.plato_id ?? -1,
    fechaInicio: r?.fechaInicio ?? r?.fecha_inicio ?? '',
    fechaFin: r?.fechaFin ?? r?.fecha_fin ?? '',
    descuentoPct: Number(r?.descuentoPct ?? r?.descuento_pct ?? 0),
    estado: (r?.estado ?? 'A') as Estado,
    platoNombre: r?.platoNombre ?? r?.plato_nombre ?? undefined,
  });

  // ---- CRUD ----
  listar(): Observable<PromoProgramada[]> {
    return this.http
      .get<any[]>(this.base)
      .pipe(map((arr) => (arr ?? []).map(this.normalize)));
  }

  obtenerVigentes(): Observable<PromoProgramada[]> {
    return this.http
      .get<any[]>(`${this.base}/vigentes`)
      .pipe(map((arr) => (arr ?? []).map(this.normalize)));
  }

  obtener(id: number): Observable<PromoProgramada> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map(this.normalize));
  }

  crear(dto: PromoProgramadaCreate): Observable<void> {
    return this.http.post<void>(this.base, dto, {
      context: withSuccess('Promoción creada correctamente.'),
    });
  }

  actualizar(dto: PromoProgramadaUpdate): Observable<void> {
    return this.http.put<void>(this.base, dto, {
      context: withSuccess('Promoción actualizada correctamente.'),
    });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`, {
      context: withSuccess('Promoción eliminada correctamente.'),
    });
  }

  buscarPaginado(pager: Pager, filtros: Filtro[]) {
    const params = new HttpParams({
      fromObject: {
        page: String(pager.page ?? 0),
        size: String(pager.size ?? 10),
        orderBy: pager.orderBy || 'id',
        direction: pager.direction || 'asc',
      },
    });

    return this.http.post<{
      contenido?: any[];
      totalRegistros?: number;
      content?: any[];
      totalElements?: number;
    }>(`${this.base}/search`, filtros ?? [], { params });
  }
}
