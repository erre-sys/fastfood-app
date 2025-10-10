import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import {
  LucideAngularModule,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-angular';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [NgIf, NgFor, LucideAngularModule],
  templateUrl: './paginator.component.html',
})
export class PaginatorComponent {
  @Input() from = 0;
  @Input() to = 0;
  @Input() total = 0;
  @Input() pageIndex = 0; 
  @Input() pageSize = 10;
  @Input() maxPage = 1;
  @Input() pageSizeOptions = [10, 20, 35, 50];

  @Output() sizeChange = new EventEmitter<number>();
  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  // icons
  ChevronLeft = ChevronLeft;
  ChevronRight = ChevronRight;

  onSizeChange(v: string | number) {
    const n = typeof v === 'string' ? parseInt(v, 10) : v;
    if (Number.isFinite(n)) this.sizeChange.emit(n as number);
  }
  goPrev() {
    this.prev.emit();
  }
  goNext() {
    this.next.emit();
  }
}
