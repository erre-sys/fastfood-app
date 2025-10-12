import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PagosProveedorService } from '../../../../services/pago-proveedor.service';
import { PageLayoutComponent, TitleComponent, TableComponent, SearchComponent, PaginatorComponent } from '../../../../shared';
import { NewActionComponent } from '../../../../shared/ui/buttons/new/new.component';
import { PagoProveedor } from '../../../../interfaces/pago-proveedor.interface';
import { ProveedoresService } from '../../../../services/proveedores.service';
import { ColumnDef } from '../../../../shared/ui/table/column-def';


type Tab = 'all' | 'active' | 'inactive';
type Dir = 'asc' | 'desc';
type TableSort = { key: string; dir: Dir };
type Align = 'left' | 'right' | 'center';

@Component({
  standalone: true,
  selector: 'app-pago-proveedor-list',
  templateUrl: './pago-proveedor.component.html',
  imports: [CommonModule, RouterLink, ReactiveFormsModule,PageLayoutComponent, TitleComponent, TableComponent,SearchComponent, PaginatorComponent, NewActionComponent],
})
export default class PagosProveedorListPage implements OnInit {
  private api = inject(PagosProveedorService);
    private gruposApi = inject(ProveedoresService);

  titleLabel = 'Pagos a proveedores';

   // estado UI
   tab: Tab = 'all';
   sortKey: string = 'id';
   sortDir: Dir = 'asc';
   page = 0;
   pageSize = 10;
 
   loading = false;
   total = 0;
   rows: PagoProveedor[] = [];
 
   searchForm = new FormGroup({
    q: new FormControl<string>('', { nonNullable: true }),
   });

  // columnas
  columns: ColumnDef<PagoProveedor>[] = [
    { key: 'id', header: 'ID', widthPx: 90, sortable: true },
    { key: 'proveedorNombre', header: 'Proveedor', sortable: true },
    { key: 'fecha', header: 'Fecha', widthPx: 160, sortable: true, type: 'date',  format: 'dd/MM/yyyy HH:mm' },
    { key: 'metodo', header: 'Método', widthPx: 130, type: 'badge' },
    { key: 'montoTotal', header: 'Monto', widthPx: 120, align: 'right', sortable: true, type: 'money', currency: 'USD' },
  ];


  proveedorName: any;

  ngOnInit(): void {
    this.loadProveedores();
    this.searchForm.controls.q.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe(() => { this.page = 0; this.load(); });

    this.load();
  }

  private load(): void {
    this.loading = true;

    const filtros: any[] = [];
    if (this.tab === 'active') filtros.push({ llave: 'metodo', operacion: '=', valor: 'EFECTIVO' });
    if (this.tab === 'inactive') filtros.push({ llave: 'metodo', operacion: '=', valor: 'TRANSFERENCIA' });
    
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
          },
      error: () => { this.rows = []; this.total = 0; },
      complete: () => { this.loading = false; },
    });
  }

  private loadProveedores(): void {
    this.gruposApi.listarActivos().subscribe({
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
  setTab(k: Tab) { if (this.tab !== k) { this.tab = k; this.page = 0; this.load(); } }
  onSort(s: TableSort) { if (!s?.key) return; this.sortKey = s.key; this.sortDir = s.dir as Dir; this.page = 0; this.load(); }
  setPageSize(n: number) { if (n > 0 && n !== this.pageSize) { this.pageSize = n; this.page = 0; this.load(); } }
  prev() { if (this.page > 0) { this.page--; this.load(); } }
  next() { if (this.page + 1 < this.maxPage()) { this.page++; this.load(); } }

  maxPage() { return Math.max(1, Math.ceil(this.total / this.pageSize)); }
  from() { return this.total ? this.page * this.pageSize + 1 : 0; }
  to() { return Math.min((this.page + 1) * this.pageSize, this.total); }

  goBack() { history.back(); }
  onSearch(term: string) { this.searchForm.controls.q.setValue(term, { emitEvent: true }); }
}


