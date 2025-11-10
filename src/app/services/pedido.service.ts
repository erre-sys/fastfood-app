import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pager, Filtro } from '../interfaces/pagination.interface';
import { environment } from '../../environments/environments.development';
import { Pedido, PedidoCreate, PedidoItemCreate, PedidoItemExtraCreate } from '../interfaces/pedido.interface';

@Injectable({  providedIn: 'root'})
export class PedidoService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/pedidos`;

  /**
   * Listar todos los pedidos
   */
  listar(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.base);
  }

  /**
   * Buscar pedidos con paginación
   * IMPORTANTE: Solo puedes ordenar por campos simples, NO por items (es una lista)
   * Campos válidos: id, estado, totalBruto, totalExtras, totalNeto, creadoEn, actualizadoEn, entregadoEn
   */
  buscarPaginado(pager: Pager, filtros: Filtro[] = []){
    const params = new HttpParams({
      fromObject: {
        page: String(pager.page ?? 0),
        size: String(pager.size ?? 10),
        orderBy: pager.orderBy || 'id',
        direction: pager.direction || 'desc',
      },
    });

    return this.http.post<{
      contenido?: any[];
      totalRegistros?: number;
      content?: any[];
      totalElements?: number;
    }>(`${this.base}/search`, filtros ?? [], { params });
  }

  /**
   * Crear un nuevo pedido (estado inicial C, opcionalmente con items)
   */
  crear(dto: PedidoCreate): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.base, dto);
  }

  /**
   * Obtener un pedido por ID
   */
  obtener(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.base}/${id}`);
  }

  /**
   * Agregar items al pedido (solo en estado C)
   */
  agregarItems(pedidoId: number, items: PedidoItemCreate[]): Observable<any> {
    return this.http.post(`${this.base}/${pedidoId}/items`, items);
  }

  /**
   * Marcar como listo (C -> L) - NO descuenta inventario
   */
  marcarListo(pedidoId: number): Observable<any> {
    return this.http.post(`${this.base}/${pedidoId}/marcar-listo`, {});
  }

  /**
   * Entregar pedido (L -> E) - SÍ descuenta inventario, valida stock
   * @param pedidoId ID del pedido a entregar
   * @param entregadoPor Nombre o identificador del usuario que entrega
   */
  entregar(pedidoId: number, entregadoPor: string): Observable<any> {
    const params = new HttpParams().set('entregadoPor', entregadoPor);
    return this.http.post(`${this.base}/${pedidoId}/entregar`, {}, { params });
  }

  /**
   * Anular pedido (C o L -> A)
   */
  anular(pedidoId: number): Observable<any> {
    return this.http.post(`${this.base}/${pedidoId}/anular`, {});
  }

  /**
   * Agregar extras a un item del pedido (solo en estado C)
   */
  agregarExtras(pedidoId: number, itemId: number, extras: PedidoItemExtraCreate[]): Observable<any> {
    return this.http.post(`${this.base}/${pedidoId}/items/${itemId}/extras`, extras);
  }

  /**
   * Eliminar extras de un item
   */
  eliminarExtrasItem(pedidoId: number, itemId: number): Observable<any> {
    return this.http.delete(`${this.base}/${pedidoId}/items/${itemId}/extras`);
  }

  /**
   * Eliminar un extra específico del pedido
   */
  eliminarExtra(pedidoId: number, extraId: number): Observable<any> {
    return this.http.delete(`${this.base}/${pedidoId}/extras/${extraId}`);
  }
}
