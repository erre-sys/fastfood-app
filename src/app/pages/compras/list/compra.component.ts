import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CompraService } from '../../../services/compra.service';

import { Compra } from '../../../interfaces/compra.interface';

import { PageLayoutComponent } from '../../../shared/ui/page-layout/page-layout.component';
import { TitleComponent } from '../../../shared/ui/fields/title/title.component';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { SearchComponent } from '../../../shared/ui/fields/searchbox/search.component';
import { PaginatorComponent } from '../../../shared/ui/paginator/paginator.component';
import { LucideAngularModule, ShoppingCart, Eye } from 'lucide-angular';
import { UiButtonComponent } from '../../../shared/ui/buttons/ui-button/ui-button.component';
import { ColumnDef, Dir, TableSort } from '../../../shared/ui/table/column-def';
import { ProveedoresService } from '../../../services/proveedores.service';

@Component({
  selector: 'app-compra-list',
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
  ],
  templateUrl: './compra.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CompraListPage implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  private api = inject(CompraService);
  private proveedoresApi = inject(ProveedoresService);
  private cdr = inject(ChangeDetectorRef);

  titleLabel = 'Compras';
  subTitleLabel = 'Gestión de compras a proveedores';

  // UI
  sortKey: string = 'fecha';
  sortDir: Dir = 'desc';
  page = 0;
  pageSize = 10;

  loading = false;
  total = 0;
  rows: Compra[] = [];

  // Íconos
  ShoppingCart = ShoppingCart;
  Eye = Eye;

  // Mapa de proveedores
  proveedorNombre: Map<number, string> = new Map();

  searchForm = new FormGroup({
    q: new FormControl<string>('', { nonNullable: true }),
  });

  columns: ColumnDef<Compra>[] = [
    { key: 'fecha', header: 'Fecha', sortable: true, type: 'date', widthPx: 180 },
    { key: 'proveedorNombre', header: 'Proveedor', sortable: true },
    { key: 'referencia', header: 'Referencia', sortable: true, widthPx: 200 },
    { key: 'total', header: 'Total', sortable: true, align: 'right', type: 'money', widthPx: 140 },
  ];

  ngOnInit(): void {
    this.loadProveedores();

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
    const term = this.searchForm.controls.q.value.trim();
    if (term) {
      const n = Number(term);
      if (!Number.isNaN(n)) {
        filtros.push({ llave: 'id', operacion: 'EQ', valor: n });
      } else {
        filtros.push({ llave: 'referencia', operacion: 'LIKE', valor: term });
      }
    }

    this.api
      .buscarPaginado(
        { page: this.page, size: this.pageSize, sortBy: this.sortKey, direction: this.sortDir },
        filtros
      )
      .subscribe({
        next: (p) => {
          const contenido = (p?.contenido ?? p?.content ?? []) as any[];
          this.rows = contenido.map((r) => {
            const provId = Number(r?.proveedorId ?? r?.proveedor_id ?? -1);
            return {
              id: Number(r?.id ?? r?.compraId ?? -1),
              proveedorId: provId,
              fecha: r?.fecha ?? '',
              referencia: r?.referencia ?? null,
              observaciones: r?.observaciones ?? null,
              proveedorNombre: this.getProveedorNombre(provId),
              total: Number(r?.total ?? 0),
            };
          }) as Compra[];
          this.total = Number(p?.totalRegistros ?? p?.totalElements ?? this.rows.length);
          this.loading = false;
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

  private loadProveedores(): void {
    this.proveedoresApi.listar().subscribe({
      next: (arr) => {
        this.proveedorNombre = new Map(
          (arr ?? []).map((prov: any) => [Number(prov?.id ?? prov?.proveedorId), prov?.nombre ?? ''])
        );
        if (this.rows.length) {
          this.rows = this.rows.map((r) => ({
            ...r,
            proveedorNombre: this.getProveedorNombre(r.proveedorId),
          }));
          this.cdr.markForCheck();
        }
      },
      error: () => {},
    });
  }

  private getProveedorNombre(id: number): string {
    return this.proveedorNombre.get(id) ?? '';
  }

  // Handlers UI
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
