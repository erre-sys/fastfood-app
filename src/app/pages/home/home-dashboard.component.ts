import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Square, List, ShoppingBag, CalendarClock, DollarSign } from 'lucide-angular';

import { GrupoIngredienteService } from '../../services/grupo-ingrediente.service';
import { IngredienteService } from '../../services/ingrediente.service';
import { PedidoService } from '../../services/pedido.service';
import { HomeCardComponent } from '../../shared/ui/home-card/home-card.component';
import { Pedido, EstadoPedido } from '../../interfaces/pedido.interface';
import { NotifyService } from '../../core/notify/notify.service';
import { HasRoleDirective } from '../../core/auth/has-role.directive';
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
  // ---- Servicios reales disponibles ----
  private gruposApi = inject(GrupoIngredienteService);
  private ingredientesApi = inject(IngredienteService);
  private pedidosApi = inject(PedidoService);
  private router = inject(Router);
  private notify = inject(NotifyService);

  // ---- Estado reactivo ----
  gruposCount = signal<number>(0);
  ingredientesCount = signal<number>(0);
  pedidosHoyCount = signal<number>(0);
  pedidosHoy = signal<Pedido[]>([]);

  loading = signal(true);

  // ---- Computed signals ----
  ventasDelDia = computed(() => {
    const pedidos = this.pedidosHoy();
    return pedidos
      .filter(p => p.estado === 'E') // Solo pedidos entregados
      .reduce((sum, p) => sum + p.totalNeto, 0);
  });

  pedidosListosCount = computed(() => {
    return this.pedidosHoy().filter(p => p.estado === 'L').length;
  });

  // ---- Iconos ----
  Square = Square;
  List = List;
  ShoppingBag = ShoppingBag;
  CalendarClock = CalendarClock;
  DollarSign = DollarSign;

  // ---- Métodos ----
  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);

    // Grupos de ingredientes
    this.gruposApi.listar().subscribe({
      next: (data: string | any[]) => {
        this.gruposCount.set(data?.length ?? 0);
      },
      error: (err) => {
        console.error('Error al consultar grupos de ingredientes:', err);
        this.notify.handleError(err, 'Error al cargar grupos de ingredientes');
        this.gruposCount.set(0);
      },
    });

    // Ingredientes
    this.ingredientesApi.listar().subscribe({
      next: (data) => {
        this.ingredientesCount.set(data?.length ?? 0);
      },
      error: (err) => {
        console.error('Error al consultar ingredientes:', err);
        this.notify.handleError(err, 'Error al cargar ingredientes');
        this.ingredientesCount.set(0);
      },
    });

    // Pedidos del día
    this.cargarPedidosDelDia();
  }

  cargarPedidosDelDia(): void {
    // Obtener fecha de hoy en zona horaria de Ecuador (UTC-5)
    const fechaHoy = getTodayDateStringECT();

    // Convertir a formato DateTime del backend (inicio y fin del día)
    const fechaInicio = dateToBackendDateTimeStart(fechaHoy);
    const fechaFin = dateToBackendDateTimeEnd(fechaHoy);

    console.log('Rango de fechas (ECT):', fechaInicio, 'a', fechaFin);

    // Filtros para pedidos creados hoy (rango de fechas)
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
}
