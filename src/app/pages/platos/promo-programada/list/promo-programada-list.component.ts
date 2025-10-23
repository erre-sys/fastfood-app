import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PromoProgramadaService } from '../../../../services/promo-programada.service';
import { PlatoService } from '../../../../services/plato.service';
import { PromoProgramada } from '../../../../interfaces/promo-programada.interface';

import { PageLayoutComponent } from '../../../../shared/ui/page-layout/page-layout.component';
import { TitleComponent } from '../../../../shared/ui/fields/title/title.component';
import { TableComponent } from '../../../../shared/ui/table/table.component';
import { SearchComponent } from '../../../../shared/ui/fields/searchbox/search.component';
import { PaginatorComponent } from '../../../../shared/ui/paginator/paginator.component';
import { LucideAngularModule, Pencil, Plus } from 'lucide-angular';
import { UiButtonComponent } from '../../../../shared/ui/buttons/ui-button/ui-button.component';
import { TabsFilterComponent } from '../../../../shared/ui/tabs-filter/tabs-filter.component';
import { ColumnDef, Dir, TableSort, TabStatus } from '../../../../shared/ui/table/column-def';

@Component({
  selector: 'app-promo-programada-list',
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
  templateUrl: './promo-programada-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PromoProgramadaListPage implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  private api = inject(PromoProgramadaService);
  private platosApi = inject(PlatoService);
  private cdr = inject(ChangeDetectorRef);

  titleLabel = 'Promociones Programadas';
  subTitleLabel = 'Administración de promociones';

  // UI
  tab: TabStatus = 'all';
  sortKey: string = 'id';
  sortDir: Dir = 'asc';
  page = 0;
  pageSize = 10;

  loading = false;
  total = 0;
  rows: PromoProgramada[] = [];

  // Íconos
  Pencil = Pencil;
  Plus = Plus;

  searchForm = new FormGroup({
    q: new FormControl<string>('', { nonNullable: true }),
  });

  columns: ColumnDef<PromoProgramada>[] = [
    { key: 'platoNombre', header: 'Plato', sortable: true },
    { key: 'fechaInicio', header: 'Fecha Inicio', sortable: true, type: 'date' },
    { key: 'fechaFin', header: 'Fecha Fin', sortable: true, type: 'date' },
    { key: 'descuentoPct', header: 'Descuento %', widthPx: 140, align: 'right' },
    {
      key: 'estado',
      header: 'Estado',
      widthPx: 120,
      align: 'center',
      type: 'badge',
      badgeMap: { A: 'ok', I: 'warn' },
      valueMap: { A: 'Activo', I: 'Inactivo' },
    },
  ];

  platoNombre: Map<number, string> = new Map();
  counters = { all: 0, active: undefined as number | undefined, inactive: undefined as number | undefined };

  ngOnInit(): void {
    this.loadPlatos();
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
    if (this.tab === 'active') filtros.push({ llave: 'estado', operacion: 'EQ', valor: 'A' });
    if (this.tab === 'inactive') filtros.push({ llave: 'estado', operacion: 'EQ', valor: 'I' });

    const term = this.searchForm.controls.q.value.trim();
    if (term) {
      const n = Number(term);
      if (!Number.isNaN(n)) {
        filtros.push({ llave: 'id', operacion: 'EQ', valor: n });
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
            id: r?.id ?? r?.promoId ?? r?.promo_id ?? -1,
            platoId: r?.platoId ?? r?.plato_id ?? -1,
            fechaInicio: r?.fechaInicio ?? r?.fecha_inicio ?? '',
            fechaFin: r?.fechaFin ?? r?.fecha_fin ?? '',
            descuentoPct: Number(r?.descuentoPct ?? r?.descuento_pct ?? 0),
            estado: (r?.estado ?? 'A') as 'A' | 'I',
            platoNombre: this.platoNombre.get(r?.platoId ?? r?.plato_id ?? -1) ?? '',
          })) as PromoProgramada[];
          this.total = Number(p?.totalRegistros ?? this.rows.length);
          this.counters.all = this.total;
          this.cdr.markForCheck();
        },
        error: () => {
          this.rows = [];
          this.total = 0;
          this.loading = false;
          this.cdr.markForCheck();
        },
        complete: () => {
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  private loadPlatos(): void {
    this.platosApi.listar().subscribe({
      next: (arr) => {
        this.platoNombre = new Map(
          (arr ?? []).map((p: any) => [Number(p?.id ?? p?.platoId ?? p?.plato_id), p?.nombre ?? ''])
        );
        if (this.rows.length) {
          this.rows = this.rows.map((r) => ({
            ...r,
            platoNombre: this.platoNombre.get(r.platoId) ?? '',
          }));
        }
      },
      error: () => {},
    });
  }

  // Handlers UI
  setTab(k: TabStatus) {
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
