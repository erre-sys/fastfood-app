import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RentabilidadService, RentabilidadPlato } from '../../../services/rentabilidad.service';
import { BaseListComponent } from '../../../shared/base/base-list.component';

import { PageLayoutComponent } from '../../../shared/ui/page-layout/page-layout.component';
import { TitleComponent } from '../../../shared/ui/fields/title/title.component';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { SearchComponent } from '../../../shared/ui/fields/searchbox/search.component';
import { PaginatorComponent } from '../../../shared/ui/paginator/paginator.component';
import { LucideAngularModule, TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-angular';
import { UiButtonComponent } from '../../../shared/ui/buttons/ui-button/ui-button.component';
import { ColumnDef } from '../../../shared/ui/table/column-def';
import { HasRoleDirective } from '../../../core/auth/has-role.directive';

@Component({
  selector: 'app-rentabilidad-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageLayoutComponent,
    TitleComponent,
    TableComponent,
    SearchComponent,
    PaginatorComponent,
    LucideAngularModule,
    UiButtonComponent,
    HasRoleDirective
  ],
  templateUrl: './rentabilidad-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class RentabilidadListPage extends BaseListComponent implements OnInit {
  private api = inject(RentabilidadService);
  private cdr = inject(ChangeDetectorRef);

  titleLabel = 'Rentabilidad de Platos';
  subTitleLabel = 'Análisis de costos y márgenes de ganancia';

  // UI
  rows: RentabilidadPlato[] = [];
  allRows: RentabilidadPlato[] = [];

  // Íconos
  TrendingUp = TrendingUp;
  TrendingDown = TrendingDown;
  DollarSign = DollarSign;
  AlertCircle = AlertCircle;

  searchForm = new FormGroup({
    q: new FormControl<string>('', { nonNullable: true }),
  });

  columns: ColumnDef<RentabilidadPlato>[] = [
    { key: 'platoNombre', header: 'Plato', sortable: true },
    { key: 'platoCodigo', header: 'Código', widthPx: 100 },
    {
      key: 'precioVenta',
      header: 'Precio Venta',
      widthPx: 120,
      align: 'right',
      type: 'money'
    },
    {
      key: 'costoIngredientes',
      header: 'Costo Ing.',
      widthPx: 120,
      align: 'right',
      type: 'money'
    },
    {
      key: 'margenBruto',
      header: 'Margen',
      widthPx: 100,
      align: 'right',
      type: 'money'
    },
    {
      key: 'porcentajeGananciaDisplay',
      header: '% Ganancia',
      widthPx: 110,
      align: 'center'
    },
    {
      key: 'estado',
      header: 'Estado',
      widthPx: 120,
      align: 'center',
      type: 'badge',
      badgeMap: {
        EXCELENTE: 'ok',
        BUENO: 'ok',
        BAJO: 'warn',
        CRITICO: 'danger',
        SIN_DATOS: 'muted'
      },
      valueMap: {
        EXCELENTE: 'Excelente',
        BUENO: 'Bueno',
        BAJO: 'Bajo',
        CRITICO: 'Crítico',
        SIN_DATOS: 'Sin Datos'
      }
    },
  ];

  // Estadísticas resumen
  stats = {
    totalPlatos: 0,
    conReceta: 0,
    sinReceta: 0,
    margenPromedio: 0,
    porcentajePromedio: 0
  };

  ngOnInit(): void {
    this.searchForm.controls.q.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroyed$))
      .subscribe(() => { this.page = 0; this.filterRows(); });

    this.load();
  }

  protected override load(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.api.calcularRentabilidadPlatos().subscribe({
      next: (data) => {
        // Agregar campo display para porcentaje con formato
        this.allRows = data.map(r => ({
          ...r,
          porcentajeGananciaDisplay: `${r.porcentajeGanancia.toFixed(1)}%`
        })) as any;
        this.filterRows();
        this.calcularEstadisticas();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.rows = [];
        this.allRows = [];
        this.total = 0;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private filterRows(): void {
    const term = this.searchForm.controls.q.value.trim().toLowerCase();

    let filtered = this.allRows;
    if (term) {
      filtered = this.allRows.filter(r =>
        r.platoNombre.toLowerCase().includes(term) ||
        r.platoCodigo.toLowerCase().includes(term)
      );
    }

    // Aplicar ordenamiento
    filtered = this.sortRows(filtered);

    // Aplicar paginación
    this.total = filtered.length;
    const start = this.page * this.pageSize;
    const end = start + this.pageSize;
    this.rows = filtered.slice(start, end);

    this.cdr.markForCheck();
  }

  private sortRows(data: RentabilidadPlato[]): RentabilidadPlato[] {
    if (!this.sortKey) return data;

    return [...data].sort((a, b) => {
      const key = this.sortKey as keyof RentabilidadPlato;
      const valA = a[key];
      const valB = b[key];

      let comparison = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else {
        comparison = String(valA).localeCompare(String(valB));
      }

      return this.sortDir === 'asc' ? comparison : -comparison;
    });
  }

  private calcularEstadisticas(): void {
    this.stats.totalPlatos = this.allRows.length;
    this.stats.conReceta = this.allRows.filter(r => r.tieneReceta).length;
    this.stats.sinReceta = this.stats.totalPlatos - this.stats.conReceta;

    const platosConReceta = this.allRows.filter(r => r.tieneReceta && r.precioVenta > 0);
    if (platosConReceta.length > 0) {
      const sumaMargen = platosConReceta.reduce((sum, r) => sum + r.margenBruto, 0);
      const sumaPorcentaje = platosConReceta.reduce((sum, r) => sum + r.porcentajeGanancia, 0);

      this.stats.margenPromedio = sumaMargen / platosConReceta.length;
      this.stats.porcentajePromedio = sumaPorcentaje / platosConReceta.length;
    } else {
      this.stats.margenPromedio = 0;
      this.stats.porcentajePromedio = 0;
    }
  }

  // Handlers UI
  onSearch(term: string): void {
    this.searchForm.controls.q.setValue(term, { emitEvent: true });
  }

  override onSort(event: { key: string; dir: 'asc' | 'desc' }): void {
    this.sortKey = event.key;
    this.sortDir = event.dir;
    this.filterRows();
  }

  override setPageSize(size: number): void {
    this.pageSize = size;
    this.page = 0;
    this.filterRows();
  }

  override prev(): void {
    if (this.page > 0) {
      this.page--;
      this.filterRows();
    }
  }

  override next(): void {
    if (this.page < this.maxPage()) {
      this.page++;
      this.filterRows();
    }
  }
}
