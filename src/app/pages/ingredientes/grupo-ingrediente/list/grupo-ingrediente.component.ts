import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { GrupoIngredienteService } from '../../../../services/grupo-ingrediente.service';

import { PageLayoutComponent } from '../../../../shared/ui/page-layout/page-layout.component';
import { TitleComponent } from '../../../../shared/ui/title/title.component';
import { TableComponent } from '../../../../shared/ui/table/table.component';
import { SearchComponent } from '../../../../shared/ui/searchbox/search.component';
import { PaginatorComponent } from '../../../../shared/ui/paginator/paginator.component';
import { EditActionComponent } from '../../../../shared/ui/edit/edit.component';

type Tab = 'all' | 'active' | 'inactive';
type Dir = 'asc' | 'desc';

type TableSort = { key: string; dir: 'asc' | 'desc' };
type TableColumn<Row> = {
  key: keyof Row | string;
  header: string;
  widthPx?: number;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  type?: 'text' | 'badge';
  badgeMap?: Record<string, 'ok' | 'warn' | 'danger' | 'muted'>;
};

interface Row {
  id: number;
  nombre: string;
  estado: 'A' | 'I';
}

type Operacion = '=' | 'LIKE' | 'NE' | 'GT' | 'LT' | 'GE' | 'LE' | 'IN';
type CriterioBusqueda = {
  llave: 'id' | 'nombre' | 'estado';
  operacion: Operacion;
  valor?: any;
  valores?: any[];
};


@Component({
  selector: 'app-grupo-ingrediente-list',
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
    EditActionComponent,
  ],
  templateUrl: './grupo-ingrediente.component.html',
})
export default class GrupoIngredienteListPage implements OnInit {
  private api = inject(GrupoIngredienteService);

  // estado base
  loading = signal(true);
  total = signal(0);
  rows = signal<Row[]>([]);

  // ui
  tab = signal<Tab>('all');
  sortKey = signal<string>('id');
  sortDir = signal<Dir>('asc');
  page = signal(0);
  pageSize = signal(10);

  // búsqueda (si prefieres solo <app-search>, igual alimenta este control)
  searchForm = new FormGroup({
    q: new FormControl<string>('', { nonNullable: true }),
  });

  titleLabel = 'Grupos de ingredientes';

  // columnas para <app-table>
  columns: TableColumn<Row>[] = [
    { key: 'id', header: 'ID', widthPx: 96, sortable: true, align: 'left' },
    { key: 'nombre', header: 'Nombre', sortable: true },
    {
      key: 'estado',
      header: 'Estado',
      widthPx: 160,
      sortable: true,
      type: 'badge',
      badgeMap: { A: 'ok', I: 'warn' },
    },
  ];

  ngOnInit(): void {
    this.searchForm.controls.q.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe(() => {
        this.page.set(0);
        this.load();
      });

    this.load();
  }

  // --- helpers
  private pickId(r: any): number {
    const keys = [
      'grupoIngredienteId',
      'grupo_ingrediente_id',
      'id',
      'grupoIngrediente_id',
      'grupo_ingredienteId',
    ];
    for (const k of keys) {
      const v = r?.[k];
      if (v !== null && v !== undefined && !Number.isNaN(Number(v)))
        return Number(v);
    }
    return -1;
  }
  private normalize(arr: any[]): Row[] {
    return (arr ?? []).map((r) => ({
      id: this.pickId(r),
      nombre: r?.nombre ?? '',
      estado: (r?.estado ?? 'A') as 'A' | 'I',
    }));
  }

  
  // --- carga server-side
  load(): void {
    this.loading.set(true);

    const filtros: CriterioBusqueda[] = [];

    if (this.tab() === 'active')
      filtros.push({ llave: 'estado', operacion: '=', valor: 'A' });

    if (this.tab() === 'inactive')
      filtros.push({ llave: 'estado', operacion: '=', valor: 'I' });

    const term = this.searchForm.controls.q.value.trim();
    if (term) {
      filtros.push({ llave: 'nombre', operacion: 'LIKE', valor: term });
      const n = Number(term);
      if (!Number.isNaN(n))
        filtros.push({ llave: 'id', operacion: '=', valor: n });
    }

    const pager = {
      page: this.page(),
      size: this.pageSize(),
      sortBy: this.sortKey(), // 'id' | 'nombre' | 'estado'
      direction: this.sortDir(),
    };

    this.api.buscarPaginado(pager as any, filtros).subscribe({
      next: (p) => {
        const contenido = this.normalize(p?.contenido ?? p?.content ?? []);
        this.rows.set(contenido);
        this.total.set(
          Number(p?.totalRegistros ?? p?.totalElements ?? contenido.length)
        );
      },
      error: (e) => {
        console.error('Error /search', { filtros, pager, e });
        this.rows.set([]);
        this.total.set(0);
      },
      complete: () => this.loading.set(false),
    });
  }

  // --- handlers
  setTab(k: Tab) {
    if (this.tab() !== k) {
      this.tab.set(k);
      this.page.set(0);
      this.load();
    }
  }

  onSort(s: TableSort) {
    if (!s?.key) return;
    this.sortKey.set(s.key);
    this.sortDir.set((s.dir ?? 'asc') as Dir);
    this.page.set(0);
    this.load();
  }

  setPageSize(n: number) {
    if (n > 0 && n !== this.pageSize()) {
      this.pageSize.set(n);
      this.page.set(0);
      this.load();
    }
  }
  prev() {
    if (this.page() > 0) {
      this.page.update((v) => v - 1);
      this.load();
    }
  }
  next() {
    if (this.page() + 1 < this.maxPage()) {
      this.page.update((v) => v + 1);
      this.load();
    }
  }

  maxPage() {
    return Math.max(1, Math.ceil(this.total() / this.pageSize()));
  }
  from() {
    return this.total() ? this.page() * this.pageSize() + 1 : 0;
  }
  to() {
    return Math.min((this.page() + 1) * this.pageSize(), this.total());
  }

  goBack() {
    history.back();
  }

  // para <app-search>
  onSearch(term: string) {
    this.searchForm.controls.q.setValue(term, { emitEvent: true });
  }
}
