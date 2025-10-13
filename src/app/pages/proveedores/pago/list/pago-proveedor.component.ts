import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { PagosProveedorService } from '../../../../services/pago-proveedor.service';
import { PageLayoutComponent, TitleComponent, TableComponent, SearchComponent, PaginatorComponent } from '../../../../shared';
import { PagoProveedor } from '../../../../interfaces/pago-proveedor.interface';
import { ProveedoresService } from '../../../../services/proveedores.service';
import { ColumnDef, Dir, TableSort, TabStatus } from '../../../../shared/ui/table/column-def';
import { UiButtonComponent } from '../../../../shared/ui/buttons/ui-button/ui-button.component';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { TabsFilterComponent } from '../../../../shared/ui/tabs-filter/tabs-filter.component';

@Component({
  standalone: true,
  selector: 'app-pago-proveedor-list',
  templateUrl: './pago-proveedor.component.html',
  imports: [CommonModule, RouterLink, ReactiveFormsModule,LucideAngularModule, PageLayoutComponent, 
            TitleComponent, TableComponent,SearchComponent, PaginatorComponent, UiButtonComponent, TabsFilterComponent],
})

export default class PagosProveedorListPage implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  private api = inject(PagosProveedorService);
  private proveedoresApi = inject(ProveedoresService);
  private cdr = inject(ChangeDetectorRef);  

  titleLabel = 'Pagos a proveedores';
  subTitleLabel = 'Administración de pagos a proveedores';

  // UI
  tab: TabStatus = 'all';
  sortKey: string = 'id';
  sortDir: Dir = 'asc';
  page = 0;
  pageSize = 10;

  loading = false;
  total = 0;
  rows: PagoProveedor[] = [];

  // Íconos
  Plus = Plus;
 
   searchForm = new FormGroup({
    q: new FormControl<string>('', { nonNullable: true }),
   });

  // columnas
  columns: ColumnDef<PagoProveedor>[] = [
    { key: 'proveedorNombre', header: 'Proveedor', sortable: true },
    { key: 'fecha', header: 'Fecha', widthPx: 160, sortable: true, type: 'date',  format: 'dd/MM/yyyy HH:mm' },
    { key: 'metodo', header: 'Método', widthPx: 130, type: 'badge' },
    { key: 'montoTotal', header: 'Monto', widthPx: 120, align: 'right', sortable: true, type: 'money', currency: 'USD' },
  ];

  counters = { all: 0, active: undefined as number | undefined, inactive: undefined as number | undefined };
  proveedorName: any;

  ngOnInit(): void {
    this.loadProveedores();
    this.searchForm.controls.q.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe(() => { this.page = 0; this.load(); });
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
    if (this.tab === 'efectivo') filtros.push({ llave: 'metodo', operacion: '=', valor: 'EFECTIVO' });
    if (this.tab === 'transfer') filtros.push({ llave: 'metodo', operacion: '=', valor: 'TRANSFERENCIA' });
    
    const term = this.searchForm.controls.q.value.trim();
    if (term) {
      filtros.push({ llave: 'referencia', operacion: 'LIKE', valor: term });
      filtros.push({ llave: 'proveedorNombre', operacion: 'LIKE', valor: term });
      const n = Number(term);
      if (!Number.isNaN(n)) {
        filtros.push({ llave: 'id', operacion: 'EQ', valor: n });
        filtros.push({ llave: 'proveedorId', operacion: 'EQ', valor: n });
      }
    }

    this.api.buscarPaginado(
      { page: this.page, size: this.pageSize, sortBy: this.sortKey, direction: this.sortDir },
      filtros
    ).subscribe({
          next: p => {
            const contenido = (p?.contenido ?? []) as any[];
            this.rows = contenido.map(r => ({
              id: (r?.id ?? r?.proveedorId ?? r?.proveedor_id) ?? -1,
              proveedorId: r?.proveedorId ?? r?.proveedor_id ?? -1,
              fecha: r.fecha,
              montoTotal: Number(r?.montoTotal ?? r?.monto_total ?? r?.monto ?? 0),
              metodo: r?.metodo ?? '',
              referencia:r?.referencia,
              proveedorNombre: this.proveedorName?.get(r?.proveedorId ?? r?.proveedor_id ?? -1) ?? '',
            })) as PagoProveedor[];
            this.total = Number(p?.totalRegistros ?? this.rows.length);
            this.counters.all = this.total;
            this.cdr.markForCheck();
          },
      error: () => {
        this.rows = []; this.total = 0;
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
    this.proveedoresApi.listarActivos().subscribe({
      next: (arr) => {
        this.proveedorName = new Map(
          (arr ?? []).map((p: any) => [
            Number(p?.id ?? p?.proveedorId ?? p?.proveedor_id),
            (p?.nombre ?? p?.razonSocial ?? '').toString(),
          ])
        );
        if (this.rows.length) {
          this.rows = this.rows.map(r => ({
            ...r,
            proveedorNombre: this.proveedorName.get(r.proveedorId) ?? r.proveedorNombre,
          }));
        }
      },
    });
  }

  // handlers UI
  setTab(k: TabStatus) { if (this.tab !== k) { this.tab = k; this.page = 0; this.load(); } }
  onSort(s: TableSort) { if (!s?.key) return; this.sortKey = s.key; this.sortDir = s.dir as Dir; this.page = 0; this.load(); }
  setPageSize(n: number) { if (n > 0 && n !== this.pageSize) { this.pageSize = n; this.page = 0; this.load(); } }
  prev() { if (this.page > 0) { this.page--; this.load(); } }
  next() { if (this.page + 1 < this.maxPage()) { this.page++; this.load(); } }

  maxPage() { return Math.max(1, Math.ceil(this.total / this.pageSize)); }
  from() { return this.total ? this.page * this.pageSize + 1 : 0; }
  to() { return Math.min((this.page + 1) * this.pageSize, this.total); }

  goBack() { history.back(); }
  onSearch(term: string) { this.searchForm.controls.q.setValue(term, { emitEvent: true }); }
  
  onEdit(row: PagoProveedor) { /* future: drawer/modal */ }
}


