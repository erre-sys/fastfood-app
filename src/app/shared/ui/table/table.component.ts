import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import {
  NgIf, NgFor, NgClass, NgTemplateOutlet, NgSwitch, NgSwitchCase, NgSwitchDefault,
  DatePipe, CurrencyPipe
} from '@angular/common';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';
import { ColumnDef, TableSort } from './column-def';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    NgIf, NgFor, NgClass, NgTemplateOutlet, NgSwitch, NgSwitchCase, NgSwitchDefault,
    LucideAngularModule, DatePipe, CurrencyPipe
  ],
  templateUrl: './table.component.html',
})
export class TableComponent {
  @Input() columns: ColumnDef[] = [];
  @Input() rows: any[] = [];
  @Input() loading = false;

  /** Texto del estado vacío */
  @Input() emptyText = 'No hay datos';

  /** Orden actual (controlado por el padre) */
  @Input() sort?: TableSort;
  @Output() sortChange = new EventEmitter<TableSort>();

  /** Plantilla de acciones por fila */
  @Input() actionsTpl?: TemplateRef<any>;

  /** Etiqueta accesible de la tabla (para <caption>) */
  @Input() ariaLabel = 'Listado';

  /** Clave para trackear filas (si no hay id) */
  @Input() rowIdKey: string = 'id';

  ChevronDown = ChevronDown;

  /** Anuncio de orden (live region) */
  sortAnnouncement = '';

  trackByCol = (_: number, c: ColumnDef) => c.key;

  rowTrackBy = (_: number, r: any) => {
    const k = this.rowIdKey;
    return r && r[k] != null ? r[k] : r?.id ?? r;
  };

  /** aria-sort pertenece al TH */
  ariaSort(c: ColumnDef) {
    if (!this.sort || this.sort.key !== c.key) return 'none';
    return this.sort.dir === 'asc' ? 'ascending' : 'descending';
  }

  /** Etiqueta del botón de ordenar */
  sortBtnAria(c: ColumnDef) {
    const base = `Ordenar por ${c.header}`;
    if (!this.sort || this.sort.key !== c.key) return base;
    return `${base} (${this.sort.dir === 'asc' ? 'ascendente' : 'descendente'})`;
  }

  onSort(c: ColumnDef) {
    if (!c.sortable) return;

    let next: TableSort;
    if (!this.sort || this.sort.key !== c.key) {
      next = { key: c.key, dir: 'asc' };
    } else {
      next = { key: c.key, dir: this.sort.dir === 'asc' ? 'desc' : 'asc' };
    }

    this.sortAnnouncement = `Ordenado por ${c.header} (${next.dir === 'asc' ? 'ascendente' : 'descendente'})`;
    this.sortChange.emit(next);
  }

  /** Clase de alineación: si es money → right, si no usa align */
  cellAlignClass(c: ColumnDef) {
    if (c.type === 'money') return 'text-right';
    if (c.align === 'right') return 'text-right';
    if (c.align === 'center') return 'text-center';
    return '';
  }

  /** Badge “status” genérico como fallback si no hay valueMap/badgeMap */
  statusTone(c: ColumnDef, r: any): { label: string; cls: string } {
    const raw = (r?.[c.key] ?? '').toString().trim().toUpperCase();
    switch (raw) {
      case 'A': return { label: 'Activo',    cls: 'pill--success' };
      case 'S': return { label: 'Si',        cls: 'pill--success' };
      case 'P': return { label: 'Pendiente', cls: 'pill--warning' };
      case 'I': return { label: 'Inactivo',  cls: 'pill--warning' };
      case 'N': return { label: 'No',        cls: 'pill--muted'   };
      default:  return { label: raw || '—',  cls: 'pill--muted'   };
    }
  }
}
