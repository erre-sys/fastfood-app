import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { PagoCliente, PagoClienteCreate } from '../interfaces/pago-cliente.interface';
import { Pager } from '../interfaces/pagination.interface';

@Injectable({
  providedIn: 'root',
})
export class PagoClienteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/pagos-cliente`;

  /**
   * Buscar pagos de clientes con paginación
   */
  buscarPaginado(pager: Pager, filtros: any[] = []): Observable<any> {
    const params = new HttpParams({
      fromObject: {
        page: String(pager.page ?? 0),
        size: String(pager.size ?? 10),
        sortBy: pager.sortBy || 'fecha',
        direction: pager.direction || 'desc',
      },
    });

    return this.http.post(`${this.apiUrl}/search`, filtros, { params });
  }

  /**
   * Obtener un pago por ID
   */
  obtener(id: number): Observable<PagoCliente> {
    return this.http.get<PagoCliente>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear un pago para un pedido
   */
  crearPagoPedido(pedidoId: number, dto: PagoClienteCreate): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.apiUrl}/pedidos/${pedidoId}`, dto);
  }
}
