import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { PagoClienteService } from '../../../services/pago-cliente.service';
import { PagoCliente } from '../../../interfaces/pago-cliente.interface';

import { SectionContainerComponent } from '../../../shared/ui/section-container/section-container.component';
import { DetailHeaderComponent, DetailHeaderField } from '../../../shared/ui/detail-header/detail-header.component';

@Component({
  selector: 'app-pago-cliente-detail',
  standalone: true,
  imports: [CommonModule, SectionContainerComponent, DetailHeaderComponent],
  templateUrl: './pago-cliente-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PagoClienteDetailPage implements OnInit {
  private api = inject(PagoClienteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  loading = false;
  pago: PagoCliente | null = null;
  headerFields: DetailHeaderField[] = [];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadPago(id);
    }
  }

  private loadPago(id: number): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.api.obtener(id).subscribe({
      next: (r: any) => {
        this.pago = {
          id: Number(r?.id ?? -1),
          pedidoId: Number(r?.pedidoId ?? r?.pedido_id ?? -1),
          fecha: r?.fecha ?? '',
          montoTotal: Number(r?.montoTotal ?? r?.monto_total ?? 0),
          metodo: (r?.metodo ?? 'efectivo') as 'efectivo' | 'transferencia',
          referencia: r?.referencia ?? '',
          estado: (r?.estado ?? 'pendiente') as 'pendiente' | 'pagado' | 'anulado' | 'fiado',
          creadoPorSub: r?.creadoPorSub ?? r?.creado_por_sub ?? '',
        };

        // Configurar campos de la cabecera
        this.headerFields = [
          { label: 'Pedido', value: `#${this.pago.pedidoId}`, tone: 'brand' },
          { label: 'Fecha', value: this.pago.fecha, type: 'date', tone: 'success' },
          { label: 'Monto Total', value: this.pago.montoTotal, type: 'currency', tone: 'accent' },
          { label: 'Método de Pago', value: this.getMetodoLabel(this.pago.metodo), tone: 'info' },
          { label: 'Estado', value: this.getEstadoLabel(this.pago.estado!), type: 'badge', badgeClass: this.getEstadoBadgeClass(this.pago.estado!) },
        ];

        if (this.pago.referencia) {
          this.headerFields.push({
            label: 'Referencia',
            value: this.pago.referencia,
            tone: 'warn',
          });
        }

        if (this.pago.creadoPorSub) {
          this.headerFields.push({
            label: 'Creado por',
            value: this.pago.creadoPorSub,
            tone: 'info',
          });
        }

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.router.navigate(['/pagos-cliente']);
      },
    });
  }

  getMetodoLabel(metodo: string): string {
    const map: Record<string, string> = {
      efectivo: 'Efectivo',
      transferencia: 'Transferencia',
    };
    return map[metodo] || metodo;
  }

  getEstadoLabel(estado: string): string {
    const map: Record<string, string> = {
      pendiente: 'Pendiente',
      pagado: 'Pagado',
      anulado: 'Anulado',
      fiado: 'Fiado',
    };
    return map[estado] || estado;
  }

  getEstadoBadgeClass(estado: string): string {
    const map: Record<string, string> = {
      pendiente: 'pill--warning',
      pagado: 'pill--success',
      anulado: 'pill--danger',
      fiado: 'pill--muted',
    };
    return map[estado] || 'pill--muted';
  }

  goBack(): void {
    this.router.navigate(['/pagos-cliente']);
  }
}
