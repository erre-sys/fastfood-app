import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { InventarioService } from '../../../services/inventario.service';
import { IngredienteService } from '../../../services/ingrediente.service';
import { InventarioMov } from '../../../interfaces/inventario-mov.interface';
import { isoToSimpleDate, dateToBackendDateTimeStart, dateToBackendDateTimeEnd } from '../../../shared/utils/date-format.util';
import { BaseListComponent } from '../../../shared/base/base-list.component';

import { PageLayoutComponent, TitleComponent, TableComponent, PaginatorComponent, SectionContainerComponent, DateRangeComponent } from '../../../shared';
import { AppSelectComponent } from '../../../shared/ui/fields/select/select.component';
import { SummaryComponent } from '../../../shared/ui/summary/summary.component';
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
    SummaryComponent,
    LucideAngularModule,
    TabsFilterComponent
],
  templateUrl: './inventario-movimientos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InventarioMovimientosPage extends BaseListComponent implements OnInit {
  private api = inject(InventarioService);
  private ingredientesApi = inject(IngredienteService);
  private route = inject(ActivatedRoute);
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
  ingredientes: Array<{ id: number; nombre: string; stockActual: number; unidad: string }> = [];

  // Map para búsqueda rápida de nombres y unidades de ingredientes
  private ingredienteNombreMap: Map<number, string> = new Map();
  private ingredienteUnidadMap: Map<number, string> = new Map();
  private ingredienteStockMap: Map<number, number> = new Map();

  searchForm = new FormGroup({
    ingredienteId: new FormControl<number | null>(null),
    fechaDesde: new FormControl<string>('', { nonNullable: true }),
    fechaHasta: new FormControl<string>('', { nonNullable: true }),
  });

  columns: ColumnDef<InventarioMov>[] = [
    { key: 'ingredienteNombre', header: 'Ingrediente', sortable: true, widthPx: 200 },
    { key: 'tipo', header: 'Tipo', sortable: true,  widthPx: 150,  align: 'center',
      type: 'badge',  badgeMap: { COMPRA: 'ok', CONSUMO: 'warn', AJUSTE: 'muted' },
    },
    { key: 'cantidad', header: 'Cantidad', sortable: true, align: 'right', widthPx: 100 },
    { key: 'ingredienteUnidad', header: 'Unidad', sortable: false, align: 'center', widthPx: 100 },
    { key: 'fecha', header: 'Fecha', sortable: true, type: 'date', align: 'right' },
  ];

  counters = { all: 0, COMPRA: undefined as number | undefined, CONSUMO: undefined as number | undefined, AJUSTE: undefined as number | undefined };

  ngOnInit(): void {
    // Leer queryParam ingredienteId si existe
    const ingredienteIdParam = this.route.snapshot.queryParamMap.get('ingredienteId');
    if (ingredienteIdParam) {
      const ingredienteId = Number(ingredienteIdParam);
      if (!isNaN(ingredienteId)) {
        this.searchForm.controls.ingredienteId.setValue(ingredienteId);
      }
    }

    // Cargar ingredientes primero
    this.loadIngredientes();

    // Inicializar rango de fechas: últimos 30 días
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
              ingredienteUnidad: this.getIngredienteUnidad(ingId),
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
    // Cargar ingredientes e inventario en paralelo
    forkJoin({
      ingredientes: this.ingredientesApi.listar(),
      inventario: this.api.buscarInventarioPaginado(
        { page: 0, size: 1000, orderBy: 'ingredienteId', direction: 'asc' },
        undefined,
        false
      ),
    }).subscribe({
      next: ({ ingredientes, inventario }) => {
        // Crear Map de inventario (stock) por ingredienteId
        const stockMap = new Map<number, { stockActual: number }>();
        (inventario.contenido ?? inventario.content ?? []).forEach((inv: any) => {
          const ingredienteId = Number(inv?.ingredienteId ?? inv?.ingrediente_id ?? inv?.id);
          stockMap.set(ingredienteId, {
            stockActual: Number(inv?.stockActual ?? inv?.stock_actual ?? 0),
          });
        });

        // Combinar ingredientes con su stock actual
        this.ingredientes = (ingredientes ?? []).map((ing: any) => {
          const id = Number(ing?.id ?? ing?.ingredienteId);
          const nombre = ing?.nombre ?? '';
          const unidad = ing?.unidad ?? '';
          const stock = stockMap.get(id);
          const stockActual = stock?.stockActual ?? 0;

          // Poblar los Maps para búsqueda O(1)
          this.ingredienteNombreMap.set(id, nombre);
          this.ingredienteUnidadMap.set(id, unidad);
          this.ingredienteStockMap.set(id, stockActual);

          return { id, nombre, stockActual, unidad };
        });

        this.cdr.markForCheck();
      },
      error: () => {
        // Error silencioso - el formulario mostrará select vacío
        this.ingredientes = [];
        this.cdr.markForCheck();
      },
    });
  }

  private getIngredienteNombre(id: number): string {
    return this.ingredienteNombreMap.get(id) ?? '';
  }

  private getIngredienteUnidad(id: number): string {
    return this.ingredienteUnidadMap.get(id) ?? '';
  }

  // Métodos para mostrar stock del ingrediente seleccionado
  getStockActualIngrediente(): number {
    const ingredienteId = this.searchForm.controls.ingredienteId.value;
    if (!ingredienteId) return 0;
    return this.ingredienteStockMap.get(ingredienteId) ?? 0;
  }

  getUnidadIngrediente(): string {
    const ingredienteId = this.searchForm.controls.ingredienteId.value;
    if (!ingredienteId) return '';
    return this.ingredienteUnidadMap.get(ingredienteId) ?? '';
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
