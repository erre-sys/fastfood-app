import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments.development';
import { withSuccess } from '../core/interceptors/toast-context';
import { PagoProveedor, PagoProveedorCreate } from '../interfaces/pago-proveedor.interface';
import { Filtro, Pager } from '../interfaces/pagination.interface';


@Injectable({ providedIn: 'root' })
export class PagosProveedorService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/pagos-proveedor`;

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

  obtenerPorId(id: number): Observable<PagoProveedor> {
      return this.http.get<any>(`${this.base}/${id}`);
    }

  crear(dto: PagoProveedorCreate) {
    return this.http.post<void>(this.base, dto, {
        context: withSuccess('Creado correctamente.'),
      });
  }
}
