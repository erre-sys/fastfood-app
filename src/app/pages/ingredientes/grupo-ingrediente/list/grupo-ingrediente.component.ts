import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PageLayoutComponent, TitleComponent, TableComponent, SearchComponent, PaginatorComponent } from '../../../../shared';
import { LucideAngularModule, Banknote, Pencil, Plus } from 'lucide-angular';
import { UiButtonComponent } from '../../../../shared/ui/buttons/ui-button/ui-button.component';
import { TabsFilterComponent } from '../../../../shared/ui/tabs-filter/tabs-filter.component';
import { ColumnDef, TabStatus } from '../../../../shared/ui/table/column-def';
import { GrupoIngrediente } from '../../../../interfaces/grupo-ingrediente.interface';
import { GrupoIngredienteService } from '../../../../services/grupo-ingrediente.service';
import { BaseListComponent } from '../../../../shared/base/base-list.component';

@Component({
  selector: 'app-grupos-list',
  standalone: true,
  imports: [ CommonModule, RouterLink, ReactiveFormsModule,
    PageLayoutComponent, TitleComponent, TableComponent, SearchComponent, PaginatorComponent,
    LucideAngularModule, UiButtonComponent, TabsFilterComponent ],
  templateUrl: './grupo-ingrediente.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export default class GrupoIngredientesListPage extends BaseListComponent implements OnInit {
  private api = inject(GrupoIngredienteService);
  private cdr = inject(ChangeDetectorRef);

  titleLabel = 'Grupos de ingredientes';
  subTitleLabel = 'Administración de grupo de ingredientes';

  // UI
  tab: TabStatus = 'all';
  rows: GrupoIngrediente[] = [];

  // Íconos
  Plus = Plus;
  Pencil = Pencil;

  searchForm = new FormGroup({
    q: new FormControl<string>('', { nonNullable: true }),
  });

  columns: ColumnDef<GrupoIngrediente>[] = [
    { key: 'id', header: 'ID', widthPx: 96, sortable: true },
    { key: 'nombre', header: 'Nombre', sortable: true },
    {key: 'aplicaComida',header: 'Aplica Comida',widthPx: 180,sortable: true,type: 'badge',
      badgeMap: { S: 'ok', N: 'muted' },valueMap: { S: 'Sí', N: 'No' },align: 'center',},
    {key: 'estado', header: 'Estado',widthPx: 140,sortable: true,type: 'badge',
      badgeMap: { A: 'ok', I: 'warn' }, valueMap: { A: 'Activo', I: 'Inactivo' },align: 'center',},
  ];

  counters = { all: 0, active: undefined as number | undefined, inactive: undefined as number | undefined };

  ngOnInit(): void {
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
          id: (r?.id ?? r?.grupoIngredienteId ?? r?.grupo_ingrediente_id) ?? -1,
          nombre: r?.nombre ?? '',
          estado: (r?.estado ?? 'A'),
          aplicaComida: (r?.aplicaComida ?? r?.aplica_comida ?? 'N'),
        })) as GrupoIngrediente[];
        this.total = Number(p?.totalRegistros ?? p?.totalElements ?? this.rows.length);
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

    // ---- UI handlers
    setTab(k: TabStatus) { if (this.tab !== k) { this.tab = k; this.page = 0; this.load(); } }
    onSearch(term: string) { this.searchForm.controls.q.setValue(term, { emitEvent: true });}

    onEdit(row: GrupoIngrediente) { }
}
