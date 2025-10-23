import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

import { PedidoService } from '../../../services/pedido.service';
import { Pedido, EstadoPedido } from '../../../interfaces/pedido.interface';
import { NotifyService } from '../../../core/notify/notify.service';

import { PageLayoutComponent } from '../../../shared/ui/page-layout/page-layout.component';
import { TitleComponent } from '../../../shared/ui/fields/title/title.component';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { SearchComponent } from '../../../shared/ui/fields/searchbox/search.component';
import { PaginatorComponent } from '../../../shared/ui/paginator/paginator.component';
import { TabsFilterComponent } from '../../../shared/ui/tabs-filter/tabs-filter.component';
import { LucideAngularModule, Eye, Plus, Check, X as XIcon } from 'lucide-angular';
import { UiButtonComponent } from '../../../shared/ui/buttons/ui-button/ui-button.component';
import { ColumnDef, Dir, TableSort, TabStatus } from '../../../shared/ui/table/column-def';

@Component({
  selector: 'app-pedidos-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    PageLayoutComponent,
    TitleComponent,
    TableComponent,
    SearchComponent,
    PaginatorComponent,
    TabsFilterComponent,
    LucideAngularModule,
    UiButtonComponent,
  ],
  templateUrl: './pedido.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PedidosListPage implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  private api = inject(PedidoService);
  private cdr = inject(ChangeDetectorRef);
  private notify = inject(NotifyService);

  titleLabel = 'Pedidos';
  subTitleLabel = 'Gestión de pedidos';

  // UI
  tab: TabStatus | 'C' | 'L' | 'E' | 'A' = 'all';
  sortKey: string = 'id';
  sortDir: Dir = 'desc';
  page = 0;
  pageSize = 10;

  loading = false;
  total = 0;
  rows: Pedido[] = [];

  // Íconos
  Eye = Eye;
  Plus = Plus;
  Check = Check;
  XIcon = XIcon;

  searchForm = new FormGroup({
    q: new FormControl<string>('', { nonNullable: true }),
  });

  columns: ColumnDef<Pedido>[] = [
    { key: 'id', header: 'ID', sortable: true, widthPx: 80 },
    { key: 'creadoEn', header: 'Fecha', sortable: true, widthPx: 160 },
    { key: 'estado', header: 'Estado', widthPx: 120, align: 'center',
      type: 'badge',
      badgeMap: {
        C: 'warn',    // Creado
        L: 'muted',   // Listo
        E: 'ok',      // Entregado
        A: 'danger'   // Anulado
      },
      valueMap: {
        C: 'Creado',
        L: 'Listo',
        E: 'Entregado',
        A: 'Anulado'
      }
    },
    { key: 'totalNeto', header: 'Total', align: 'right', widthPx: 120 },
  ];

  counters = {
    all: 0,
    C: undefined as number | undefined,
    L: undefined as number | undefined,
    E: undefined as number | undefined,
    A: undefined as number | undefined,
  };

  ngOnInit(): void {
    this.searchForm.controls.q.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroyed$))
      .subscribe(() => {
        this.page = 0;
        this.load();
      });

    this.load();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private load(): void {
    this.loading = true;
    this.cdr.markForCheck();

    const filtros: any[] = [];
    if (this.tab === 'C') filtros.push({ llave: 'estado', operacion: '=', valor: 'C' });
    if (this.tab === 'L') filtros.push({ llave: 'estado', operacion: '=', valor: 'L' });
    if (this.tab === 'E') filtros.push({ llave: 'estado', operacion: '=', valor: 'E' });
    if (this.tab === 'A') filtros.push({ llave: 'estado', operacion: '=', valor: 'A' });

    const term = this.searchForm.controls.q.value.trim();
    if (term) {
      const n = Number(term);
      if (!Number.isNaN(n)) {
        filtros.push({ llave: 'id', operacion: 'EQ', valor: n });
      }
    }

    const pager = { page: this.page, size: this.pageSize, sortBy: this.sortKey, direction: this.sortDir };

    console.log('🔍 [PEDIDOS] Consultando lista de pedidos');
    console.log('📄 Paginación:', pager);
    console.log('🔎 Filtros:', filtros);
    console.log('📑 Tab actual:', this.tab);

    this.api
      .buscarPaginado(pager, filtros)
      .subscribe({
        next: (p) => {
          console.log('✅ [PEDIDOS] Respuesta del servidor:', p);

          const contenido = (p?.contenido ?? []) as any[];
          this.rows = contenido.map((r: any) => ({
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

          console.log('📊 [PEDIDOS] Pedidos procesados:', this.rows);
          console.log('🔢 [PEDIDOS] Total de registros:', p?.totalRegistros);

          this.total = Number(p?.totalRegistros ?? this.rows.length);
          this.counters.all = this.total;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('❌ [PEDIDOS] Error al consultar:', err);
          this.rows = [];
          this.total = 0;
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  // Handlers UI
  setTab(k: TabStatus | 'C' | 'L' | 'E' | 'A') {
    if (this.tab !== k) {
      console.log('📑 [PEDIDOS] Cambiando tab de', this.tab, 'a', k);
      this.tab = k;
      this.page = 0;
      this.load();
    }
  }

  onSort(s: TableSort) {
    if (!s?.key) return;
    console.log('🔃 [PEDIDOS] Ordenando por:', s.key, 'dirección:', s.dir);
    this.sortKey = s.key;
    this.sortDir = s.dir as Dir;
    this.page = 0;
    this.load();
  }

  setPageSize(n: number) {
    if (n > 0 && n !== this.pageSize) {
      console.log('📏 [PEDIDOS] Cambiando tamaño de página de', this.pageSize, 'a', n);
      this.pageSize = n;
      this.page = 0;
      this.load();
    }
  }

  prev() {
    if (this.page > 0) {
      console.log('⬅️ [PEDIDOS] Página anterior:', this.page - 1);
      this.page--;
      this.load();
    }
  }

  next() {
    if (this.page + 1 < this.maxPage()) {
      console.log('➡️ [PEDIDOS] Página siguiente:', this.page + 1);
      this.page++;
      this.load();
    }
  }

  maxPage() {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  from() {
    return this.total ? this.page * this.pageSize + 1 : 0;
  }

  to() {
    return Math.min((this.page + 1) * this.pageSize, this.total);
  }

  goBack() {
    history.back();
  }

  onSearch(term: string) {
    console.log('🔎 [PEDIDOS] Buscando:', term);
    this.searchForm.controls.q.setValue(term, { emitEvent: true });
  }

  /**
   * Marcar pedido como listo (C -> L) - NO descuenta inventario
   */
  onMarcarListo(pedido: Pedido) {
    console.log('🔄 [PEDIDOS] Marcar como listo solicitado');
    console.log('📦 Pedido:', pedido);
    console.log('🏷️ Estado actual:', pedido.estado);

    if (pedido.estado !== 'C') {
      console.warn('⚠️ [PEDIDOS] Solo se puede marcar como listo pedidos en estado C');
      this.notify.warning('Solo se puede marcar como listo pedidos en estado Creado');
      return;
    }

    // TODO: Implementar servicio de confirmación
    if (confirm(`¿Marcar pedido #${pedido.id} como Listo?`)) {
      console.log('✅ [PEDIDOS] Usuario confirmó marcar como listo');

      this.api.marcarListo(pedido.id).subscribe({
        next: (response) => {
          console.log('✅ [PEDIDOS] Pedido marcado como listo exitosamente:', response);
          this.notify.success(`Pedido #${pedido.id} marcado como Listo`);
          this.load();
        },
        error: (err) => {
          console.error('❌ [PEDIDOS] Error al marcar como listo:', err);
          this.notify.handleError(err, 'Error al marcar como listo');
        },
      });
    } else {
      console.log('❌ [PEDIDOS] Usuario canceló');
    }
  }

  /**
   * Entregar pedido (L -> E) - SÍ descuenta inventario, valida stock
   */
  onEntregar(pedido: Pedido) {
    console.log('📦 [PEDIDOS] Entregar pedido solicitado');
    console.log('📦 Pedido:', pedido);
    console.log('🏷️ Estado actual:', pedido.estado);

    if (pedido.estado !== 'L') {
      console.warn('⚠️ [PEDIDOS] Solo se puede entregar pedidos en estado L (Listo)');
      this.notify.warning('Solo se puede entregar pedidos que estén Listos');
      return;
    }

    // TODO: Implementar servicio de confirmación
    if (confirm(`¿Entregar pedido #${pedido.id}? Esto descontará el inventario.`)) {
      console.log('✅ [PEDIDOS] Usuario confirmó entrega');

      this.api.entregar(pedido.id).subscribe({
        next: (response) => {
          console.log('✅ [PEDIDOS] Pedido entregado exitosamente:', response);
          this.notify.success(`Pedido #${pedido.id} entregado correctamente`);
          this.load();
        },
        error: (err) => {
          console.error('❌ [PEDIDOS] Error al entregar pedido:', err);
          this.notify.handleError(err, 'Error al entregar pedido');
        },
      });
    } else {
      console.log('❌ [PEDIDOS] Usuario canceló entrega');
    }
  }

  /**
   * Anular pedido (C o L -> A)
   */
  onAnular(pedido: Pedido) {
    console.log('❌ [PEDIDOS] Anular pedido solicitado');
    console.log('📦 Pedido:', pedido);
    console.log('🏷️ Estado actual:', pedido.estado);

    if (pedido.estado === 'E' || pedido.estado === 'A') {
      console.warn('⚠️ [PEDIDOS] No se pueden anular pedidos en estado E o A');
      this.notify.warning('No se pueden anular pedidos Entregados o ya Anulados');
      return;
    }

    // TODO: Implementar servicio de confirmación
    if (confirm(`¿ANULAR pedido #${pedido.id}? Esta acción no se puede deshacer.`)) {
      console.log('✅ [PEDIDOS] Usuario confirmó anulación');

      this.api.anular(pedido.id).subscribe({
        next: (response) => {
          console.log('✅ [PEDIDOS] Pedido anulado exitosamente:', response);
          this.notify.success(`Pedido #${pedido.id} anulado`);
          this.load();
        },
        error: (err) => {
          console.error('❌ [PEDIDOS] Error al anular pedido:', err);
          this.notify.handleError(err, 'Error al anular pedido');
        },
      });
    } else {
      console.log('❌ [PEDIDOS] Usuario canceló anulación');
    }
  }
}
