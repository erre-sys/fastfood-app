import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import {
  LucideAngularModule,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-angular';

type PagerSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, LucideAngularModule],
  templateUrl: './paginator.component.html'
})
export class PaginatorComponent {
  /* Datos */
  @Input() from = 0;
  @Input() to = 0;
  @Input() total = 0;

  @Input() pageIndex = 0;             // 0-based
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [10, 20, 30, 50];

  /** total de páginas (>=1). Si no lo pasas, lo calculo con total/pageSize */
  @Input() maxPage?: number;

  /* UI / Accesibilidad */
  @Input() controlsId?: string;       // id del grid/tabla que controla
  @Input() ariaLabel = 'Paginación';
  @Input() sizeLabel = 'Por página';
  @Input() pageText = 'Pág.';         // “Pág. 1 de 5”
  @Input() ofText = 'de';
  @Input() size: PagerSize = 'md';

  /** Mostrar/ocultar bloques */
  @Input() showInfo = true;
  @Input() showSize = true;
  @Input() showNav = true;
  @Input() showEdges = true;          // « » 
  @Input() hideOnSinglePage = false;  // oculta todo si sólo hay 1 página

  /* Eventos */
  @Output() sizeChange = new EventEmitter<number>();
  @Output() first = new EventEmitter<void>();
  @Output() prev  = new EventEmitter<void>();
  @Output() next  = new EventEmitter<void>();
  @Output() last  = new EventEmitter<void>();

  // Íconos
  ChevronsLeft = ChevronsLeft;
  ChevronLeft = ChevronLeft;
  ChevronRight = ChevronRight;
  ChevronsRight = ChevronsRight;

  /* Derivados */
  get totalPages(): number {
    if (this.maxPage && this.maxPage > 0) return this.maxPage;
    if (this.pageSize <= 0) return 1;
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }
  get canPrev() { return this.pageIndex > 0; }
  get canNext() { return this.pageIndex + 1 < this.totalPages; }
  get infoOnly() { return this.showInfo && !this.showSize && !this.showNav; }

  onSizeChange(v: string | number) {
    const n = typeof v === 'string' ? parseInt(v, 10) : v;
    if (Number.isFinite(n)) this.sizeChange.emit(n as number);
  }

  goFirst() { if (this.canPrev) this.first.emit(); }
  goPrev()  { if (this.canPrev) this.prev.emit();  }
  goNext()  { if (this.canNext) this.next.emit();  }
  goLast()  { if (this.canNext) this.last.emit();  }

  // Soporte teclado en el contenedor de controles
  onKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Home': this.goFirst(); e.preventDefault(); break;
      case 'End':  this.goLast();  e.preventDefault(); break;
      case 'ArrowLeft': this.goPrev(); e.preventDefault(); break;
      case 'ArrowRight': this.goNext(); e.preventDefault(); break;
    }
  }
}
