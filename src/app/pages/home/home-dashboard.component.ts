import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Square, List, ShoppingBag, CalendarClock, DollarSign, Package, TrendingUp, AlertCircle } from 'lucide-angular';

import { PedidoService } from '../../services/pedido.service';
import { InventarioService } from '../../services/inventario.service';
import { HomeCardComponent } from '../../shared/ui/home-card/home-card.component';
import { Pedido, EstadoPedido } from '../../interfaces/pedido.interface';
import { NotifyService } from '../../core/notify/notify.service';
import { HasRoleDirective } from '../../core/auth/has-role.directive';
import { PermissionService } from '../../core/auth/roles.config';
import { getTodayDateStringECT, dateToBackendDateTimeStart, dateToBackendDateTimeEnd } from '../../shared/utils/date-format.util';


@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [
    NgIf, NgFor, CommonModule, DatePipe,
    LucideAngularModule, HomeCardComponent, HasRoleDirective,
  ],
  templateUrl: './home-dashboard.component.html',
})
export default class HomeDashboardComponent implements OnInit {
  private pedidosApi = inject(PedidoService);
  private inventarioApi = inject(InventarioService);
  private router = inject(Router);
  private notify = inject(NotifyService);

  // ---- Estado reactivo ----
  pedidosHoyCount = signal<number>(0);
  pedidosHoy = signal<Pedido[]>([]);
  stockBajo = signal<number>(0);
  loading = signal(true);

  // ---- Computed signals ----
  ventasDelDia = computed(() => {
    const pedidos = this.pedidosHoy();
    return pedidos
      .filter(p => p.estado === 'E') // Solo pedidos entregados
      .reduce((sum, p) => sum + p.totalNeto, 0);
  });

  pedidosPendientes = computed(() => {
    return this.pedidosHoy().filter(p => p.estado === 'C').length;
  });

  pedidosListosCount = computed(() => {
    return this.pedidosHoy().filter(p => p.estado === 'L').length;
  });

  pedidosEntregados = computed(() => {
    return this.pedidosHoy().filter(p => p.estado === 'E').length;
  });

  // ---- Iconos ----
  Square = Square;
  List = List;
  ShoppingBag = ShoppingBag;
  CalendarClock = CalendarClock;
  DollarSign = DollarSign;
  Package = Package;
  TrendingUp = TrendingUp;
  AlertCircle = AlertCircle;

  // ---- Permisos ----
  PermissionService = PermissionService;

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);

    // Cargar pedidos del día (todos los roles)
    this.cargarPedidosDelDia();

    // Cargar stock bajo (solo si puede ver inventario)
    if (PermissionService.can('INVENTARIO', 'VER_STOCK')) {
      this.cargarStockBajo();
    }
  }

  cargarPedidosDelDia(): void {
    const fechaHoy = getTodayDateStringECT();
    const fechaInicio = dateToBackendDateTimeStart(fechaHoy);
    const fechaFin = dateToBackendDateTimeEnd(fechaHoy);

    const filtros = [
      { llave: 'creadoEn', operacion: '>=' as const, valor: fechaInicio },
      { llave: 'creadoEn', operacion: '<=' as const, valor: fechaFin }
    ];

    const pager = { page: 0, size: 100, orderBy: 'id', direction: 'desc' as 'desc' | 'asc' };

    this.pedidosApi.buscarPaginado(pager, filtros).subscribe({
      next: (response) => {
        const contenido = (response?.contenido ?? []) as any[];
        const pedidos = contenido.map((r: any) => ({
          id: Number(r?.id ?? -1),
          estado: (r?.estado ?? 'C') as EstadoPedido,
          totalBruto: Number(r?.totalBruto ?? r?.total_bruto ?? 0),
          totalExtras: Number(r?.totalExtras ?? r?.total_extras ?? 0),
          totalNeto: Number(r?.totalNeto ?? r?.total_neto ?? 0),
          observaciones: r?.observaciones ?? '',
          entregadoPorSub: r?.entregadoPorSub ?? r?.entregado_por_sub ?? '',
          creadoEn: r?.creadoEn ?? r?.creado_en ?? '',
          actualizadoEn: r?.actualizadoEn ?? r?.actualizado_en ?? '',
          entregadoEn: r?.entregadoEn ?? r?.entregado_en ?? '',
        })) as Pedido[];

        this.pedidosHoy.set(pedidos);
        this.pedidosHoyCount.set(pedidos.length);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al consultar pedidos del día:', err);
        this.notify.handleError(err, 'Error al cargar pedidos del día');
        this.pedidosHoy.set([]);
        this.pedidosHoyCount.set(0);
        this.loading.set(false);
      },
    });
  }

  cargarStockBajo(): void {
    // Buscar ingredientes con stock bajo usando el flag soloBajoMinimo
    const pager = { page: 0, size: 100, orderBy: 'stockActual', direction: 'asc' as 'asc' | 'desc' };

    this.inventarioApi.buscarInventarioPaginado(pager, undefined, true).subscribe({
      next: (response: any) => {
        this.stockBajo.set(response?.totalRegistros ?? response?.totalElements ?? 0);
      },
      error: (err: any) => {
        console.error('Error al consultar stock bajo:', err);
        this.stockBajo.set(0);
      },
    });
  }

  contarPorEstado(estado: string): number {
    return this.pedidosHoy().filter(p => p.estado === estado).length;
  }

  getEstadoLabel(estado: string): string {
    const map: Record<string, string> = {
      C: 'Creado',
      L: 'Listo',
      E: 'Entregado',
      A: 'Anulado',
    };
    return map[estado] || estado;
  }

  getEstadoBadgeClass(estado: string): string {
    const map: Record<string, string> = {
      C: 'pill--warning',
      L: 'pill--muted',
      E: 'pill--success',
      A: 'pill--danger',
    };
    return map[estado] || 'pill--muted';
  }

  now(): Date {
    return new Date();
  }

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }

  getUserRole(): string {
    if (PermissionService.isAdmin()) return 'Administrador';
    if (PermissionService.isCajero()) return 'Cajero';
    if (PermissionService.isVendedor()) return 'Vendedor';
    return 'Usuario';
  }
}
