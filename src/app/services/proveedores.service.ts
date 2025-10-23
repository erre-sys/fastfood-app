import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { Proveedor, ProveedorCreate, PagerAndSort, CriterioBusqueda, Pagina } from '../interfaces/proveedor.interface';

@Injectable({ providedIn: 'root' })
export class ProveedoresService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/proveedores`; 

  listar(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.base);
  }

  obtenerPorId(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.base}/${id}`);
  }

  crear(dto: ProveedorCreate) {
    return this.http.post<void>(this.base, dto);
  }

  actualizar(dto: Proveedor) {
    return this.http.put<void>(this.base, dto);
  }

  eliminar(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  buscarPaginado(pager: PagerAndSort, filters: CriterioBusqueda[]) {
    const params: any = {
      page: pager.page,
      size: pager.size,
      ...(pager.sort ? { sort: pager.sort } : {})
    };
    return this.http.post<Pagina<Proveedor>>(
      `${this.base}/search`,
      filters,
      { params }
    );
  }
}
