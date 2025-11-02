import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { InventarioService } from '../../../services/inventario.service';
import { IngredienteService } from '../../../services/ingrediente.service';
import { InventarioMov } from '../../../interfaces/inventario-mov.interface';
import { isoToSimpleDate, dateToBackendDateTimeStart, dateToBackendDateTimeEnd } from '../../../shared/utils/date-format.util';
import { BaseListComponent } from '../../../shared/base/base-list.component';

import { PageLayoutComponent, TitleComponent, TableComponent, PaginatorComponent, SectionContainerComponent, DateRangeComponent } from '../../../shared';
import { AppSelectComponent } from '../../../shared/ui/fields/select/select.component';
import { LucideAngularModule, ArrowLeftRight } from 'lucide-angular';
import { TabsFilterComponent } from '../../../shared/ui/tabs-filter/tabs-filter.component';
import { ColumnDef, Dir } from '../../../shared/ui/table/column-def';

type TipoMovTab = 'all' | 'COMPRA' | 'CONSUMO' | 'AJUSTE';

@Component({
  selector: 'app-inventario-movimientos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageLayoutComponent,
    TitleComponent,
    TableComponent,
    PaginatorComponent,
    SectionContainerComponent,
    DateRangeComponent,
    AppSelectComponent,
    LucideAngularModule,
    TabsFilterComponent
],
  templateUrl: './inventario-movimientos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InventarioMovimientosPage extends BaseListComponent implements OnInit {
  private api = inject(InventarioService);
  private ingredientesApi = inject(IngredienteService);
  private cdr = inject(ChangeDetectorRef);

  titleLabel = 'Kardex - Movimientos de Inventario';
  subTitleLabel = 'Historial de movimientos por ingrediente';

  // UI
  tab: TipoMovTab = 'all';
  override sortKey: string = 'fecha';
  override sortDir: Dir = 'desc';
  rows: InventarioMov[] = [];

  // Íconos
  ArrowLeftRight = ArrowLeftRight;

  // Lista de ingredientes para el select
  ingredientes: Array<{ id: number; nombre: string }> = [];

  // Map para búsqueda rápida de nombres de ingredientes
  private ingredienteNombreMap: Map<number, string> = new Map();

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
    // Cargar ingredientes primero
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

  private formatDateForInput(date: Date): string {
    return isoToSimpleDate(date.toISOString());
  }

  protected override load(): void {
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
    const tipo = this.tab === 'all' ? null : this.tab;

    // Convertir fechas simples a formato DateTime del backend
    const fechaDesdeDateTime = fechaDesde ? dateToBackendDateTimeStart(fechaDesde) : undefined;
    const fechaHastaDateTime = fechaHasta ? dateToBackendDateTimeEnd(fechaHasta) : undefined;

    this.api
      .buscarKardexPaginado(
        { page: this.page, size: this.pageSize, orderBy: this.sortKey, direction: this.sortDir },
        ingredienteId,
        fechaDesdeDateTime,
        fechaHastaDateTime,
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
        this.ingredientes = (arr ?? []).map((ing: any) => {
          const id = Number(ing?.id ?? ing?.ingredienteId);
          const nombre = ing?.nombre ?? '';

          // Poblar el Map para búsqueda O(1)
          this.ingredienteNombreMap.set(id, nombre);

          return { id, nombre };
        });
        this.cdr.markForCheck();
      },
      error: () => {
        // Error silencioso - el formulario mostrará select vacío
      },
    });
  }

  private getIngredienteNombre(id: number): string {
    return this.ingredienteNombreMap.get(id) ?? '';
  }

  // Handlers UI
  setTab(k: TipoMovTab) {
    if (this.tab !== k) {
      this.tab = k;
      this.page = 0;
      this.load();
    }
  }
}
