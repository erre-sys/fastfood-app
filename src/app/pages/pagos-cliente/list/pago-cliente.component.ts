import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

import { PagoClienteService } from '../../../services/pago-cliente.service';
import { PagoCliente } from '../../../interfaces/pago-cliente.interface';

import { PageLayoutComponent } from '../../../shared/ui/page-layout/page-layout.component';
import { TitleComponent } from '../../../shared/ui/fields/title/title.component';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { SearchComponent } from '../../../shared/ui/fields/searchbox/search.component';
import { PaginatorComponent } from '../../../shared/ui/paginator/paginator.component';
import { LucideAngularModule, Eye, Plus } from 'lucide-angular';
import { UiButtonComponent } from '../../../shared/ui/buttons/ui-button/ui-button.component';
import { TabsFilterComponent } from '../../../shared/ui/tabs-filter/tabs-filter.component';
import { ColumnDef, Dir, TableSort, TabStatus } from '../../../shared/ui/table/column-def';

@Component({
  selector: 'app-pagos-cliente-list',
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
    LucideAngularModule,
    UiButtonComponent,
    TabsFilterComponent,
  ],
  templateUrl: './pago-cliente.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PagosClienteListPage implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  private api = inject(PagoClienteService);
  private cdr = inject(ChangeDetectorRef);

  titleLabel = 'Pagos de Clientes';
  subTitleLabel = 'Registro de pagos recibidos';

  // UI
  tab: TabStatus | 'pendiente' | 'pagado' | 'anulado' | 'fiado' = 'all';
  sortKey: string = 'id';
  sortDir: Dir = 'desc';
  page = 0;
  pageSize = 10;

  loading = false;
  total = 0;
  rows: PagoCliente[] = [];

  // Íconos
  Eye = Eye;
  Plus = Plus;

  searchForm = new FormGroup({
    q: new FormControl<string>('', { nonNullable: true }),
  });

  columns: ColumnDef<PagoCliente>[] = [
    { key: 'id', header: 'ID', sortable: true, widthPx: 80 },
    { key: 'pedidoId', header: 'Pedido', sortable: true, widthPx: 100 },
    { key: 'fecha', header: 'Fecha', sortable: true, widthPx: 160 },
    { key: 'montoTotal', header: 'Monto', align: 'right', widthPx: 120 },
    { key: 'metodo', header: 'Método', widthPx: 120, align: 'center',
      type: 'badge',
      badgeMap: { efectivo: 'ok', transferencia: 'muted' },
      valueMap: { efectivo: 'Efectivo', transferencia: 'Transferencia' }
    },
    { key: 'estado', header: 'Estado', widthPx: 120, align: 'center',
      type: 'badge',
      badgeMap: { pendiente: 'warn', pagado: 'ok', anulado: 'danger', fiado: 'muted' },
      valueMap: { pendiente: 'Pendiente', pagado: 'Pagado', anulado: 'Anulado', fiado: 'Fiado' }
    },
    { key: 'referencia', header: 'Referencia' },
  ];

  counters = {
    all: 0,
    pendiente: undefined as number | undefined,
    pagado: undefined as number | undefined,
    anulado: undefined as number | undefined,
    fiado: undefined as number | undefined,
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
    if (this.tab === 'pendiente') filtros.push({ llave: 'estado', operacion: '=', valor: 'pendiente' });
    if (this.tab === 'pagado') filtros.push({ llave: 'estado', operacion: '=', valor: 'pagado' });
    if (this.tab === 'anulado') filtros.push({ llave: 'estado', operacion: '=', valor: 'anulado' });
    if (this.tab === 'fiado') filtros.push({ llave: 'estado', operacion: '=', valor: 'fiado' });

    const term = this.searchForm.controls.q.value.trim();
    if (term) {
      const n = Number(term);
      if (!Number.isNaN(n)) {
        filtros.push({ llave: 'id', operacion: 'EQ', valor: n });
        filtros.push({ llave: 'pedidoId', operacion: 'EQ', valor: n });
      }
    }

    this.api
      .buscarPaginado(
        { page: this.page, size: this.pageSize, sortBy: this.sortKey, direction: this.sortDir },
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
            metodo: (r?.metodo ?? 'efectivo') as 'efectivo' | 'transferencia',
            referencia: r?.referencia ?? '',
            estado: (r?.estado ?? 'pendiente') as 'pendiente' | 'pagado' | 'anulado' | 'fiado',
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
  setTab(k: TabStatus | 'pendiente' | 'pagado' | 'anulado' | 'fiado') {
    if (this.tab !== k) {
      this.tab = k;
      this.page = 0;
      this.load();
    }
  }

  onSort(s: TableSort) {
    if (!s?.key) return;
    this.sortKey = s.key;
    this.sortDir = s.dir as Dir;
    this.page = 0;
    this.load();
  }

  setPageSize(n: number) {
    if (n > 0 && n !== this.pageSize) {
      this.pageSize = n;
      this.page = 0;
      this.load();
    }
  }

  prev() {
    if (this.page > 0) {
      this.page--;
      this.load();
    }
  }

  next() {
    if (this.page + 1 < this.maxPage()) {
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
    this.searchForm.controls.q.setValue(term, { emitEvent: true });
  }
}
