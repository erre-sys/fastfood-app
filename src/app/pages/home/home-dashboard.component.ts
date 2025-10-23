import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { NgIf, NgFor, DatePipe, DecimalPipe, CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Square, List, ShoppingBag, CalendarClock, DollarSign } from 'lucide-angular';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { GrupoIngredienteService } from '../../services/grupo-ingrediente.service';
import { IngredienteService } from '../../services/ingrediente.service';
import { PedidoService } from '../../services/pedido.service';
import { HomeCardComponent } from '../../shared/ui/home-card/home-card.component';
import { Pedido } from '../../interfaces/pedido.interface';


@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    CommonModule,
    RouterLink,
    DatePipe,
    DecimalPipe,
    LucideAngularModule,
    HomeCardComponent,
  ],
  templateUrl: './home-dashboard.component.html',
})
export default class HomeDashboardComponent implements OnInit {
  // ---- Servicios reales disponibles ----
  private gruposApi = inject(GrupoIngredienteService);
  private ingredientesApi = inject(IngredienteService);
  private pedidosApi = inject(PedidoService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

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
    console.log('🏠 [HOME] Cargando datos del dashboard');
    this.loading.set(true);

    // Grupos de ingredientes
    this.gruposApi.listar().subscribe({
      next: (data: string | any[]) => {
        console.log('✅ [HOME] Grupos de ingredientes:', data?.length ?? 0);
        this.gruposCount.set(data?.length ?? 0);
      },
      error: (err) => {
        console.error('❌ [HOME] Error al cargar grupos:', err);
        this.gruposCount.set(0);
      },
    });

    // Ingredientes
    this.ingredientesApi.listar().subscribe({
      next: (data) => {
        console.log('✅ [HOME] Ingredientes:', data?.length ?? 0);
        this.ingredientesCount.set(data?.length ?? 0);
      },
      error: (err) => {
        console.error('❌ [HOME] Error al cargar ingredientes:', err);
        this.ingredientesCount.set(0);
      },
    });

    // Pedidos del día
    this.cargarPedidosDelDia();
  }

  cargarPedidosDelDia(): void {
    console.log('📅 [HOME] Cargando pedidos del día');

    // Obtener fecha de hoy - inicio y fin del día
    const hoy = new Date();
    const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
    const finDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);

    // Formato: yyyy-MM-dd HH:mm:ss (como espera el backend)
    const fechaInicio = this.formatDateTimeForBackend(inicioDelDia);
    const fechaFin = this.formatDateTimeForBackend(finDelDia);

    console.log('📅 [HOME] Rango de fechas:', fechaInicio, 'a', fechaFin);

    // Filtros para pedidos creados hoy (rango de fechas)
    const filtros = [
      { llave: 'creadoEn', operacion: '>=', valor: fechaInicio },
      { llave: 'creadoEn', operacion: '<=', valor: fechaFin }
    ];

    const pager = { page: 0, size: 100, sortBy: 'id', direction: 'desc' as 'desc' | 'asc' };

    console.log('🔍 [HOME] Consultando pedidos con filtros:', filtros);

    this.pedidosApi.buscarPaginado(pager, filtros).subscribe({
      next: (response) => {
        console.log('✅ [HOME] Respuesta de pedidos del día:', response);

        const contenido = (response?.contenido ?? []) as any[];
        const pedidos = contenido.map((r: any) => ({
          id: Number(r?.id ?? -1),
          estado: r?.estado ?? 'C',
          totalBruto: Number(r?.totalBruto ?? r?.total_bruto ?? 0),
          totalExtras: Number(r?.totalExtras ?? r?.total_extras ?? 0),
          totalNeto: Number(r?.totalNeto ?? r?.total_neto ?? 0),
          observaciones: r?.observaciones ?? '',
          entregadoPorSub: r?.entregadoPorSub ?? r?.entregado_por_sub ?? '',
          creadoEn: r?.creadoEn ?? r?.creado_en ?? '',
          actualizadoEn: r?.actualizadoEn ?? r?.actualizado_en ?? '',
          entregadoEn: r?.entregadoEn ?? r?.entregado_en ?? '',
        })) as Pedido[];

        console.log('📊 [HOME] Pedidos del día procesados:', pedidos);
        console.log('🔢 [HOME] Total de pedidos hoy:', pedidos.length);

        this.pedidosHoy.set(pedidos);
        this.pedidosHoyCount.set(pedidos.length);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ [HOME] Error al cargar pedidos del día:', err);
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

  /**
   * Formatea una fecha al formato esperado por el backend: yyyy-MM-dd HH:mm:ss
   */
  private formatDateTimeForBackend(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}
