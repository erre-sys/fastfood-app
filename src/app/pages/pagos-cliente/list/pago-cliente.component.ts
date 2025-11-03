import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { PagoClienteService } from '../../../services/pago-cliente.service';
import { PagoCliente, MetodoPago, EstadoPago } from '../../../interfaces/pago-cliente.interface';
import { BaseListComponent } from '../../../shared/base/base-list.component';
import { dateToBackendDateTimeStart, dateToBackendDateTimeEnd, isoToSimpleDate } from '../../../shared/utils/date-format.util';

import { PageLayoutComponent } from '../../../shared/ui/page-layout/page-layout.component';
import { TitleComponent } from '../../../shared/ui/fields/title/title.component';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { SearchComponent } from '../../../shared/ui/fields/searchbox/search.component';
import { DateRangeComponent } from '../../../shared/ui/fields/date-range/date-range.component';
import { PaginatorComponent } from '../../../shared/ui/paginator/paginator.component';
import { SectionContainerComponent } from '../../../shared/ui/section-container/section-container.component';
import { SummaryComponent } from '../../../shared/ui/summary/summary.component';
import { LucideAngularModule, Eye, Plus, DollarSign, Check, Handshake } from 'lucide-angular';
import { UiButtonComponent } from '../../../shared/ui/buttons/ui-button/ui-button.component';
import { TabsFilterComponent } from '../../../shared/ui/tabs-filter/tabs-filter.component';
import { ColumnDef, TabStatus } from '../../../shared/ui/table/column-def';
import { NotifyService } from '../../../core/notify/notify.service';

@Component({
  selector: 'app-pagos-cliente-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageLayoutComponent,
    TitleComponent,
    TableComponent,
    DateRangeComponent,
    PaginatorComponent,
    SectionContainerComponent,
    SummaryComponent,
    LucideAngularModule,
    UiButtonComponent,
    TabsFilterComponent,
  ],
  templateUrl: './pago-cliente.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PagosClienteListPage extends BaseListComponent implements OnInit {
  private api = inject(PagoClienteService);
  private cdr = inject(ChangeDetectorRef);
  private notify = inject(NotifyService);

  titleLabel = 'Pagos de Clientes';
  subTitleLabel = 'Registro de pagos recibidos';

  // UI
  tab: TabStatus | 'S' | 'P' | 'F' = 'all';
  rows: PagoCliente[] = [];

  // Íconos
  Eye = Eye;
  Plus = Plus;
  DollarSign = DollarSign;
  Check = Check;
  Handshake = Handshake;

  searchForm = new FormGroup({
    q: new FormControl<string>('', { nonNullable: true }),
    fechaDesde: new FormControl<string>('', { nonNullable: true }),
    fechaHasta: new FormControl<string>('', { nonNullable: true }),
  });

  columns: ColumnDef<PagoCliente>[] = [
    { key: 'pedidoId', header: 'Pedido', sortable: true, widthPx: 100 },
    { key: 'fecha', header: 'Fecha', sortable: true, type: 'date', widthPx: 200 },
    { key: 'montoTotal', header: 'Monto', align: 'right', widthPx: 130, type: 'money' },
    { key: 'metodo', header: 'Método', widthPx: 100, align: 'center',
      type: 'badge',
      badgeMap: {
        'EFECTIVO': 'ok',
        'TARJETA': 'warn',
        'TRANSFERENCIA': 'muted',
        'DEPOSITO': 'ok'
      },
      valueMap: {
        'EFECTIVO': 'Efect.',
        'TARJETA': 'Tarj.',
        'TRANSFERENCIA': 'Transf.',
        'DEPOSITO': 'Depós.'
      }
    },
    { key: 'estado', header: 'Estado', widthPx: 110, align: 'center',
      type: 'badge',
      badgeMap: {
        'S': 'warn',    // Solicitado
        'P': 'ok',      // Pagado
        'F': 'muted'    // Fiado
      },
      valueMap: {
        'S': 'Solicit.',
        'P': 'Pagado',
        'F': 'Fiado'
      }
    },
    { key: 'referencia', header: 'Observ.' },
  ];

  counters = {
    all: 0,
    S: undefined as number | undefined, // Solicitado
    P: undefined as number | undefined, // Pagado
    F: undefined as number | undefined, // Fiado
  };

  ngOnInit(): void {
    this.sortKey = 'id';
    this.sortDir = 'desc';

    this.searchForm.controls.q.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroyed$))
      .subscribe(() => {
        this.page = 0;
        this.load();
      });

    // Inicializar rango de fechas: últimos 30 días
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.searchForm.controls.fechaDesde.setValue(this.formatDateForInput(thirtyDaysAgo));
    this.searchForm.controls.fechaHasta.setValue(this.formatDateForInput(today));


    this.load();
  }

  private formatDateForInput(date: Date): string {
      return isoToSimpleDate(date.toISOString());
    }
    
  protected override load(): void {
    this.loading = true;
    this.cdr.markForCheck();

    const filtros: any[] = [];
    if (this.tab === 'S') filtros.push({ llave: 'estado', operacion: '=', valor: 'S' });
    if (this.tab === 'P') filtros.push({ llave: 'estado', operacion: '=', valor: 'P' });
    if (this.tab === 'F') filtros.push({ llave: 'estado', operacion: '=', valor: 'F' });

    const term = this.searchForm.controls.q.value.trim();
    if (term) {
      const n = Number(term);
      if (!Number.isNaN(n)) {
        filtros.push({ llave: 'id', operacion: 'EQ', valor: n });
        filtros.push({ llave: 'pedidoId', operacion: 'EQ', valor: n });
      }
    }

    const fechaDesde = this.searchForm.controls.fechaDesde.value.trim();
    if (fechaDesde) {
      filtros.push({ llave: 'fecha', operacion: '>=', valor: dateToBackendDateTimeStart(fechaDesde) });
    }

    const fechaHasta = this.searchForm.controls.fechaHasta.value.trim();
    if (fechaHasta) {
      filtros.push({ llave: 'fecha', operacion: '<=', valor: dateToBackendDateTimeEnd(fechaHasta) });
    }

    this.api
      .buscarPaginado(
        { page: this.page, size: this.pageSize, orderBy: this.sortKey, direction: this.sortDir },
        filtros
      )
      .subscribe({
        next: (p) => {
          const contenido = (p?.contenido ?? []) as any[];
          this.rows = contenido.map((r) => ({
            id: Number(r?.id ?? -1),
            pedidoId: Number(r?.pedidoId ?? r?.pedido_id ?? -1),
            fecha: r?.fecha ?? '',
            montoTotal: Number(r?.montoTotal ?? r?.monto_total ?? 0),
            metodo: (r?.metodo ?? 'EFECTIVO') as MetodoPago,
            referencia: r?.referencia ?? '',
            estado: (r?.estado ?? 'S') as EstadoPago,
            creadoPorSub: r?.creadoPorSub ?? r?.creado_por_sub ?? '',
          })) as PagoCliente[];

          this.total = Number(p?.totalRegistros ?? this.rows.length);
          this.counters.all = this.total;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.rows = [];
          this.total = 0;
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  // Handlers UI
  setTab(k: TabStatus | 'S' | 'P' | 'F') {
    if (this.tab !== k) {
      this.tab = k;
      this.page = 0;
      this.load();
    }
  }

  onSearch(term: string) {
    this.searchForm.controls.q.setValue(term, { emitEvent: true });
  }

  /**
   * Calcula el total de los montos de pagos mostrados en la tabla
   */
  calcularTotalMostrado(): number {
    return this.rows.reduce((sum, pago) => sum + (pago.montoTotal || 0), 0);
  }

  /**
   * Aprobar pago (S -> P)
   */
  onAprobar(pago: PagoCliente) {
    if (pago.estado !== 'S') {
      this.notify.warning('Solo se pueden aprobar pagos en estado Solicitado');
      return;
    }

    if (confirm(`¿Aprobar pago #${pago.id} por $${pago.montoTotal.toFixed(2)}?`)) {
      this.api.cambiarEstado(pago.id, 'P').subscribe({
        next: () => {
          this.notify.success(`Pago #${pago.id} aprobado (Pagado)`);
          this.load();
        },
        error: (err) => {
          console.error('Error al aprobar pago:', err);
          this.notify.handleError(err, 'Error al aprobar pago');
        },
      });
    }
  }

  /**
   * Marcar como Fiado (S -> F)
   */
  onFiar(pago: PagoCliente) {
    if (pago.estado !== 'S') {
      this.notify.warning('Solo se pueden fiar pagos en estado Solicitado');
      return;
    }

    if (confirm(`¿Marcar pago #${pago.id} como Fiado?`)) {
      this.api.cambiarEstado(pago.id, 'F').subscribe({
        next: () => {
          this.notify.success(`Pago #${pago.id} marcado como Fiado`);
          this.load();
        },
        error: (err) => {
          console.error('Error al fiar pago:', err);
          this.notify.handleError(err, 'Error al marcar como fiado');
        },
      });
    }
  }

  /**
   * Pagar un fiado (F -> P)
   */
  onPagar(pago: PagoCliente) {
    if (pago.estado !== 'F') {
      this.notify.warning('Solo se pueden pagar créditos en estado Fiado');
      return;
    }

    if (confirm(`¿Marcar pago #${pago.id} como Pagado?`)) {
      this.api.cambiarEstado(pago.id, 'P').subscribe({
        next: () => {
          this.notify.success(`Pago #${pago.id} marcado como Pagado`);
          this.load();
        },
        error: (err) => {
          console.error('Error al marcar pago como pagado:', err);
          this.notify.handleError(err, 'Error al marcar como pagado');
        },
      });
    }
  }
}
