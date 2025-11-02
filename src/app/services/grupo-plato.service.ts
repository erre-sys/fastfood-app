import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environments';
import { withSuccess } from '../core/interceptors/toast-context';
import { GrupoPlato, GrupoPlatoCreate, GrupoPlatoUpdate, Estado } from '../interfaces/grupo-plato.interface';
import { Filtro, Pager } from '../interfaces/pagination.interface';

@Injectable({ providedIn: 'root' })
export class GrupoPlatoService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/grupo-platos`;

  private pickId(r: any): number {
    for (const k of ['id', 'grupoPlatoId', 'grupo_plato_id']) {
      const v = r?.[k];
      if (v !== null && v !== undefined && !Number.isNaN(Number(v))) return Number(v);
    }
    return -1;
  }
  
  private normalize = (r: any): GrupoPlato => ({
    id: this.pickId(r),
    nombre: r?.nombre ?? '',
    estado: (r?.estado ?? 'A') as Estado,
  });

  // ---- CRUD ----
  listar(): Observable<GrupoPlato[]> {
    return this.http.get<any[]>(this.base).pipe(map(arr => (arr ?? []).map(this.normalize)));
  }

  obtener(id: number): Observable<GrupoPlato> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map(this.normalize));
  }

  crear(dto: GrupoPlatoCreate) {
  return this.http.post<void>(this.base, dto, {
    context: withSuccess('Creado correctamente.'),
  });
}

actualizar(dto: GrupoPlatoUpdate) {
  return this.http.put<void>(this.base, dto, {
    context: withSuccess('Actualizado correctamente.'),
  });
}

eliminar(id: number) {
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
export type { GrupoPlato };