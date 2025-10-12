import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Proveedor} from '../../../../interfaces/proveedor.interface';
import { ProveedoresService } from '../../../../services/proveedores.service';
import { EditActionComponent } from '../../../../shared/ui/buttons/edit/edit.component';
import { NewActionComponent } from '../../../../shared/ui/buttons/new/new.component';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PageLayoutComponent, TitleComponent, TableComponent, SearchComponent, PaginatorComponent } from '../../../../shared';
import { PayActionComponent } from "../../../../shared/ui/buttons/pay/pay.component";

type Tab = 'all' | 'active' | 'inactive';
type Dir = 'asc' | 'desc';
type TableSort = { key: string; dir: 'asc' | 'desc' };
type Align = 'left' | 'right' | 'center';

type ColumnDef<Row> = {
  key: keyof Row | string;
  header: string;
  widthPx?: number;
  sortable?: boolean;
  align?: Align;
  type?: 'text' | 'badge';
  badgeMap?: Record<string, 'ok' | 'warn' | 'muted' | 'danger'>;
  valueMap?: Record<string, string>;
};

@Component({
  selector: 'app-proveedores-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, PageLayoutComponent, TitleComponent, TableComponent, SearchComponent, PaginatorComponent, EditActionComponent, NewActionComponent, PayActionComponent],
  templateUrl: './proveedor.component.html'
})
export default class ProveedoresListPage implements OnInit {
  private api = inject(ProveedoresService);

  titleLabel = 'Proveedores';

  // estado UI
  tab: Tab = 'all';
  sortKey: string = 'id';
  sortDir: Dir = 'asc';
  page = 0;
  pageSize = 10;

  loading = false;
  total = 0;
  rows: Proveedor[] = [];

  searchForm = new FormGroup({
    q: new FormControl<string>('', { nonNullable: true }),
  });

  columns: ColumnDef<Proveedor>[] = [
    { key: 'id', header: 'ID', widthPx: 96, sortable: true },
    { key: 'nombre', header: 'Nombre', sortable: true },
    { key: 'ruc', header: 'RUC / Cédula', sortable: true },
    { key: 'telefono', header: '# Teléfono', sortable: true },
    {key: 'estado', header: 'Estado',widthPx: 140,sortable: true,type: 'badge',
      badgeMap: { A: 'ok', I: 'warn' }, valueMap: { A: 'Activo', I: 'Inactivo' },align: 'center',},
  ];

  ngOnInit(): void {
    this.searchForm.controls.q.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe(() => { this.page = 0; this.load(); });

    this.load();
  }

  private load(): void {
    this.loading = true;

    const filtros: any[] = [];
    if (this.tab === 'active') filtros.push({ llave: 'estado', operacion: '=', valor: 'A' });
    if (this.tab === 'inactive') filtros.push({ llave: 'estado', operacion: '=', valor: 'I' });

    const term = this.searchForm.controls.q.value.trim();
    if (term) {
      filtros.push({ llave: 'nombre', operacion: 'LIKE', valor: term });
      const n = Number(term);
      if (!Number.isNaN(n)) filtros.push({ llave: 'id', operacion: 'EQ', valor: n });
    }

    this.api.buscarPaginado(
      { page: this.page, size: this.pageSize, sortBy: this.sortKey, direction: this.sortDir },
      filtros
    ).subscribe({
      next: p => {
        const contenido = (p?.contenido ?? []) as any[];
        this.rows = contenido.map(r => ({
          id: (r?.id ?? r?.proveedorId ?? r?.proveedor_id) ?? -1,
          nombre: r?.nombre ?? '',
          ruc:  r?.ruc ?? '',
          telefono: r?.telefono ?? '',
          email: r?.mail ?? '',
          estado: (r?.estado ?? 'A'),
        })) as Proveedor[];
        this.total = Number(p?.totalRegistros ?? this.rows.length);
      },
      error: () => { this.rows = []; this.total = 0; },
      complete: () => { this.loading = false; },
    });
  }

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
