import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { InventarioService } from '../../../services/inventario.service';
import { IngredienteService } from '../../../services/ingrediente.service';
import { InventarioMov } from '../../../interfaces/inventario-mov.interface';

import { PageLayoutComponent } from '../../../shared/ui/page-layout/page-layout.component';
import { TitleComponent } from '../../../shared/ui/fields/title/title.component';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { PaginatorComponent } from '../../../shared/ui/paginator/paginator.component';
import { LucideAngularModule, ArrowLeftRight } from 'lucide-angular';
import { UiButtonComponent } from '../../../shared/ui/buttons/ui-button/ui-button.component';
import { TabsFilterComponent } from '../../../shared/ui/tabs-filter/tabs-filter.component';
import { ColumnDef, Dir, TableSort } from '../../../shared/ui/table/column-def';

type TipoMovTab = 'all' | 'COMPRA' | 'CONSUMO' | 'AJUSTE';

@Component({
  selector: 'app-inventario-movimientos',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    PageLayoutComponent,
    TitleComponent,
    TableComponent,
    PaginatorComponent,
    LucideAngularModule,
    UiButtonComponent,
    TabsFilterComponent,
  ],
  templateUrl: './inventario-movimientos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InventarioMovimientosPage implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  private api = inject(InventarioService);
  private ingredientesApi = inject(IngredienteService);
  private cdr = inject(ChangeDetectorRef);

  titleLabel = 'Kardex - Movimientos de Inventario';
  subTitleLabel = 'Historial de movimientos por ingrediente';

  // UI
  tab: TipoMovTab = 'all';
  sortKey: string = 'fecha';
  sortDir: Dir = 'desc';
  page = 0;
  pageSize = 10;

  loading = false;
  total = 0;
  rows: InventarioMov[] = [];

  // Íconos
  ArrowLeftRight = ArrowLeftRight;

  // Lista de ingredientes para el select
  ingredientes: Array<{ id: number; nombre: string }> = [];

  searchForm = new FormGroup({
    ingredienteId: new FormControl<number | null>(null),
    fechaDesde: new FormControl<string>('', { nonNullable: true }),
    fechaHasta: new FormControl<string>('', { nonNullable: true }),
  });

  columns: ColumnDef<InventarioMov>[] = [
    { key: 'fecha', header: 'Fecha', sortable: true, type: 'date', widthPx: 180 },
    { key: 'ingredienteNombre', header: 'Ingrediente', sortable: true },
    {
      key: 'tipo',
      header: 'Tipo',
      sortable: true,
      widthPx: 120,
      align: 'center',
      type: 'badge',
      badgeMap: { COMPRA: 'ok', CONSUMO: 'warn', AJUSTE: 'muted' },
    },
    { key: 'cantidad', header: 'Cantidad', sortable: true, align: 'right', widthPx: 120 },
    { key: 'referencia', header: 'Referencia', widthPx: 200 },
  ];

  counters = { all: 0, COMPRA: undefined as number | undefined, CONSUMO: undefined as number | undefined, AJUSTE: undefined as number | undefined };

  ngOnInit(): void {
    this.loadIngredientes();

    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.searchForm.controls.fechaDesde.setValue(this.formatDateForInput(thirtyDaysAgo));
    this.searchForm.controls.fechaHasta.setValue(this.formatDateForInput(today));

    this.searchForm.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroyed$))
      .subscribe(() => {
        this.page = 0;
        this.load();
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatDateTimeForBackend(dateStr: string): string {
    // Convierte yyyy-MM-dd a yyyy-MM-ddT00:00:00
    return `${dateStr}T00:00:00`;
  }

  private load(): void {
    const ingredienteId = this.searchForm.controls.ingredienteId.value;

    // El backend requiere ingredienteId obligatorio
    if (!ingredienteId) {
      this.rows = [];
      this.total = 0;
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    const fechaDesde = this.searchForm.controls.fechaDesde.value.trim();
    const fechaHasta = this.searchForm.controls.fechaHasta.value.trim();

    const desde = fechaDesde ? this.formatDateTimeForBackend(fechaDesde) : undefined;
    const hasta = fechaHasta ? this.formatDateTimeForBackend(fechaHasta) : undefined;
    const tipo = this.tab === 'all' ? null : this.tab;

    this.api
      .buscarKardexPaginado(
        { page: this.page, size: this.pageSize, sortBy: this.sortKey, direction: this.sortDir },
        ingredienteId,
        desde,
        hasta,
        tipo
      )
      .subscribe({
        next: (p) => {
          const contenido = (p?.contenido ?? p?.content ?? []) as any[];
          this.rows = contenido.map((r) => {
            const ingId = Number(r?.ingredienteId ?? r?.ingrediente_id ?? -1);
            return {
              id: Number(r?.id ?? r?.movimientoId ?? -1),
              ingredienteId: ingId,
              fecha: r?.fecha ?? '',
              tipo: r?.tipo ?? 'AJUSTE',
              cantidad: Number(r?.cantidad ?? 0),
              descuentoPct: r?.descuentoPct ?? r?.descuento_pct ?? null,
              referencia: r?.referencia ?? null,
              compraItemId: r?.compraItemId ?? r?.compra_item_id ?? null,
              pedidoId: r?.pedidoId ?? r?.pedido_id ?? null,
              ingredienteNombre: this.getIngredienteNombre(ingId),
            };
          }) as InventarioMov[];
          this.total = Number(p?.totalRegistros ?? p?.totalElements ?? this.rows.length);
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

  private loadIngredientes(): void {
    this.ingredientesApi.listar().subscribe({
      next: (arr) => {
        this.ingredientes = (arr ?? []).map((ing: any) => ({
          id: Number(ing?.id ?? ing?.ingredienteId),
          nombre: ing?.nombre ?? '',
        }));
        this.cdr.markForCheck();
      },
      error: () => {},
    });
  }

  private getIngredienteNombre(id: number): string {
    return this.ingredientes.find((i) => i.id === id)?.nombre ?? '';
  }

  // Handlers UI
  setTab(k: TipoMovTab) {
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
}
