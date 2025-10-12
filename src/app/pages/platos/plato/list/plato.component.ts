import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { PlatoService } from '../../../../services/plato.service';
import { GrupoPlatoService } from '../../../../services/grupo-plato.service';

import { PageLayoutComponent } from '../../../../shared/ui/page-layout/page-layout.component';
import { TitleComponent } from '../../../../shared/ui/title/title.component';
import { TableComponent } from '../../../../shared/ui/table/table.component';
import { SearchComponent } from '../../../../shared/ui/searchbox/search.component';
import { PaginatorComponent } from '../../../../shared/ui/paginator/paginator.component';
import { EditActionComponent } from '../../../../shared/ui/buttons/edit/edit.component';
import { NewActionComponent } from '../../../../shared/ui/buttons/new/new.component';

type Tab = 'all' | 'active' | 'inactive';
type Dir = 'asc' | 'desc';
type TableSort = { key: string; dir: Dir };
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

interface Row {
  id: number;
  codigo: string;
  nombre: string;
  grupoPlatoId: number;
  grupoNombre: string;
  precioBase: string;
  descuentoPct: string; 
  enPromocion: 'S' | 'N';
  estado: 'A' | 'I';
}

@Component({
  selector: 'app-platos-list',
  standalone: true,
  imports: [ CommonModule, RouterLink, ReactiveFormsModule, PageLayoutComponent, TitleComponent, TableComponent, SearchComponent, PaginatorComponent, EditActionComponent, NewActionComponent],
  templateUrl: './plato.component.html',
})
export default class PlatosListPage implements OnInit {
  private api = inject(PlatoService);
  private gruposApi = inject(GrupoPlatoService);

  titleLabel = 'Platos';

  // estado UI
  tab: Tab = 'all';
  loading = false;
  total = 0;
  rows: Row[] = [];

  // paginado + orden
  page = 0;
  pageSize = 10;
  sortKey: string = 'nombre';
  sortDir: Dir = 'asc';

  // cache de grupos
  private groupName = new Map<number, string>();

  // formateador USD
  private stringToUSD = new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  searchForm = new FormGroup({
    q: new FormControl<string>('', { nonNullable: true }),
  });

  columns: ColumnDef<Row>[] = [
    { key: 'nombre', header: 'Nombre', sortable: true },
    { key: 'grupoNombre', header: 'Grupo', widthPx: 160 },
    { key: 'precioBase', header: 'Precio', widthPx: 100, align: 'right' },
    { key: 'descuentoPct', header: 'Descuento', widthPx: 100, align: 'right' },
    {
      key: 'enPromocion',
      header: 'Promoción',
      widthPx: 120,
      align: 'center',
      type: 'badge',
      badgeMap: { S: 'ok', N: 'warn' },
      valueMap: { S: 'Sí', N: 'No' },
    },
    {
      key: 'estado',
      header: 'Estado',
      widthPx: 120,
      align: 'center',
      type: 'badge',
      badgeMap: { A: 'ok', I: 'warn' },
      valueMap: { A: 'Activo', I: 'Inactivo' },
    },
  ];

  ngOnInit(): void {
    this.loadGroups();

    this.searchForm.controls.q.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe(() => { this.page = 0; this.load(); });

    this.load();
  }

  private load(): void {
    this.loading = true;

    const filtros: any[] = [];
    if (this.tab === 'active')   filtros.push({ llave: 'estado', operacion: '=', valor: 'A' });
    if (this.tab === 'inactive') filtros.push({ llave: 'estado', operacion: '=', valor: 'I' });

    const term = this.searchForm.controls.q.value.trim();
    if (term) {
      filtros.push({ llave: 'nombre', operacion: 'LIKE', valor: term });
      const n = Number(term);
      if (!Number.isNaN(n)) filtros.push({ llave: 'id', operacion: 'EQ', valor: n });
    }

    this.api.buscarPaginado(
      { page: this.page, size: this.pageSize, sortBy: this.mapSortKeyForApi(this.sortKey), direction: this.sortDir },
      filtros
    ).subscribe({
      next: p => {
        const contenido = (p?.contenido ?? p?.content ?? []) as any[];

        this.rows = (contenido ?? []).map(r => {
          const id  = Number(r?.id ?? r?.platoId ?? r?.plato_id ?? -1);
          const gid = Number(r?.grupoPlatoId ?? r?.grupo_plato_id ?? -1);
          const precioNum    = Number(r?.precioBase ?? r?.precio_base ?? 0);
          const descuentoNum = Number(r?.descuentoPct ?? r?.descuento_pct ?? 0); // monto en USD

          return {
            id,
            codigo: r?.codigo ?? '',
            nombre: r?.nombre ?? '',
            grupoPlatoId: gid,
            grupoNombre: this.groupName.get(gid) ?? '',
            precioBase: this.stringToUSD.format(precioNum),
            descuentoPct: this.stringToUSD.format(descuentoNum),
            enPromocion: (r?.enPromocion ?? r?.en_promocion ?? 'N') as 'S' | 'N',
            estado: (r?.estado ?? 'A') as 'A' | 'I',
          };
        });

        this.total = Number(p?.totalRegistros ?? p?.totalElements ?? this.rows.length);
      },
      error: () => { this.rows = []; this.total = 0; },
      complete: () => { this.loading = false; },
    });
  }

  private loadGroups(): void {
    this.gruposApi.listar().subscribe({
      next: (arr: any[]) => {
        this.groupName = new Map(
          (arr ?? []).map(g => [Number(g?.grupo_plato_id ?? g?.id ?? g?.grupoPlatoId), g?.nombre ?? ''])
        );

        // si ya había filas, rehidrata el nombre de grupo correctamente
        if (this.rows.length) {
          this.rows = this.rows.map(r => ({
            ...r,
            grupoNombre: this.groupName.get(r.grupoPlatoId) ?? r.grupoNombre,
          }));
        }
      },
      error: () => { /* opcional: toast */ },
    });
  }

  // Handlers UI
  setTab(k: Tab) { if (this.tab !== k) { this.tab = k; this.page = 0; this.load(); } }
  onSort(s: TableSort) { if (!s?.key) return; this.sortKey = s.key; this.sortDir = s.dir as Dir; this.page = 0; this.load(); }
  setPageSize(n: number) { if (n > 0 && n !== this.pageSize) { this.pageSize = n; this.page = 0; this.load(); } }
  prev() { if (this.page > 0) { this.page--; this.load(); } }
  next() { if (this.page + 1 < this.maxPage()) { this.page++; this.load(); } }

  maxPage() { return Math.max(1, Math.ceil(this.total / this.pageSize)); }
  from()    { return this.total ? this.page * this.pageSize + 1 : 0; }
  to()      { return Math.min((this.page + 1) * this.pageSize, this.total); }

  goBack() { history.back(); }
  onSearch(term: string) { this.searchForm.controls.q.setValue(term, { emitEvent: true }); }

  private mapSortKeyForApi(k: string): string {
    // si algún header muestra un valor derivado, aquí lo traduces al campo real de DB
    if (k === 'grupoNombre') return 'grupoPlatoId';
    return k; // nombre, precioBase, descuentoPct, estado, enPromocion ya coinciden
  }
}
