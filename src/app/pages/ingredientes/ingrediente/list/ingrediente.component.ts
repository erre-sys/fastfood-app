import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IngredienteService } from '../../../../services/ingrediente.service';
import { GrupoIngredienteService } from '../../../../services/grupo-ingrediente.service';
import { UNIDAD_MAP } from '../../../../shared/constants/unidades.const';
import { BaseListComponent } from '../../../../shared/base/base-list.component';

import { PageLayoutComponent } from '../../../../shared/ui/page-layout/page-layout.component';
import { TitleComponent } from '../../../../shared/ui/fields/title/title.component';
import { TableComponent } from '../../../../shared/ui/table/table.component';
import { SearchComponent } from '../../../../shared/ui/fields/searchbox/search.component';
import { PaginatorComponent } from '../../../../shared/ui/paginator/paginator.component';
import { TabsFilterComponent } from '../../../../shared/ui/tabs-filter/tabs-filter.component';
import { UiButtonComponent } from '../../../../shared/ui/buttons/ui-button/ui-button.component';
import { LucideAngularModule, Pencil, Plus } from 'lucide-angular';
import { TabStatus, ColumnDef } from '../../../../shared/ui/table/column-def';
import { Ingrediente } from '../../../../interfaces/ingrediente.interface';

@Component({
  selector: 'app-ingredientes-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageLayoutComponent,
    TitleComponent, TableComponent, SearchComponent, PaginatorComponent,
    LucideAngularModule, UiButtonComponent, TabsFilterComponent],
  templateUrl: './ingrediente.component.html',
})

export default class IngredientesListPage extends BaseListComponent implements OnInit {
  private api = inject(IngredienteService);
  private gruposApi = inject(GrupoIngredienteService);
  private cdr = inject(ChangeDetectorRef);

  titleLabel = 'Ingredientes';
  subTitleLabel = 'Administración de ingredientes';

  // UI
  tab: TabStatus = 'all';
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
    { key: 'unidad', header: 'Unidad', widthPx: 140, align: 'center',
      valueMap: UNIDAD_MAP },
    {key: 'esExtra', header: 'Extra', widthPx: 110, align: 'center',
      type: 'badge', badgeMap: { S: 'ok', N: 'muted' }, valueMap: { S: 'Sí', N: 'No' } },
    {key: 'estado', header: 'Estado', widthPx: 120, align: 'center',
      type: 'badge', badgeMap: { A: 'ok', I: 'warn' }, valueMap: { A: 'Activo', I: 'Inactivo' } }
  ];
  nombreGrupo: any;
  
  counters = { all: 0, active: undefined as number | undefined, inactive: undefined as number | undefined }

  ngOnInit(): void {
    this.loadGroups();

    this.searchForm.controls.q.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroyed$))
      .subscribe(() => { this.page = 0; this.load(); });

    this.load();
  }

  protected override load(): void {
    this.loading = true;
     this.cdr.markForCheck(); 

    const filtros: any[] = [];
    if (this.tab === 'active') filtros.push({ llave: 'estado', operacion: '=', valor: 'A' });
    if (this.tab === 'inactive') filtros.push({ llave: 'estado', operacion: '=', valor: 'I' });

    const term = this.searchForm.controls.q.value.trim();
    if (term) {
      const n = Number(term);
      if (!Number.isNaN(n) && n > 0) {
        // Si es un número válido, buscar solo por ID
        filtros.push({ llave: 'id', operacion: '=', valor: n });
      } else {
        // Si no es un número, buscar por nombre
        filtros.push({ llave: 'nombre', operacion: 'LIKE', valor: term });
      }
    }

    this.api.buscarPaginado(
      { page: this.page, size: this.pageSize, orderBy: this.sortKey, direction: this.sortDir },
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
  onSearch(term: string) { this.searchForm.controls.q.setValue(term, { emitEvent: true }); }
}