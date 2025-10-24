import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PlatoService } from '../../../../services/plato.service';
import { GrupoPlatoService } from '../../../../services/grupo-plato.service';

import { PageLayoutComponent } from '../../../../shared/ui/page-layout/page-layout.component';
import { TitleComponent } from '../../../../shared/ui/fields/title/title.component';
import { TableComponent } from '../../../../shared/ui/table/table.component';
import { SearchComponent } from '../../../../shared/ui/fields/searchbox/search.component';
import { PaginatorComponent } from '../../../../shared/ui/paginator/paginator.component';
import { LucideAngularModule, Pencil, Plus, ChefHat } from 'lucide-angular';
import { UiButtonComponent } from '../../../../shared/ui/buttons/ui-button/ui-button.component';
import { TabsFilterComponent } from '../../../../shared/ui/tabs-filter/tabs-filter.component';
import { ColumnDef, Dir, TableSort, TabStatus } from '../../../../shared/ui/table/column-def';
import { Plato } from '../../../../interfaces/plato.interface';

@Component({
  selector: 'app-platos-list',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule,
    PageLayoutComponent, TitleComponent, TableComponent, SearchComponent, PaginatorComponent,
    LucideAngularModule, UiButtonComponent, TabsFilterComponent],
  templateUrl: './plato.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export default class PlatosListPage implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>(); 
  private api = inject(PlatoService);
  private gruposApi = inject(GrupoPlatoService);
  private cdr = inject(ChangeDetectorRef);  

  titleLabel = 'Platos';
  subTitleLabel = 'Administración de platos';

  // UI
  tab: TabStatus = 'all';
  sortKey: string = 'id';
  sortDir: Dir = 'asc';
  page = 0;
  pageSize = 10;
  
  loading = false;
  total = 0;
  rows: Plato[] = [];
  
  // Íconos
  Pencil = Pencil;
  Plus = Plus;
  ChefHat = ChefHat;
  
  searchForm = new FormGroup({
    q: new FormControl<string>('', { nonNullable: true }),
  });

  columns: ColumnDef<Plato>[] = [
    { key: 'nombre', header: 'Nombre', sortable: true },
    { key: 'grupoNombre', header: 'Grupo', sortable: true, widthPx: 180 },
    { key: 'precioBase', header: 'Precio', widthPx: 100, align: 'right', type: 'money' },
    { key: 'enPromocion', header: 'Promoción', widthPx: 120, align: 'center',
      type: 'badge', badgeMap: { S: 'ok', N: 'muted' }, valueMap: { S: 'Sí', N: 'No' } },
    { key: 'estado', header: 'Estado', widthPx: 120, align: 'center',
      type: 'badge', badgeMap: { A: 'ok', I: 'warn' }, valueMap: { A: 'Activo', I: 'Inactivo' } },
  ];

  nombreGrupo: any;
  counters = { all: 0, active: undefined as number | undefined, inactive: undefined as number | undefined };

  ngOnInit(): void {
    this.loadGroups();
      this.searchForm.controls.q.valueChanges
        .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroyed$))
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
    if (this.tab === 'active')   filtros.push({ llave: 'estado', operacion: '=', valor: 'A' });
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
                this.rows = contenido.map(r => {
                  return {
                    id: (r?.id ?? r?.proveedorId ?? r?.proveedor_id) ?? -1,
                    codigo: r?.codigo ?? '',
                    nombre: r?.nombre ?? '',
                    grupoPlatoId: r?.grupoPlatoId ?? r?.grupo_plato_id,
                    precioBase: Number(r?.precioBase ?? r?.precio_base ?? r?.monto ?? 0),
                    enPromocion: (r?.enPromocion ?? r?.en_promocion ?? 'N') as 'S' | 'N',
                    estado: (r?.estado ?? 'A') as 'A' | 'I',
                    grupoNombre: this.nombreGrupo?.get(r?.grupoPlatoId ?? r?.grupo_plato_id ?? -1) ?? '',
                  } as any;
                }) as Plato[];
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

  // Handlers UI
  setTab(k: TabStatus) { if (this.tab !== k) { this.tab = k; this.page = 0; this.load(); } }
  onSort(s: TableSort) { if (!s?.key) return; this.sortKey = s.key; this.sortDir = s.dir as Dir; this.page = 0; this.load(); }
  setPageSize(n: number) { if (n > 0 && n !== this.pageSize) { this.pageSize = n; this.page = 0; this.load(); } }
  prev() { if (this.page > 0) { this.page--; this.load(); } }
  next() { if (this.page + 1 < this.maxPage()) { this.page++; this.load(); } }

  maxPage() { return Math.max(1, Math.ceil(this.total / this.pageSize)); }
  from()    { return this.total ? this.page * this.pageSize + 1 : 0; }
  to()      { return Math.min((this.page + 1) * this.pageSize, this.total); }

  goBack() { history.back(); }
  onSearch(term: string) { this.searchForm.controls.q.setValue(term, { emitEvent: true }); }
}