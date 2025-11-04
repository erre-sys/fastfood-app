import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environments.development';
import { withSuccess } from '../core/interceptors/toast-context';
import { Filtro, Pager } from '../interfaces/pagination.interface';
import { Plato, PlatoCreate, PlatoUpdate, SN, Estado } from '../interfaces/plato.interface';


@Injectable({ providedIn: 'root' })
export class PlatoService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/platos`;

  private pickId(r: any): number {
    for (const k of ['id', 'platoId', 'plato_id']) {
      const v = r?.[k];
      if (v !== null && v !== undefined && !Number.isNaN(Number(v)))
        return Number(v);
    }
    return -1;
  }

  public normalize = (r: any): Plato => ({
    id: this.pickId(r),
    codigo: r?.codigo ?? '',
    nombre: r?.nombre ?? '',
    grupoPlatoId:r?.grupoPlatoId ?? r?.grupo_plato_id ?? -1,
    precioBase: r?.precioBase ?? r?.precio_base ?? 0,
    enPromocion: (r?.enPromocion ?? r?.en_promocion ?? 'N') as SN,
    descuentoPct: (r?.descuentoPct ?? r?.descuento_pct ?? 0) as number,
    estado: (r?.estado ?? 'A') as Estado,
  });

  // ---- CRUD ----
  listar(): Observable<Plato[]> {
    return this.http
      .get<any[]>(this.base).pipe(map((arr) => (arr ?? []).map(this.normalize)));
  }

  obtener(id: number): Observable<Plato> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map(this.normalize));
  }

  crear(dto: PlatoCreate) {
    return this.http.post<void>(this.base, dto, {
      context: withSuccess('Creado correctamente.'),
    });
  }

  actualizar(dto: PlatoUpdate): Observable<void> {
     return this.http.put<void>(this.base, dto, {
       context: withSuccess('Actualizado correctamente.'),
     });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`, {
    context: withSuccess('Eliminado correctamente.'),
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
