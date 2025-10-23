import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { InventarioService } from '../../../services/inventario.service';
import { IngredienteService } from '../../../services/ingrediente.service';
import { Inventario } from '../../../interfaces/inventario.interface';

import { PageLayoutComponent } from '../../../shared/ui/page-layout/page-layout.component';
import { TitleComponent } from '../../../shared/ui/fields/title/title.component';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { SearchComponent } from '../../../shared/ui/fields/searchbox/search.component';
import { PaginatorComponent } from '../../../shared/ui/paginator/paginator.component';
import { LucideAngularModule, Package, AlertTriangle, ArrowLeftRight } from 'lucide-angular';
import { UiButtonComponent } from '../../../shared/ui/buttons/ui-button/ui-button.component';
import { TabsFilterComponent } from '../../../shared/ui/tabs-filter/tabs-filter.component';
import { ColumnDef, Dir, TableSort } from '../../../shared/ui/table/column-def';

type StockTab = 'all' | 'bajoMinimo';

@Component({
  selector: 'app-inventario-stock',
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
  templateUrl: './inventario-stock.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InventarioStockPage implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  private api = inject(InventarioService);
  private ingredientesApi = inject(IngredienteService);
  private cdr = inject(ChangeDetectorRef);

  titleLabel = 'Inventario';
  subTitleLabel = 'Stock actual de ingredientes';

  // UI
  tab: StockTab = 'all';
  sortKey: string = 'nombre';
  sortDir: Dir = 'asc';
  page = 0;
  pageSize = 10;

  loading = false;
  total = 0;
  rows: Inventario[] = [];

  // Íconos
  Package = Package;
  AlertTriangle = AlertTriangle;
  ArrowLeftRight = ArrowLeftRight;

  // Mapa de ingredientes
  ingredienteNombre: Map<number, string> = new Map();

  searchForm = new FormGroup({
    q: new FormControl<string>('', { nonNullable: true }),
  });

  columns: ColumnDef<Inventario>[] = [
    { key: 'nombre', header: 'Ingrediente', sortable: true },
    { key: 'stockActual', header: 'Stock Actual', sortable: true, align: 'right', widthPx: 140 },
    { key: 'stockMinimo', header: 'Stock Mínimo', sortable: true, align: 'right', widthPx: 140 },
    { key: 'actualizadoEn', header: 'Última Actualización', sortable: true, type: 'date', widthPx: 180 },
  ];

  counters = { all: 0, bajoMinimo: undefined as number | undefined };

  ngOnInit(): void {
    this.loadIngredientes();

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

    const q = this.searchForm.controls.q.value.trim();
    const soloBajoMinimo = this.tab === 'bajoMinimo';

    this.api
      .buscarInventarioPaginado(
        { page: this.page, size: this.pageSize, sortBy: this.sortKey, direction: this.sortDir },
        q,
        soloBajoMinimo
      )
      .subscribe({
        next: (p) => {
          const contenido = (p?.contenido ?? p?.content ?? []) as any[];
          this.rows = contenido.map((r) => {
            const ingId = Number(r?.ingredienteId ?? r?.ingrediente_id ?? -1);
            return {
              ingredienteId: ingId,
              codigo: r?.codigo ?? '',
              nombre: this.getIngredienteNombre(ingId),
              stockActual: Number(r?.stockActual ?? r?.stock_actual ?? 0),
              stockMinimo: Number(r?.stockMinimo ?? r?.stock_minimo ?? 0),
              actualizadoEn: r?.actualizadoEn ?? r?.actualizado_en ?? '',
            };
          }) as Inventario[];
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

  // Handlers UI
  setTab(k: StockTab) {
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

  // Helper para detectar stock bajo
  isBajoStock(row: Inventario): boolean {
    return row.stockActual < row.stockMinimo;
  }

  private loadIngredientes(): void {
    this.ingredientesApi.listar().subscribe({
      next: (arr) => {
        this.ingredienteNombre = new Map(
          (arr ?? []).map((ing: any) => [Number(ing?.id ?? ing?.ingredienteId), ing?.nombre ?? ''])
        );
        if (this.rows.length) {
          this.rows = this.rows.map((r) => ({
            ...r,
            nombre: this.getIngredienteNombre(r.ingredienteId),
          }));
          this.cdr.markForCheck();
        }
      },
      error: () => {},
    });
  }

  private getIngredienteNombre(id: number): string {
    return this.ingredienteNombre.get(id) ?? '';
  }
}
