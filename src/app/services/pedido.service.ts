import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pager } from '../interfaces/pagination.interface';
import { environment } from '../../environments/environments';
import { Pedido, PedidoCreate, PedidoItemCreate, PedidoItemExtraCreate } from '../interfaces/pedido.interface';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/pedidos`;

  /**
   * Listar todos los pedidos
   */
  listar(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }

  /**
   * Buscar pedidos con paginación
   */
  buscarPaginado(pager: Pager, filtros: any[] = []): Observable<any> {
    const params = new HttpParams({
      fromObject: {
        page: String(pager.page ?? 0),
        size: String(pager.size ?? 10),
        sortBy: pager.sortBy || 'id',
        direction: pager.direction || 'desc',
      },
    });

    return this.http.post(`${this.apiUrl}/search`, filtros, { params });
  }

  /**
   * Crear un nuevo pedido (estado inicial C, opcionalmente con items)
   */
  crear(dto: PedidoCreate): Observable<{ id: number }> {
    console.log('📤 [PEDIDO-SERVICE] Creando pedido:', dto);
    return this.http.post<{ id: number }>(this.apiUrl, dto);
  }

  /**
   * Obtener un pedido por ID
   */
  obtener(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
  }

  /**
   * Agregar items al pedido (solo en estado C)
   */
  agregarItems(pedidoId: number, items: PedidoItemCreate[]): Observable<any> {
    console.log('📤 [PEDIDO-SERVICE] Agregando items al pedido:', { pedidoId, items });
    return this.http.post(`${this.apiUrl}/${pedidoId}/items`, items);
  }

  /**
   * Marcar como listo (C -> L) - NO descuenta inventario
   */
  marcarListo(pedidoId: number): Observable<any> {
    console.log('[PEDIDO-SERVICE] Marcando pedido como listo:', pedidoId);
    return this.http.post(`${this.apiUrl}/${pedidoId}/marcar-listo`, {});
  }

  /**
   * Entregar pedido (L -> E) - SÍ descuenta inventario, valida stock
   */
  entregar(pedidoId: number): Observable<any> {
    console.log(' [PEDIDO-SERVICE] Entregando pedido:', pedidoId);
    return this.http.post(`${this.apiUrl}/${pedidoId}/entregar`, {});
  }

  /**
   * Anular pedido (C o L -> A)
   */
  anular(pedidoId: number): Observable<any> {
    console.log('[PEDIDO-SERVICE] Anulando pedido:', pedidoId);
    return this.http.post(`${this.apiUrl}/${pedidoId}/anular`, {});
  }

  /**
   * Agregar extras a un item del pedido (solo en estado C)
   */
  agregarExtras(pedidoId: number, itemId: number, extras: PedidoItemExtraCreate[]): Observable<any> {
    console.log('[PEDIDO-SERVICE] Agregando extras al item:', { pedidoId, itemId, extras });
    return this.http.post(`${this.apiUrl}/${pedidoId}/items/${itemId}/extras`, extras);
  }

  /**
   * Eliminar extras de un item
   */
  eliminarExtrasItem(pedidoId: number, itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${pedidoId}/items/${itemId}/extras`);
  }

  /**
   * Eliminar un extra específico del pedido
   */
  eliminarExtra(pedidoId: number, extraId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${pedidoId}/extras/${extraId}`);
  }
}
