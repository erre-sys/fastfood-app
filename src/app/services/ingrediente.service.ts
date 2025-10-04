import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environments';

export type Estado = 'A' | 'I';

export interface Ingrediente {
  ingrediente_id: number;
  codigo: string;
  nombre: string;
  grupo_ingrediente_id: number;
  unidad: string | null;
  es_extra: 'S' | 'N';
  precio_extra: number | null;
  stock_minimo: number | null;
  estado: 'A' | 'I';
}

export interface IngredienteCreate
  extends Omit<Ingrediente, 'ingrediente_id'> {}
export interface IngredienteUpdate extends Ingrediente {}

export interface PagerAndSortDto {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}

export interface CriterioBusqueda {
  llave: string;
  operador: string;
  valor?: any;
  valores?: any[];
}

@Injectable({ providedIn: 'root' })
export class IngredienteService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/ingredientes`;

  private pickId(r: any): number {
    for (const k of ['ingredienteId', 'ingrediente_id', 'id']) {
      const v = r?.[k];
      if (v !== null && v !== undefined && !Number.isNaN(Number(v)))
        return Number(v);
    }
    return -1;
  }

  private normalize = (r: any): Ingrediente => ({
    ingrediente_id: this.pickId(r),
    codigo: r?.codigo ?? '',
    nombre: r?.nombre ?? '',
    grupo_ingrediente_id: Number(
      r?.grupo_ingrediente_id ?? r?.grupoIngredienteId ?? 0
    ),
    unidad: r?.unidad ?? null,
    es_extra: (r?.es_extra ?? r?.esExtra ?? 'N') as 'S' | 'N',
    precio_extra:
      (r?.precio_extra ?? r?.precioExtra ?? null) !== null
        ? Number(r?.precio_extra ?? r?.precioExtra)
        : null,
    stock_minimo:
      (r?.stock_minimo ?? r?.stockMinimo ?? null) !== null
        ? Number(r?.stock_minimo ?? r?.stockMinimo)
        : null,
    estado: (r?.estado ?? 'A') as Estado,
  });

  listar(): Observable<Ingrediente[]> {
    return this.http
      .get<any[]>(this.base)
      .pipe(map((arr) => (arr ?? []).map(this.normalize)));
  }

  obtener(id: number): Observable<Ingrediente> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map(this.normalize));
  }

  crear(dto: IngredienteCreate): Observable<void> {
    const body = {
      codigo: dto.codigo,
      nombre: dto.nombre,
      grupoIngredienteId: dto.grupo_ingrediente_id,
      unidad: dto.unidad,
      esExtra: dto.es_extra ?? 'N',
      precioExtra: dto.es_extra === 'S' ? dto.precio_extra ?? null : null,
      stockMinimo: dto.stock_minimo!,
      estado: dto.estado ?? 'A',
    };
    return this.http.post<void>(this.base, body);
  }

  actualizar(dto: IngredienteUpdate): Observable<void> {
    const body = {
      id: dto.ingrediente_id,
      codigo: dto.codigo,
      nombre: dto.nombre,
      grupoIngredienteId: dto.grupo_ingrediente_id,
      unidad: dto.unidad,
      esExtra: dto.es_extra,
      precioExtra: dto.precio_extra,
      stockMinimo: dto.stock_minimo,
      estado: dto.estado,
    };
    return this.http.put<void>(this.base, body);
  }

  private mapSortKeyForApi(k?: string) {
    if (!k) return 'ingredienteId';
    if (k === 'id' || k === 'ingrediente_id') return 'ingredienteId';
    if (k === 'grupo_ingrediente_id') return 'grupoIngredienteId';
    if (k === 'es_extra') return 'esExtra';
    if (k === 'precio_extra') return 'precioExtra';
    if (k === 'stock_minimo') return 'stockMinimo';
    return k;
  }

  buscarPaginado(pager: PagerAndSortDto, filtros: CriterioBusqueda[]) {
    const params = new HttpParams({
      fromObject: {
        page: String(pager.page ?? 0),
        size: String(pager.size ?? 10),
        sortBy: this.mapSortKeyForApi(pager.sortBy ?? 'ingredienteId'),
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

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
