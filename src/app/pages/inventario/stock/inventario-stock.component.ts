import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { InventarioService } from '../../../services/inventario.service';
import { IngredienteService } from '../../../services/ingrediente.service';
import { Inventario } from '../../../interfaces/inventario.interface';
import { getNombreUnidad } from '../../../shared/constants/unidades.const';
import { BaseListComponent } from '../../../shared/base/base-list.component';

import { PageLayoutComponent } from '../../../shared/ui/page-layout/page-layout.component';
import { TitleComponent } from '../../../shared/ui/fields/title/title.component';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { SearchComponent } from '../../../shared/ui/fields/searchbox/search.component';
import { PaginatorComponent } from '../../../shared/ui/paginator/paginator.component';
import { LucideAngularModule, Package, AlertTriangle, ArrowLeftRight, Edit, BarChart3 } from 'lucide-angular';
import { UiButtonComponent } from '../../../shared/ui/buttons/ui-button/ui-button.component';
import { TabsFilterComponent } from '../../../shared/ui/tabs-filter/tabs-filter.component';
import { ColumnDef } from '../../../shared/ui/table/column-def';

type StockTab = 'all' | 'bajoMinimo';

@Component({
  selector: 'app-inventario-stock',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, PageLayoutComponent, TitleComponent, TabsFilterComponent,
    TableComponent, SearchComponent, PaginatorComponent, LucideAngularModule, UiButtonComponent, 
  ],
  templateUrl: './inventario-stock.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InventarioStockPage extends BaseListComponent implements OnInit {
  private api = inject(InventarioService);
  private ingredientesApi = inject(IngredienteService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  titleLabel = 'Inventario';
  subTitleLabel = 'Stock actual de ingredientes';

  // UI
  tab: StockTab = 'all';
  rows: Inventario[] = [];

  // Íconos
  Package = Package;
  AlertTriangle = AlertTriangle;
  ArrowLeftRight = ArrowLeftRight;
  Edit = Edit;

  // Mapa de ingredientes con nombre y unidad
  ingredienteNombre: Map<number, string> = new Map();
  ingredienteUnidad: Map<number, string> = new Map();

  searchForm = new FormGroup({
    q: new FormControl<string>('', { nonNullable: true }),
  });

  columns: ColumnDef<Inventario>[] = [
    { key: 'nombre', header: 'Ingrediente', sortable: false , widthPx: 120},
    { key: 'unidad', header: 'Unidad', align: 'center'},
    { key: 'stockActual', header: 'Stock Actual', sortable: true, align: 'right'}
  ];

  counters = { all: 0, bajoMinimo: undefined as number | undefined };

  ngOnInit(): void {
    this.sortKey = 'ingredienteId';

    // Primero cargar ingredientes, luego el stock
    this.loadIngredientes().subscribe({
      next: () => {
        this.load();
      },
      error: () => {
        this.load(); // Cargar stock de todos modos
      }
    });

    this.searchForm.controls.q.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroyed$))
      .subscribe(() => {
        this.page = 0;
        this.load();
      });
  }

  protected override load(): void {
    this.loading = true;
    this.cdr.markForCheck();

    const q = this.searchForm.controls.q.value.trim();
    const soloBajoMinimo = this.tab === 'bajoMinimo';

    this.api
      .buscarInventarioPaginado(
        { page: this.page, size: this.pageSize, orderBy: this.sortKey, direction: this.sortDir },
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
              unidad: this.getIngredienteUnidad(ingId),
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

  onSearch(term: string) {
    this.searchForm.controls.q.setValue(term, { emitEvent: true });
  }

  // Helper para detectar stock bajo
  isBajoStock(row: Inventario): boolean {
    return row.stockActual < row.stockMinimo;
  }

  private loadIngredientes() {
    return this.ingredientesApi.listar().pipe(
      tap((arr) => {
        // Mapear nombres
        this.ingredienteNombre = new Map(
          (arr ?? []).map((ing: any) => [
            Number(ing?.id ?? ing?.ingredienteId),
            ing?.nombre ?? ''
          ])
        );

        this.ingredienteUnidad = new Map(
          (arr ?? []).map((ing: any) => [
            Number(ing?.id ?? ing?.ingredienteId),
            ing?.unidad ?? ''
          ])
        );
      })
    );
  }

  private getIngredienteNombre(id: number): string {
    return this.ingredienteNombre.get(id) ?? '';
  }

  private getIngredienteUnidad(id: number): string {
    const unidadCodigo = this.ingredienteUnidad.get(id) ?? '';
    return getNombreUnidad(unidadCodigo);
  }

  irAjusteManual(ingredienteId: number): void {
    this.router.navigate(['/inventario/ajustar'], {
      queryParams: { ingredienteId }
    });
  }

  irKardex(ingredienteId: number): void {
    this.router.navigate(['/kardex'], {
      queryParams: { ingredienteId }
    });
  }
}
