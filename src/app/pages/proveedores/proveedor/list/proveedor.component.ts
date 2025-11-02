import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Proveedor } from '../../../../interfaces/proveedor.interface';
import { ProveedoresService } from '../../../../services/proveedores.service';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PageLayoutComponent, TitleComponent, TableComponent, SearchComponent, PaginatorComponent } from '../../../../shared';
import { LucideAngularModule, Banknote, Pencil, Plus } from 'lucide-angular';
import { UiButtonComponent } from '../../../../shared/ui/buttons/ui-button/ui-button.component';
import { TabsFilterComponent } from '../../../../shared/ui/tabs-filter/tabs-filter.component';
import { ColumnDef, TabStatus } from '../../../../shared/ui/table/column-def';
import { BaseListComponent } from '../../../../shared/base/base-list.component';

@Component({
  selector: 'app-proveedores-list',
  standalone: true,
  imports: [ CommonModule, RouterLink, ReactiveFormsModule,
    PageLayoutComponent, TitleComponent, TableComponent, SearchComponent, PaginatorComponent,
    LucideAngularModule, UiButtonComponent, TabsFilterComponent ],
  templateUrl: './proveedor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush   
})

export default class ProveedoresListPage extends BaseListComponent implements OnInit {
  private api = inject(ProveedoresService);
  private cdr = inject(ChangeDetectorRef);

  titleLabel = 'Proveedores';
  subTitleLabel = 'Administración de proveedores';

  // UI
  tab: TabStatus = 'all';
  rows: Proveedor[] = [];

  // Íconos
  Banknote = Banknote;
  Pencil = Pencil;
  Plus = Plus;

  searchForm = new FormGroup({
    q: new FormControl<string>('', { nonNullable: true }),
  });

  columns: ColumnDef<Proveedor>[] = [
    { key: 'nombre', header: 'Nombre', sortable: true },
    { key: 'ruc', header: 'RUC / Cédula', sortable: true },
    { key: 'telefono', header: 'Teléfono', sortable: true },
    { key: 'estado', header: 'Estado', widthPx: 140, sortable: true, type: 'badge', badgeMap: { A: 'ok', I: 'warn' }, valueMap: { A: 'Activo', I: 'Inactivo' }, align: 'center'},
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
    if (this.tab === 'active')   filtros.push({ llave: 'estado', operacion: '=', valor: 'A' });
    if (this.tab === 'inactive') filtros.push({ llave: 'estado', operacion: '=', valor: 'I' });

    const term = this.searchForm.controls.q.value.trim();
    if (term) {
      const n = Number(term);
      if (!Number.isNaN(n) && n > 0) {
        // Si es un número válido, buscar solo por ID
        filtros.push({ llave: 'id', operacion: '=', valor: n });
      } else {
        // Si no es un número, buscar por nombre
        filtros.push({ llave: 'nombre', operacion: '%', valor: term });
      }
    }

    this.api.buscarPaginado(
      { page: this.page, size: this.pageSize, orderBy: this.sortKey, direction: this.sortDir },
      filtros
    ).subscribe({
      next: (p) => {
        const contenido = (p?.contenido ?? []) as any[];
        this.rows = contenido.map(r => ({
          id: (r?.id ?? r?.proveedorId ?? r?.proveedor_id) ?? -1,
          nombre: r?.nombre ?? '',
          ruc: r?.ruc ?? '',
          telefono: r?.telefono ?? '',
          email: r?.mail ?? '',
          estado: (r?.estado ?? 'A'),
        })) as Proveedor[];
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

  // ---- UI handlers
  setTab(k: TabStatus) { if (this.tab !== k) { this.tab = k; this.page = 0; this.load(); } }
  onSearch(term: string) { this.searchForm.controls.q.setValue(term, { emitEvent: true });}

  onEdit(row: Proveedor) { }
  onPay(row: Proveedor)  { }
}
