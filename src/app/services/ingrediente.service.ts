import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { withSuccess } from '../core/interceptors/toast-context';
import { Ingrediente, IngredienteCreate, IngredienteUpdate, Estado, SN } from '../interfaces/ingrediente.interface';
import { Filtro, Pager } from '../interfaces/pagination.interface';

@Injectable({ providedIn: 'root' })
export class IngredienteService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/ingredientes`;

  private pickId(r: any): number {
    for (const k of ['id', 'ingredienteId', 'ingrediente_id']) {
      const v = r?.[k];
      if (v !== null && v !== undefined && !Number.isNaN(Number(v)))
        return Number(v);
    }
    return -1;
  }

  public normalize = (r: any): Ingrediente => ({
    id: this.pickId(r),
    codigo: r?.codigo ?? '',
    nombre: r?.nombre ?? '',
    grupoIngredienteId:r?.grupoIngredienteId ?? r?.grupo_ingrediente_id ?? -1,
    unidad: r?.unidad ?? null,
    esExtra: (r?.esExtra ?? r?.es_extra ?? 'N') as SN,
    aplicaComida: (r?.aplicaComida ?? r?.aplica_comida ?? 'N') as SN,
    precioExtra: r?.precioExtra ?? r?.precio_extra ?? null,
    stockMinimo: r?.stockMinimo ?? r?.stock_minimo ?? null,
    estado: (r?.estado ?? 'A') as Estado,
  });

  // ---- CRUD ----
  listar(): Observable<Ingrediente[]> {
    return this.http
      .get<any[]>(this.base).pipe(map((arr) => (arr ?? []).map(this.normalize)));
  }

  obtener(id: number): Observable<Ingrediente> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map(this.normalize));
  }

  crear(dto: IngredienteCreate) {
    return this.http.post<void>(this.base, dto, {
      context: withSuccess('Creado correctamente.'),
    });
  }

  actualizar(dto: IngredienteUpdate): Observable<void> {
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
        sortBy: pager.sortBy || 'id',
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
