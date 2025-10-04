import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environments';

export interface GrupoIngrediente {
  grupo_ingrediente_id: number;
  nombre: string;
  estado: 'A' | 'I';
}
export interface GrupoIngredienteCreate {
  nombre: string;
  estado: 'A' | 'I';
}
export interface GrupoIngredienteUpdate extends GrupoIngrediente {}

export interface PagerAndSortDto {
  page?: number; // 0-based
  size?: number;
  sortBy?: string; // 'id' | 'nombre' | 'estado' | 'grupoIngredienteId'
  direction?: 'asc' | 'desc';
}

export interface CriterioBusqueda {
  llave: string;
  operacion: string;
  valor?: any;
  valores?: any[];
}

@Injectable({ providedIn: 'root' })
export class GrupoIngredienteService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/grupo-ingredientes`;

  private pickId(r: any): number {
    const keys = ['grupoIngredienteId', 'id'];
    for (const k of keys) {
      const v = r?.[k];
      if (v !== null && v !== undefined && !Number.isNaN(Number(v))) {
        return Number(v);
      }
    }
    return -1;
  }

  private normalize = (r: any): GrupoIngrediente => ({
    grupo_ingrediente_id: this.pickId(r),
    nombre: r?.nombre ?? '',
    estado: (r?.estado ?? 'A') as 'A' | 'I',
  });

  listar(): Observable<GrupoIngrediente[]> {
    return this.http
      .get<any[]>(this.base)
      .pipe(map((arr) => (arr ?? []).map(this.normalize)));
  }

  obtener(id: number): Observable<GrupoIngrediente> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map(this.normalize));
  }

  crear(dto: GrupoIngredienteCreate): Observable<void> {
    return this.http.post<void>(this.base, dto);
  }

  actualizar(dto: GrupoIngredienteUpdate): Observable<void> {
    const body = {
      id: dto.grupo_ingrediente_id,
      nombre: dto.nombre,
      estado: dto.estado,
    };
    return this.http.put<void>(this.base, body);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  private mapSortKeyForApi(k?: string) {
    if (!k) return 'grupoIngredienteId';
    if (k === 'id' || k === 'grupo_ingrediente_id') return 'grupoIngredienteId';
    return k;
  }

  buscarPaginado(
    pager: {
      page: number;
      size: number;
      sortBy: string;
      direction: 'asc' | 'desc';
    },
    filtros: CriterioBusqueda[]
  ) {
    const params = new HttpParams({
      fromObject: {
        page: String(pager.page ?? 0),
        size: String(pager.size ?? 10),
        sortBy: this.mapSortKeyForApi(pager.sortBy),
        direction: pager.direction ?? 'asc',
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
