import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { PedidoService } from '../../../services/pedido.service';
import { PlatoService } from '../../../services/plato.service';
import { IngredienteService } from '../../../services/ingrediente.service';
import { Pedido } from '../../../interfaces/pedido.interface';
import { NotifyService } from '../../../core/notify/notify.service';
import { authService } from '../../../core/auth/auth.service';

import { SectionContainerComponent } from '../../../shared/ui/section-container/section-container.component';
import { DetailHeaderComponent, DetailHeaderField } from '../../../shared/ui/detail-header/detail-header.component';

@Component({
  selector: 'app-pedido-detail',
  standalone: true,
  imports: [CommonModule, SectionContainerComponent, DetailHeaderComponent],
  templateUrl: './pedido-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PedidoDetailPage implements OnInit {
  private api = inject(PedidoService);
  private platosApi = inject(PlatoService);
  private ingredientesApi = inject(IngredienteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private notify = inject(NotifyService);

  loading = false;
  pedido: Pedido | null = null;
  platoNombre: Map<number, string> = new Map();
  ingredienteNombre: Map<number, string> = new Map();
  headerFields: DetailHeaderField[] = [];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadData(id);
    }
  }

  private loadData(id: number): void {
    this.loading = true;
    this.cdr.markForCheck();

    forkJoin({
      platos: this.platosApi.listar(),
      ingredientes: this.ingredientesApi.listar(),
    }).subscribe({
      next: ({ platos, ingredientes }) => {
        this.platoNombre = new Map(
          (platos ?? []).map((p: any) => [Number(p?.id ?? p?.platoId), p?.nombre ?? ''])
        );
        this.ingredienteNombre = new Map(
          (ingredientes ?? []).map((ing: any) => [Number(ing?.id ?? ing?.ingredienteId), ing?.nombre ?? ''])
        );

        this.loadPedido(id);
      },
      error: (err) => {
        console.error('Error al cargar datos de platos/ingredientes:', err);
        this.notify.handleError(err, 'Error al cargar datos');
        this.loading = false;
        this.cdr.markForCheck();
        this.router.navigate(['/pedidos']);
      },
    });
  }

  private loadPedido(id: number): void {
    this.api.obtener(id).subscribe({
      next: (r: any) => {
        const items = (r?.items ?? r?.pedidoItems ?? []).map((item: any) => {
          const platoId = Number(item?.platoId ?? item?.plato_id ?? -1);
          const extras = (item?.extras ?? item?.pedidoItemExtras ?? []).map((extra: any) => {
            const ingId = Number(extra?.ingredienteId ?? extra?.ingrediente_id ?? -1);
            return {
              id: Number(extra?.id ?? -1),
              pedidoItemId: Number(extra?.pedidoItemId ?? extra?.pedido_item_id ?? -1),
              ingredienteId: ingId,
              cantidad: Number(extra?.cantidad ?? 0),
              precioExtra: Number(extra?.precioExtra ?? extra?.precio_extra ?? 0),
              ingredienteNombre: this.getIngredienteNombre(ingId),
            };
          });

          return {
            id: Number(item?.id ?? -1),
            pedidoId: Number(item?.pedidoId ?? item?.pedido_id ?? id),
            platoId,
            cantidad: Number(item?.cantidad ?? 0),
            precioUnitario: Number(item?.precioUnitario ?? item?.precio_unitario ?? 0),
            descuentoPct: Number(item?.descuentoPct ?? item?.descuento_pct ?? 0),
            descuentoMonto: Number(item?.descuentoMonto ?? item?.descuento_monto ?? 0),
            subtotal: Number(item?.subtotal ?? 0),
            platoNombre: this.getPlatoNombre(platoId),
            extras,
          };
        });

        this.pedido = {
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
          items,
        };

        // Configurar campos de la cabecera
        this.headerFields = [
          { label: 'Fecha de Creación', value: this.pedido.creadoEn, type: 'date', tone: 'success' },
          { label: 'Estado', value: this.getEstadoLabel(this.pedido.estado), type: 'badge', badgeClass: this.getEstadoBadgeClass(this.pedido.estado) },
        ];

        if (this.pedido.entregadoEn) {
          this.headerFields.push({
            label: 'Fecha de Entrega',
            value: this.pedido.entregadoEn,
            type: 'date',
            tone: 'brand',
          });
        }

        if (this.pedido.entregadoPorSub) {
          this.headerFields.push({
            label: 'Entregado por',
            value: this.pedido.entregadoPorSub,
            tone: 'accent',
          });
        }

        if (this.pedido.observaciones) {
          this.headerFields.push({
            label: 'Observaciones',
            value: this.pedido.observaciones,
            tone: 'info',
          });
        }

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.router.navigate(['/pedidos']);
      },
    });
  }

  private getPlatoNombre(id: number): string {
    return this.platoNombre.get(id) ?? '';
  }

  private getIngredienteNombre(id: number): string {
    return this.ingredienteNombre.get(id) ?? '';
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

  /**
   * Marcar pedido como listo (C -> L) - NO descuenta inventario
   */
  onMarcarListo() {
    if (!this.pedido || this.pedido.estado !== 'C') {
      this.notify.warning('Solo se puede marcar como listo pedidos en estado Creado');
      return;
    }

    if (confirm(`¿Marcar pedido #${this.pedido.id} como Listo?`)) {

      this.api.marcarListo(this.pedido.id).subscribe({
        next: () => {
          this.notify.success(`Pedido #${this.pedido!.id} marcado como Listo`);
          this.loadData(this.pedido!.id);
        },
        error: (err) => {
          console.error('Error al marcar como listo:', err);
          this.notify.handleError(err, 'Error al marcar como listo');
        },
      });
    }
  }

  /**
   * Entregar pedido (L -> E) - SÍ descuenta inventario, valida stock
   */
  onEntregar() {
    if (!this.pedido || this.pedido.estado !== 'L') {
      this.notify.warning('Solo se puede entregar pedidos que estén Listos');
      return;
    }

    if (confirm(`¿Entregar pedido #${this.pedido.id}? Esto descontará el inventario.`)) {
      const userSub = authService.getSub();

      if (!userSub) {
        this.notify.error('No se pudo obtener el usuario autenticado');
        return;
      }

      this.api.entregar(this.pedido.id, userSub).subscribe({
        next: () => {
          this.notify.success(`Pedido #${this.pedido!.id} entregado correctamente`);
          this.loadData(this.pedido!.id);
        },
        error: (err) => {
          this.notify.handleError(err, 'Error al entregar pedido');
        },
      });
    }
  }

  /**
   * Anular pedido (C o L -> A)
   */
  onAnular() {
    if (!this.pedido || (this.pedido.estado === 'E' || this.pedido.estado === 'A')) {
      this.notify.warning('No se pueden anular pedidos Entregados o ya Anulados');
      return;
    }

    if (confirm(`¿ANULAR pedido #${this.pedido.id}? Esta acción no se puede deshacer.`)) {
      this.api.anular(this.pedido.id).subscribe({
        next: () => {
          this.notify.success(`Pedido #${this.pedido!.id} anulado`);
          this.loadData(this.pedido!.id);
        },
        error: (err) => {
          console.error('Error al anular pedido:', err);
          this.notify.handleError(err, 'Error al anular pedido');
        },
      });
    }
  }

  calcularSubtotalItem(item: any): number {
    const precioBase = (item.precioUnitario || 0) * (item.cantidad || 0);
    const precioExtras = (item.extras || []).reduce((sum: number, extra: any) => {
      return sum + ((extra.precioExtra || 0) * (extra.cantidad || 0) * (item.cantidad || 0));
    }, 0);
    return precioBase + precioExtras;
  }

  calcularTotalExtrasItem(item: any): number {
    return (item.extras || []).reduce((sum: number, extra: any) => {
      return sum + ((extra.precioExtra || 0) * (extra.cantidad || 0) * (item.cantidad || 0));
    }, 0);
  }

  goBack(): void {
    this.router.navigate(['/pedidos']);
  }
}
