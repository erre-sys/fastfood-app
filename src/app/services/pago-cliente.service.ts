import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments.development';
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
        orderBy: pager.orderBy || 'fecha',
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
   * Requiere: pedidoId, montoTotal, metodo
   * Opcional: fecha, referencia
   */
  crear(dto: PagoClienteCreate): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.apiUrl, dto);
  }

  /**
   * Obtener todos los pagos de un pedido específico
   */
  obtenerPorPedido(pedidoId: number): Observable<PagoCliente[]> {
    return this.http.get<PagoCliente[]>(`${this.apiUrl}/pedidos/${pedidoId}`);
  }

  /**
   * Cambiar estado del pago
   * @param id - ID del pago
   * @param estado - Nuevo estado: S=Solicitado, P=Pagado, F=Fiado
   */
  cambiarEstado(id: number, estado: 'S' | 'P' | 'F'): Observable<void> {
    const params = new HttpParams().set('estado', estado);
    return this.http.put<void>(`${this.apiUrl}/${id}/cambiar-estado`, null, { params });
  }
}
