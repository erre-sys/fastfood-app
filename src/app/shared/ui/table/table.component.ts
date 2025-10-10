import { Component, EventEmitter, Input, Output, TemplateRef} from '@angular/core';
import { NgIf, NgFor, NgClass, NgTemplateOutlet, NgSwitch, NgSwitchCase, NgSwitchDefault,} from '@angular/common';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';

export type Align = 'left' | 'center' | 'right';
export type Dir = 'asc' | 'desc';

export interface TableSort {
  key: string;
  dir: Dir;
}

export interface ColumnDef {
  key: string;
  header: string;
  widthPx?: number;
  align?: Align;
  type?: 'text' | 'badge' | 'status'; 
  badgeMap?: Record<string, 'ok' | 'warn' | 'danger' | 'muted'>; 
  sortable?: boolean;
  valueMap?: Record<string, string>; 
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, NgSwitch, NgSwitchCase, NgTemplateOutlet, NgSwitchDefault, LucideAngularModule],
  templateUrl: './table.component.html',
})
export class TableComponent {
  @Input() columns: ColumnDef[] = [];
  @Input() rows: any[] = [];
  @Input() loading = false;

  @Input() emptyText = 'No hay datos';
  @Input() sort?: TableSort;
  @Output() sortChange = new EventEmitter<TableSort>();

  @Input() actionsTpl?: TemplateRef<any>;

  ChevronDown = ChevronDown;

  trackByCol = (_: number, c: ColumnDef) => c.key;
  rowTrackBy = (_: number, r: any) => r?.id ?? r;

  ariaSort(c: ColumnDef) {
    if (!this.sort || this.sort.key !== c.key) return 'none';
    return this.sort.dir === 'asc' ? 'ascending' : 'descending';
  }

  onSort(c: ColumnDef) {
    if (!c.sortable) return;
    if (!this.sort || this.sort.key !== c.key) {
      this.sortChange.emit({ key: c.key, dir: 'asc' });
    } else {
      this.sortChange.emit({
        key: c.key,
        dir: this.sort.dir === 'asc' ? 'desc' : 'asc',
      });
    }
  }

  statusTone(c: ColumnDef, r: any): { label: string; cls: string } {
    const raw = (r?.[c.key] ?? '').toString().trim().toUpperCase();
    switch (raw) {
      case 'A':
        return { label: 'Activo', cls: 'pill--success' };
      case 'S':
        return { label: 'Si', cls: 'pill--success' };
      case 'P':
        return { label: 'Pendiente', cls: 'pill--warning' };
      case 'I':
        return { label: 'Inactivo', cls: 'pill--warn' };
      case 'N':
        return { label: 'No', cls: 'pill--muted' };
      default:
        return { label: raw || '—', cls: 'pill--muted' };
    }
  }
}
