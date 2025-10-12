import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import { Ingrediente, IngredienteService } from '../../../../services/ingrediente.service';
import { GrupoIngredienteService } from '../../../../services/grupo-ingrediente.service';

import { PageLayoutComponent } from '../../../../shared/ui/page-layout/page-layout.component';
import { TitleComponent } from '../../../../shared/ui/fields/title/title.component';
import { TableComponent } from '../../../../shared/ui/table/table.component';
import { SearchComponent } from '../../../../shared/ui/fields/searchbox/search.component';
import { PaginatorComponent } from '../../../../shared/ui/paginator/paginator.component';
import { EditActionComponent } from '../../../../shared/ui/buttons/edit/edit.component';
import { TabsFilterComponent } from '../../../../shared/ui/tabs-filter/tabs-filter.component';
import { UiButtonComponent } from '../../../../shared/ui/buttons/ui-button/ui-button.component';
import { LucideAngularModule, Pencil, Plus } from 'lucide-angular';
import { Proveedor } from '../../../../interfaces/proveedor.interface';
import { TabStatus, Dir, ColumnDef, TableSort } from '../../../../shared/ui/table/column-def';

@Component({
  selector: 'app-ingredientes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, PageLayoutComponent,
    TitleComponent, TableComponent, SearchComponent, PaginatorComponent, EditActionComponent, 
    LucideAngularModule, UiButtonComponent, TabsFilterComponent],
  templateUrl: './ingrediente.component.html',
})

export default class IngredientesListPage implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  private api = inject(IngredienteService);
  private gruposApi = inject(GrupoIngredienteService);
  private cdr = inject(ChangeDetectorRef); 

  titleLabel = 'Ingredientes';
  subTitleLabel = 'Administración de ingredientes';

  // UI
  tab: TabStatus = 'all';
  sortKey: string = 'id';
  sortDir: Dir = 'asc';
  page = 0;
  pageSize = 10;

  loading = false;
  total = 0;
  rows: Ingrediente[] = [];

  // Íconos
  Pencil = Pencil;
  Plus = Plus;

  searchForm = new FormGroup({
    q: new FormControl<string>('', { nonNullable: true }),
  });

  columns: ColumnDef<Ingrediente>[] = [
    { key: 'nombre', header: 'Nombre', sortable: true },
    { key: 'grupoNombre', header: 'Grupo', widthPx: 220 },
    { key: 'unidad', header: 'Unidad', widthPx: 120, align: 'center' },
    {key: 'esExtra', header: 'Extra', widthPx: 110, align: 'center',
      type: 'badge', badgeMap: { S: 'ok', N: 'muted' }, valueMap: { S: 'Sí', N: 'No' } },
    {key: 'aplicaComida', header: 'Aplica Comida', widthPx: 150, align: 'center',
      type: 'badge', badgeMap: { S: 'ok', N: 'muted' }, valueMap: { S: 'Sí', N: 'No' } },
    {key: 'estado', header: 'Estado', widthPx: 120, align: 'center',
      type: 'badge', badgeMap: { A: 'ok', I: 'warn' }, valueMap: { A: 'Activo', I: 'Inactivo' } }
  ];
  nombreGrupo: any;
  
  counters = { all: 0, active: undefined as number | undefined, inactive: undefined as number | undefined }

  ngOnInit(): void {
    this.loadGroups();

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
        const contenido = (p?.contenido ?? p?.content ?? []) as any[];
        this.rows = contenido.map(r => ({
          id: (r?.id ?? r?.ingredienteId ?? r?.ingrediente_id) ?? -1,
          codigo: r?.codigo ?? '',
          nombre: r?.nombre ?? '',
          grupoIngredienteId: r?.grupoIngredienteId ?? r?.grupo_ingrediente_id ?? -1,
          unidad: r?.unidad ?? null,
          esExtra: (r?.esExtra ?? r?.es_extra ?? 'N'),
          aplicaComida: (r?.aplicaComida ?? r?.aplica_comida ?? 'N'),
          precioExtra: r?.precioExtra ?? r?.precio_extra ?? null,
          stockMinimo: r?.stockMinimo ?? r?.stock_minimo ?? null,
          estado: (r?.estado ?? 'A'),
          grupoNombre: this.nombreGrupo?.get(r?.grupoIngredienteId ?? r?.grupo_ingrediente_id ?? -1) ?? '',
        })) as Ingrediente[];
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

  private loadGroups(): void {
    this.gruposApi.listar().subscribe({
      next: (arr) => {
        this.nombreGrupo = new Map(
          (arr ?? []).map((g: any) => [
            Number(g?.grupo_ingrediente_id ?? g?.id ?? g?.grupoIngredienteId),
            g?.nombre ?? '',
          ])
        );
        if (this.rows.length) {
          this.rows = this.rows.map(r => ({
            ...r,
            grupoNombre: this.nombreGrupo.get(r.id) ?? r.nombre,
          }));
        }
      },
      error: () => {  },
    });
  }

  // ---- UI handlers
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

  onEdit(row: Proveedor) { }
}