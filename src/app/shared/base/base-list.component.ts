import { Directive, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Dir, TableSort } from '../ui/table/column-def';

/**
 * Clase base abstracta para componentes de lista con paginación
 * Centraliza la lógica común de:
 * - Paginación (prev, next, maxPage, from, to)
 * - Ordenamiento (onSort)
 * - Búsqueda (onSearch)
 * - Navegación (goBack)
 *
 * Uso:
 * export default class MiComponente extends BaseListComponent implements OnInit {
 *   constructor() {
 *     super();
 *   }
 *
 *   protected abstract load(): void; // Implementar carga de datos
 * }
 */
@Directive()
export abstract class BaseListComponent implements OnDestroy {
  protected readonly destroyed$ = new Subject<void>();

  // Estado de paginación
  page = 0;
  pageSize = 10;
  total = 0;

  // Estado de ordenamiento
  sortKey: string = 'id';
  sortDir: Dir = 'asc';

  // Estado de carga
  loading = false;

  // Método abstracto que cada componente debe implementar
  protected abstract load(): void;

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  // ============================================================================
  // PAGINACIÓN
  // ============================================================================

  prev(): void {
    if (this.page > 0) {
      this.page--;
      this.load();
    }
  }

  next(): void {
    if (this.page + 1 < this.maxPage()) {
      this.page++;
      this.load();
    }
  }

  maxPage(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  from(): number {
    return this.total ? this.page * this.pageSize + 1 : 0;
  }

  to(): number {
    return Math.min((this.page + 1) * this.pageSize, this.total);
  }

  setPageSize(n: number): void {
    if (n > 0 && n !== this.pageSize) {
      this.pageSize = n;
      this.page = 0;
      this.load();
    }
  }

  // ============================================================================
  // ORDENAMIENTO
  // ============================================================================

  onSort(s: TableSort): void {
    if (!s?.key) return;
    this.sortKey = s.key;
    this.sortDir = s.dir as Dir;
    this.page = 0;
    this.load();
  }

  // ============================================================================
  // NAVEGACIÓN
  // ============================================================================

  goBack(): void {
    history.back();
  }
}
